interface IUploadButton {
  text: string;
  size?: 'large' | 'middle' | 'small';
  type?: 'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default';
  allowedFileType?: string;
  fileCount?: number;
  handleUpload: (file: TDocsOrMultimedia) => void;
  onRemove?: (file: TDocsOrMultimedia) => void;
  disabled?: boolean;
  icon?: ReactNode;
  showUploadList?: boolean | IUploadListOptions;
  className?: string;
  buttonStyleClass?: string;
  resetFileList?: boolean;
  isLoading?: boolean;
  dataTestID?: string;
}

interface IUploadListOptions {
  showPreviewIcon?: boolean;
  showDownloadIcon?: boolean;
  showRemoveIcon?: boolean;
  previewIcon?: ReactNode | ((file: TObject) => ReactNode);
  removeIcon?: ReactNode | ((file: TObject) => ReactNode);
  downloadIcon?: ReactNode | ((file: TObject) => ReactNode);
}

interface IUploadView {
  icon?: ReactNode;
  fileLink: string;
  removeFile?: () => void;
  className?: string;
  text?: string;
  isRemoving?: boolean;
  dataTestIdPath?: string;
  dataTestIdRemove?: string;
}
