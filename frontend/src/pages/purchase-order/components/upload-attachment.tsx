import { AttachFile } from '@mui/icons-material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { UploadButton, UploadView } from 'src/components/upload';
import { PO_STATUS } from 'src/constants/purchase-order';
import { FILE_TYPE } from 'src/constants/upload-component';
import { useAttachFile, useDetachFile } from 'src/hooks/usePurchOrder';
import { getPOStatus } from 'src/store/selectors/features/purchase-order';
import {
  attachInvoices,
  removeInvoices
} from 'src/store/slices/features/purchase-order';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';
import { getFormData } from 'src/utils/upload-helpers';

export const UploadPOAttachment: React.FC<IUploadAttachment> = ({
  id,
  path,
  fieldName,
  alignment,
  dataTestID,
  dataTestIdPath,
  dataTestIdRemove
}) => {
  const [clearFiles, setClearFiles] = useState(false);
  const dispatch = useDispatch();
  const [t] = useTranslation('po');

  const status = useSelector(getPOStatus);

  const {
    isLoading: isAttachLoading,
    isError: isAttachError,
    error: attachError,
    mutateAsync: attachFile
  } = useAttachFile();

  const {
    isLoading: isDetachLoading,
    isError: isDetachError,
    error: detachError,
    mutateAsync: detachFile
  } = useDetachFile();

  const uploadFile = async (file: TDocsOrMultimedia) => {
    const fileData: IUpload = {
      name: 'po-attach',
      [fieldName]: file,
      id: id
    };

    const formData = getFormData(fileData);

    try {
      const res: TObject = await attachFile(formData);

      const fileToSet: IUpload = {
        fileName: file?.name,
        path: res?.data?.path,
        fieldName
      };

      dispatch(attachInvoices({ fileToSet }));
      setClearFiles(false);
    } catch (error: TObject | string) {
      if (isAttachError) {
        const { data } = attachError as TObject;
        throw new Error(data?.data?.message || data?.data?.reason);
      }

      throw new Error(error?.data?.message || error?.data?.reason);
    }
  };

  const handleRemoveFile = () => {
    const fileData: IUpload = {
      name: 'po-detach',
      fieldName,
      id: id
    };

    detachFile(fileData);

    if (isDetachError) {
      const { data: error } = detachError as Record<string, any>;
      showErrorMessage(error?.reason || error?.message);
      return;
    }

    dispatch(removeInvoices({ fileData }));
    showSuccessMessage('File removed');
    setClearFiles(true);
  };

  return (
    <div
      className={`flex items-center text-blue-blue3 ${alignment && alignment}`}
    >
      {path ? (
        <UploadView
          dataTestIdPath={dataTestIdPath}
          dataTestIdRemove={dataTestIdRemove}
          fileLink={path || ''}
          removeFile={handleRemoveFile}
          isRemoving={isDetachLoading}
        />
      ) : null}
      <UploadButton
        dataTestID={dataTestID}
        icon={<AttachFile />}
        text={t('po.attachDocument')}
        allowedFileType={FILE_TYPE.FILE_ATTACHMENT_PO}
        handleUpload={uploadFile}
        className={'text-blue-blue2'}
        disabled={status === PO_STATUS.CANCELLED}
        showUploadList={false}
        resetFileList={clearFiles}
        isLoading={isAttachLoading}
      />
    </div>
  );
};
