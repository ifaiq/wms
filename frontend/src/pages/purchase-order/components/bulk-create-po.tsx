import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBulkUploadPOs } from 'src/hooks';
import { UploadButton } from 'src/components/upload';
import { FileUploadOutlined } from '@mui/icons-material';
import { OverlayLoader } from 'src/components/loader';
import { ErrorArrayHandler, getFormData } from 'src/utils/upload-helpers';
import { showSuccessMessage } from 'src/utils/alerts';
import { FILE_TYPE } from 'src/constants/upload-component';
import { ErrorModal } from 'src/components';
import { TEST_ID_KEY_PO } from 'src/constants/purchase-order';

export const BulkCreatePO: React.FC<IBulkCreate> = ({ refetch }) => {
  const [t] = useTranslation('po');

  const [isFileList, setIsFileList] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const {
    isLoading,
    isSuccess,
    isError,
    error,
    mutateAsync: createBulkUpload
  } = useBulkUploadPOs();

  useEffect(() => {
    if (isSuccess) {
      showSuccessMessage('Purchase Orders created successfully!');
      refetch({ cancelRefetch: true });

      setIsFileList(true);
    }
  }, [isSuccess]);

  useEffect(() => {
    const errorData = error as TObject;
    let errorArr = [];

    if (isError) {
      if (errorData?.data?.context) errorArr = ErrorArrayHandler(errorData);
      if (typeof errorData?.data?.reason !== 'string')
        errorArr = errorData?.data?.reason;

      setErrorList(errorArr);
      setShowErrorModal(true);
      setIsFileList(true);
    }
  }, [isError]);

  const bulkUpload = async (file: TDocsOrMultimedia) => {
    setIsFileList(false);
    const data = { file };
    const formData = getFormData(data);

    try {
      await createBulkUpload(formData);
    } catch (e: TObject) {
      console.error(e);
      throw new Error(e.message);
    }
  };

  const hideErrorModal = () => setShowErrorModal(false);

  return (
    <>
      {isLoading && <OverlayLoader />}
      <UploadButton
        text={t('po.bulkCreate')}
        icon={<FileUploadOutlined />}
        allowedFileType={FILE_TYPE.CSV}
        handleUpload={bulkUpload}
        className={'text-white'}
        resetFileList={isFileList}
        showUploadList={false}
        size="large"
        buttonStyleClass={'bg-blue-blue2 h-12 text-white rounded-lg'}
        dataTestID={`${TEST_ID_KEY_PO}BulkCreatePO`}
      />
      <ErrorModal
        title="Error(s) found while uploading bulk create PO CSV!"
        visible={showErrorModal}
        onConfirm={hideErrorModal}
        errorList={errorList}
      />
    </>
  );
};
