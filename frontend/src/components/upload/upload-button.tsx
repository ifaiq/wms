import React, { useState, useRef, useEffect } from 'react';
import { Upload, Button, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { FILE_STATUS } from '../../constants/upload-component';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';

const { confirm } = Modal;

export const UploadButton: React.FC<IUploadButton> = ({
  text,
  icon,
  allowedFileType,
  fileCount = 1,
  disabled = false,
  showUploadList = true,
  handleUpload,
  onRemove,
  className,
  buttonStyleClass,
  resetFileList = false,
  isLoading = false,
  size = 'small',
  type = 'text',
  dataTestID
}) => {
  const [filesList, setFilesList] = useState<TArrayOfObjects>([]);
  const [showFileDialog, setShowFileDialog] = useState(false);
  const buttonRef: any = useRef(null);
  const filesCheck = filesList.length < fileCount;

  useEffect(() => {
    if (resetFileList && filesList.length > 0) setFilesList([]);
  }, [resetFileList]);

  const handleCustomRequest = async (options: TObject) => {
    const { file, onError, onSuccess } = options;

    try {
      await handleUpload(file);
      onSuccess('Uploaded Successfully');
    } catch (error: TObject | string) {
      onError('Upload failed! Something went wrong');
      showErrorMessage(`Reason: ${error?.data?.message || error}`);
    }
  };

  const isFileValid = (file: TObject) => {
    const imageAllowed = file.type?.split('/')[0] === 'image';

    if (allowedFileType?.includes('image') && imageAllowed) {
      return true;
    }

    const allowedExtensions = allowedFileType?.split(',');
    const fileExtension = file.name.split('.');

    const isValid = allowedExtensions?.find(
      (x: string) => x.trim() === `.${fileExtension[fileExtension.length - 1]}`
    );

    if (!isValid) showErrorMessage('File Type Not Supported');

    return isValid || Upload.LIST_IGNORE;
  };

  const handleChange = (options: TObject) => {
    const { file, fileList } = options;
    const fileStatus = file.status;

    setFilesList(fileList);

    if (fileStatus === FILE_STATUS.DONE) {
      showSuccessMessage(`${file.name} uploaded successfully`);

      if (!filesCheck) setShowFileDialog(false);
    }

    if (fileStatus === FILE_STATUS.ERROR) {
      showErrorMessage(`${file.name} upload failed`);

      // Removes the relevant files from filesList upon error
      if (fileCount === 1) setFilesList([]);
      else if (fileCount > 1) {
        const errorFileIndex = filesList.findIndex(
          (item: TObject) => item?.uid === file?.uid
        );

        filesList.splice(errorFileIndex, 1);
      }
    }

    if (fileStatus === FILE_STATUS.REMOVED) {
      console.log('File Removed: ', file, fileList);
    }
  };

  const handleReOpenFileDialog = () => {
    buttonRef.current!.click();
  };

  const onOk = () => {
    setTimeout(() => {
      setShowFileDialog(true);
      handleReOpenFileDialog();
    }, 100);
  };

  const onCancel = () => {
    console.log('Cancel');
  };

  const handleWarningModal = () => {
    if (!filesCheck && !showFileDialog) {
      confirm({
        title: 'Are you sure to continue?',
        icon: <ExclamationCircleOutlined />,
        content: 'This upload will overwrite the current data/file!',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'No',
        onOk,
        onCancel
      });
    }
  };

  const theme = disabled ? 'text-[#B4BAC0]' : className;

  return (
    <div className="w-40">
      <Upload
        data-test-id={dataTestID}
        accept={allowedFileType}
        beforeUpload={isFileValid}
        customRequest={handleCustomRequest}
        openFileDialogOnClick={filesCheck || showFileDialog}
        fileList={filesList}
        showUploadList={showUploadList}
        onChange={handleChange}
        maxCount={fileCount}
        onRemove={onRemove}
      >
        <Button
          ref={buttonRef}
          type={type}
          size={size}
          disabled={disabled}
          icon={icon}
          loading={isLoading}
          onClick={handleWarningModal}
          className={`ml-2 ${theme} ${buttonStyleClass}`}
        >
          <span className={`pl-1 ${theme}`}> {text} </span>
        </Button>
      </Upload>
    </div>
  );
};
