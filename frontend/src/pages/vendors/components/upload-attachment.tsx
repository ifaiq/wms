import { AttachFile } from '@mui/icons-material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { UploadButton } from 'src/components/upload';
import { UploadView } from 'src/components/upload/upload-view';
import { FILE_TYPE } from 'src/constants/upload-component';
import { useAttachVendorFile, useDetachVendorFile } from 'src/hooks/useVendor';
import {
  attachInvoices,
  removeInvoices
} from 'src/store/slices/features/vendors';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';
import { getFormData } from 'src/utils/upload-helpers';

export const UploadVendorAttachment: React.FC<IUploadAttachment> = ({
  id,
  path,
  fieldName,
  alignment,
  dataTestID,
  dataTestIdPath,
  dataTestIdRemove
}) => {
  const dispatch = useDispatch();
  const [t] = useTranslation('vendor');
  const [clearFiles, setClearFiles] = useState(false);

  const {
    isError: isAttachError,
    error: attachError,
    isLoading: isAttachLoading,
    mutateAsync: attachFile
  } = useAttachVendorFile();

  const { mutateAsync: detachFile, isLoading: isDetachLoading } =
    useDetachVendorFile();

  const uploadFile = async (file: TDocsOrMultimedia, field: string) => {
    const fileData: IUpload = {
      name: 'vendor-attach',
      [field]: file,
      id: id
    };

    const formData = getFormData(fileData);

    try {
      const res: TObject = await attachFile(formData);

      const fileToSet = {
        fileName: file?.name,
        path: res?.data?.path,
        fieldName: field
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

  const handleRemoveFile = async (field: string) => {
    const fileData: IUpload = {
      name: 'vendor-detach',
      fieldName: field,
      id: id
    };

    try {
      const res = await detachFile(fileData);
      dispatch(removeInvoices({ fileData }));
      showSuccessMessage('File removed !');
      setClearFiles(true);
      return res;
    } catch (error: TObject) {
      showErrorMessage(error?.data?.reason);
    }
  };

  return (
    <>
      <div
        className={`flex items-center cursor-pointer text-blue-blue3 ${
          alignment && alignment
        }`}
      >
        {path && (
          <UploadView
            dataTestIdPath={dataTestIdPath}
            dataTestIdRemove={dataTestIdRemove}
            fileLink={path}
            removeFile={() => handleRemoveFile(fieldName)}
            isRemoving={isDetachLoading}
          />
        )}
        <UploadButton
          dataTestID={dataTestID}
          icon={<AttachFile />}
          text={t('vendor.attachDocument')}
          allowedFileType={FILE_TYPE.FILE_ATTACHMENT_VENDOR}
          handleUpload={(file: TDocsOrMultimedia) =>
            uploadFile(file, fieldName)
          }
          showUploadList={false}
          resetFileList={clearFiles}
          isLoading={isAttachLoading}
          className={'text-blue-blue2'}
        />
      </div>
    </>
  );
};
