import { FileUploadOutlined } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorModal, OverlayLoader, UploadButton } from 'src/components';
import { TEST_ID_KEY_TRANSFER } from 'src/constants/transfers';
import { FILE_TYPE } from 'src/constants/upload-component';
import { useBulkCreateTransfer } from 'src/hooks';
import { showSuccessMessage } from 'src/utils/alerts';
import { ErrorArrayHandler, getFormData } from 'src/utils/upload-helpers';

export const BulkCreateTransfers: React.FC<IBulkCreate> = ({ refetch }) => {
  const [t] = useTranslation('transfer');

  const [isFileList, setIsFileList] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorList, setErrorList] = useState([]);

  const {
    isLoading,
    isSuccess,
    isError,
    error,
    mutateAsync: bulkCreateTransfers
  } = useBulkCreateTransfer();

  useEffect(() => {
    if (isSuccess) {
      showSuccessMessage('Transfers created successfully!');
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

  const handleBulkCreate = async (file: TDocsOrMultimedia) => {
    setIsFileList(false);
    const fileData = { file };
    const formData = getFormData(fileData);

    try {
      await bulkCreateTransfers(formData);
    } catch (e: TObject) {
      console.error(e);
      throw new Error(e.message);
    }
  };

  const hideErrorModal = () => setShowErrorModal(false);

  return (
    <div className="mr-24">
      {isLoading && <OverlayLoader />}
      <UploadButton
        allowedFileType={FILE_TYPE.CSV}
        text={t('transfer.bulkCreateTransfer')}
        size="large"
        icon={<FileUploadOutlined />}
        handleUpload={handleBulkCreate}
        className={'text-white'}
        buttonStyleClass={'bg-blue-blue2 h-12 text-white rounded-lg'}
        showUploadList={false}
        resetFileList={isFileList}
        dataTestID={`${TEST_ID_KEY_TRANSFER}BulkCreateTransfers`}
      />
      <ErrorModal
        title="Error(s) found while uploading bulk create transfers CSV!"
        visible={showErrorModal}
        onConfirm={hideErrorModal}
        errorList={errorList}
      />
    </div>
  );
};
