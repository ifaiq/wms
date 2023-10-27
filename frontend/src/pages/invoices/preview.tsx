import React, { useEffect, useState } from 'react';
import 'antd/dist/antd.css';
import { useTranslation } from 'react-i18next';
import {
  ButtonIconOutlined,
  IconButtonPrimary,
  OverlayLoader,
  TopBar
} from 'src/components';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { useSelector } from 'react-redux';
import {
  getInvoiceDNType,
  getInvoiceType,
  getIsApproveInvoiceAllowed,
  getPreviewInvoicePayload,
  getServiceInvoice
} from 'src/store/selectors/features/service-invoice';
import { getUserId } from 'src/store/selectors/features/auth';
import {
  getVendorCountry,
  getVendorId
} from 'src/store/selectors/features/vendor';
import { useHistory, useParams } from 'react-router-dom';
import {
  useApproveInvoice,
  useCreateDraftInvoice,
  useDeleteDraftInvoice,
  useGetInvoicePreview
} from 'src/hooks/useInvoice';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';
import { DRAFT_PLACEHOLDER } from 'src/constants/invoice';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { AddTask, Create, Delete } from '@mui/icons-material';

export const PreviewInvoiceScreen: React.FC = () => {
  const [t] = useTranslation('invoice');
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const invoiceData = useSelector(getServiceInvoice);
  const invoiceType = useSelector(getInvoiceType);
  const debitNoteType = useSelector(getInvoiceDNType);
  const userId = useSelector(getUserId);
  const vendorId = useSelector(getVendorId);
  const isApproveInvoice = useSelector(getIsApproveInvoiceAllowed);
  const previewInvoicePayload = useSelector(getPreviewInvoicePayload);
  const country = useSelector(getVendorCountry);
  const response = useGetInvoicePreview(previewInvoicePayload);

  const {
    isLoading: isPreviewLoading,
    isSuccess: isPreviewSuccess,
    data,
    isError: isPreviewError
  } = response;

  const [pdfBlob, setPdfBlob] = useState<Uint8Array>();

  const {
    isSuccess: isSuccessApprove,
    isError: isErrorApprove,
    error: errorApprove,
    mutateAsync: createInvoiceMutation,
    isLoading: isLoadingApprove
  } = useApproveInvoice();

  const {
    isSuccess: isSuccessCreate,
    isError: isErrorCreate,
    error: errorCreate,
    mutateAsync: createDraftInvoiceMutation,
    isLoading: isLoadingCreate
  } = useCreateDraftInvoice();

  const {
    isSuccess: isSuccessDelete,
    isError: isErrorDelete,
    error: errorDelete,
    mutateAsync: deleteDraftInvoiceMutation,
    isLoading: isLoadingDelete
  } = useDeleteDraftInvoice();

  useEffect(() => {
    if (data) setPdfBlob(data?.data);
  }, [data, isPreviewSuccess]);

  const deleteDraftInvoice = () => {
    if (id && id !== 'draft') {
      deleteDraftInvoiceMutation(id);
    }
  };

  const approveInvoice = () => {
    const invoiceTypeToSave = debitNoteType ? debitNoteType : invoiceType;
    createInvoiceMutation({
      invoiceType: invoiceTypeToSave,
      countryCode: country,
      payload: invoiceData
    });
  };

  const createDraftInvoice = () => {
    const invoiceTypeToSave = debitNoteType ? debitNoteType : invoiceType;
    createDraftInvoiceMutation({
      type: invoiceTypeToSave,
      createdById: userId,
      vendorId: vendorId,
      detail: invoiceData
    });
  };

  useEffect(() => {
    if (isSuccessCreate || isSuccessDelete || isSuccessApprove) {
      showSuccessMessage();
      history.push(`/invoices`);
    }
  }, [isSuccessCreate, isSuccessDelete]);

  useEffect(() => {
    if (isSuccessApprove) {
      deleteDraftInvoice();
    }
  }, [isSuccessApprove]);

  const displayActionErrorMessage = (error: any) => {
    const errorData = error as Record<string, any>;

    if (errorData?.data?.context?.length) {
      errorData.data.context.forEach(({ field }: any) => {
        showErrorMessage(field);
      });
    } else {
      showErrorMessage(errorData?.statusText);
    }
  };

  useEffect(() => {
    if (isErrorDelete) displayActionErrorMessage(errorDelete);
  }, [isErrorDelete]);

  useEffect(() => {
    if (isErrorCreate) displayActionErrorMessage(errorCreate);
  }, [isErrorCreate]);

  useEffect(() => {
    if (isErrorApprove) displayActionErrorMessage(errorApprove);
  }, [isErrorApprove]);

  const pdfViewerStyles = {
    height: '75vh'
  };

  const navigateToEditScreen = () => {
    if (id && id === DRAFT_PLACEHOLDER)
      history.push(`/invoices/create/${DRAFT_PLACEHOLDER}`);
    else if (id && id !== DRAFT_PLACEHOLDER)
      history.push(`/invoices/create/${id}`);
  };

  return (
    <>
      <TopBar title={t('invoice.title')} />
      <div className="flex justify-end pl-10">
        <div className=" mx-3">
          <ButtonIconOutlined
            icon={<Create className=" mr-2" />}
            text={t('invoice.edit')}
            style={{ color: 'red' }}
            size="small"
            onClick={navigateToEditScreen}
          />
        </div>

        {id === DRAFT_PLACEHOLDER && (
          <ButtonIconOutlined
            icon={<CheckCircleOutlineIcon className=" mr-2" />}
            size="small"
            text={t('invoice.save')}
            onClick={() => createDraftInvoice()}
          />
        )}

        {id !== DRAFT_PLACEHOLDER && (
          <IconButtonPrimary
            icon={<Delete className=" mr-2" />}
            text={t('invoice.delete')}
            onClick={deleteDraftInvoice}
            style={{ backgroundColor: 'red !important' }}
          />
        )}

        {id !== DRAFT_PLACEHOLDER && isApproveInvoice && (
          <IconButtonPrimary
            icon={<AddTask className=" mr-2" />}
            style={{ color: 'red' }}
            text={t('invoice.approve')}
            onClick={approveInvoice}
          />
        )}
      </div>

      <div className="mt-14 px-10 w-3/4 mx-auto" style={pdfViewerStyles}>
        {(isLoadingCreate ||
          isLoadingDelete ||
          isLoadingApprove ||
          isPreviewLoading) && <OverlayLoader />}

        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.1.81/build/pdf.worker.min.js">
          {pdfBlob && <Viewer fileUrl={new Uint8Array(pdfBlob!)} />}
        </Worker>
        {isPreviewError && <p> {t('invoice.canNotGeneratePreview')} </p>}
      </div>
    </>
  );
};
