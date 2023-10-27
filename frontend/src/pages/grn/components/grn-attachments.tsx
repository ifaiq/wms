import {
  AddCircleOutlined,
  AttachFile,
  RemoveCircleOutlineOutlined
} from '@mui/icons-material';
import { Form } from 'antd';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ButtonIcon,
  DividerComponent,
  FormElement,
  InputItem,
  UploadButton,
  UploadView,
  DynamicForm
} from 'src/components';
import { FILE_ATTACHMENT_GRN, RECEIPT_DOCUMENT_TYPE } from 'src/constants/grn';
import {
  useAttachGrnInvoice,
  useAttachReturnInvoice,
  useDettachGrnInvoice,
  useDettachReturnInvoice
} from 'src/hooks';
import {
  getReceiptAttachments,
  getReceiptInvoices,
  getGRNIsEdit
} from 'src/store/selectors/features/grn';
import {
  handleAttachments,
  handleInvoices,
  updateGRNEditMode
} from 'src/store/slices/features/grn';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';
import { getFormData } from 'src/utils/upload-helpers';

export const GrnAttachments: React.FC<IGrnAttachments> = ({
  receiptId,
  disabled = false,
  documentType
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [clearFiles, setClearFiles] = useState(false);

  const invoices = useSelector(getReceiptInvoices);
  const attachments = useSelector(getReceiptAttachments);
  const grnEditFlag = useSelector(getGRNIsEdit);

  const {
    isError: isAttachError,
    error: attachError,
    mutateAsync: attachFile
  } = useAttachGrnInvoice();

  const {
    isError: isDetachError,
    error: detachError,
    mutateAsync: detachFile
  } = useDettachGrnInvoice();

  const {
    isError: isAttachReturnError,
    error: attachReturnError,
    mutateAsync: attachReturnFile
  } = useAttachReturnInvoice();

  const {
    isError: isDetachReturnError,
    error: detachReturnError,
    mutateAsync: detachReturnFile
  } = useDettachReturnInvoice();

  const uploadFileHandler = async (
    file: TDocsOrMultimedia,
    attachmentId: number
  ) => {
    const fileData = {
      name: `receipt-attach-${attachmentId}`,
      [`receipt-attach-${attachmentId}`]: file,
      id: receiptId
    };

    const formData = getFormData(fileData);

    try {
      const res: TObject = await (documentType === RECEIPT_DOCUMENT_TYPE.RECEIPT
        ? attachFile(formData)
        : attachReturnFile(formData));

      const fileToSet: IUpload = {
        fileName: file?.name,
        path: res?.data?.path,
        fieldName: `receipt-attach-${attachmentId}`
      };

      attachmentHandler(fileToSet, attachmentId, true);
      formHandler(
        'invoiceNumber',
        invoices[attachmentId]?.invoiceNumber || '',
        attachmentId,
        true
      );
      setClearFiles(false);
    } catch (error: TObject | string) {
      if (isAttachError || isAttachReturnError) {
        const { data } =
          (attachError as TObject) || (attachReturnError as TObject);

        throw new Error(data?.data?.message || data?.data?.reason);
      }

      throw new Error(error?.data?.message || error?.data?.reason);
    }
  };

  const removeFileHandler = async (attachmentId: number, fieldName: string) => {
    const fileData = {
      name: `receipt-dettach-${attachmentId}`,
      fieldName,
      id: receiptId,
      documentType
    };

    await (documentType === RECEIPT_DOCUMENT_TYPE.RECEIPT
      ? detachFile(fileData)
      : detachReturnFile(fileData));

    if (isDetachError || isDetachReturnError) {
      const { data: fileError } =
        (detachError as TObject) || (detachReturnError as TObject);

      showErrorMessage(
        fileError?.context[0]?.field || fileError?.reason || fileError?.message
      );
      return;
    }

    showSuccessMessage('File removed successfully');
    setClearFiles(true);
  };

  const formHandler = (
    key: string,
    value: TNumberOrString | TObject,
    index: number,
    editFlag = false
  ) => {
    if (!grnEditFlag) dispatch(updateGRNEditMode(true));

    const invoicesArr = [...invoices];

    if (editFlag) {
      if (
        invoices[index]?.fieldName === `grn-attach-${index}` ||
        invoices[index]?.fieldName === `receipt-attach-${index}`
      ) {
        invoicesArr[index] = { ...invoicesArr[index], [key]: value };
      } else
        invoicesArr[index] = {
          fieldName: `receipt-attach-${index}`,
          [key]: value
        };
    }

    if (!editFlag) {
      invoicesArr.splice(index, 1);
    }

    dispatch(handleInvoices(invoicesArr));
  };

  const attachmentHandler = (
    value: TNumberOrString | TObject,
    index: number,
    editFlag = false
  ) => {
    if (!grnEditFlag) dispatch(updateGRNEditMode(true));

    const attachmentsArr = [...attachments];

    if (editFlag) {
      if (attachmentsArr[index]) {
        attachmentsArr[index] = { ...attachments[index], ...value };
      } else attachmentsArr[index] = { ...value };
    }

    if (!editFlag) {
      if (attachmentsArr[index]?.fieldName || attachmentsArr[index]?.key)
        removeFileHandler(index, attachments[index]?.fieldName);

      attachmentsArr.splice(index, 1);
    }

    dispatch(handleAttachments(attachmentsArr));
  };

  // Dynamic Component Renderer function
  const renderFunction = (params: IFormRenderer) => {
    const {
      fields,
      operation: { add, remove }
    } = params;

    const fieldLength = fields.length;

    return (
      <>
        {/* Add default component if there are no components */}
        {fieldLength <=
          Math.max(attachments.length - 1, invoices.length - 1, 0) && add()}
        {/* Map all over the components according to data length */}
        {fields.map(({ name }) => (
          <div className="mt-6" key={name}>
            <FormElement label={'Invoice Number'} key={`invoiceNumber${name}`}>
              <InputItem
                dataTestID={`Invoice-${name}`}
                value={invoices[name]?.invoiceNumber}
                placeholder={'Add Invoice No.'}
                onChange={(e: TObject) => {
                  formHandler('invoiceNumber', e.target.value, name, true);
                }}
              />
            </FormElement>
            <div
              className={`flex 
              ${
                (fieldLength > 1 || invoices[name]?.invoiceNumber) &&
                'justify-between'
              } items-center`}
              key={`buttons${name}`}
            >
              <div className={`w-40 h-12 flex justify-center items-center`}>
                <UploadButton
                  icon={<AttachFile />}
                  text="Attach Invoice"
                  className="text-blue-blue2"
                  allowedFileType={FILE_ATTACHMENT_GRN}
                  showUploadList={false}
                  handleUpload={(file) => uploadFileHandler(file, name)}
                  resetFileList={clearFiles}
                />
              </div>
              <UploadView
                text="View Invoice"
                fileLink={attachments[name]?.path}
                removeFile={() => attachmentHandler('', name)}
                className={'text-blue-blue3'}
              />
              {(fieldLength > 1 || invoices[name]?.invoiceNumber) && (
                <ButtonIcon
                  onClick={() => {
                    remove(name);
                    formHandler('', null, name);
                    attachmentHandler('', name);
                  }}
                  icon={<RemoveCircleOutlineOutlined />}
                  text="Remove"
                  size="small"
                  className="!mx-0"
                  type="button"
                />
              )}
            </div>
            {fieldLength > 1 && <DividerComponent type="horizontal" dashed />}
          </div>
        ))}
        {/* Add Section Button Component */}
        {fieldLength <= 1 && <DividerComponent type="horizontal" dashed />}
        <div className="flex justify-end mb-6">
          <ButtonIcon
            onClick={add}
            icon={<AddCircleOutlined />}
            text="Add Section"
            size="small"
            type="button"
          />
        </div>
      </>
    );
  };

  return (
    <DynamicForm
      form={form}
      formName="grnAttachment"
      renderFunction={renderFunction}
      className="w-full h-full max-h-[285px]"
      disabled={disabled}
    />
  );
};
