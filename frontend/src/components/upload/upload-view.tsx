import {
  HighlightOffOutlined,
  InsertDriveFileOutlined
} from '@mui/icons-material';
import { DividerComponent } from '../divider';
import { Loader } from '../loader';

export const UploadView: React.FC<IUploadView> = ({
  icon,
  fileLink,
  removeFile,
  className,
  text = 'View Attachment',
  isRemoving,
  dataTestIdPath,
  dataTestIdRemove
}) => {
  return (
    <>
      {fileLink && (
        <div
          className={`flex border border-[#DFE1E3] rounded-md p-2 w-fit ${className}`}
        >
          {icon ? icon : <InsertDriveFileOutlined />}
          <DividerComponent type="vertical" style={{ height: '24px' }} />
          <a
            data-test-id={dataTestIdPath}
            href={fileLink}
            target="_blank"
            className="pr-2 text-black"
          >
            {text}
          </a>
          {removeFile &&
            (isRemoving ? (
              <Loader />
            ) : (
              <HighlightOffOutlined
                data-test-id={dataTestIdRemove}
                className="cursor-pointer"
                onClick={removeFile}
              />
            ))}
        </div>
      )}
    </>
  );
};
