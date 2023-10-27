import { Divider } from 'antd';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { ButtonPrimary, OverlayLoader, TopBar } from 'src/components';
import {
  getInvoiceDNType,
  getInvoiceType,
  getIsInvoiceEdited,
  getServiceInvoice,
  getServiceInvoiceProducts
} from 'src/store/selectors/features/service-invoice';
import { resetPOData } from 'src/store/slices/features/purchase-order';
import { useResetState } from '../../hooks';
import { ServiceOrderForm, ServiceOrderServiceTable } from './components';
import { calculateInvoiceTotals } from './helper';
import { S_INV_KEYS, DRAFT_PLACEHOLDER } from 'src/constants/invoice';
import {
  bulkUpdateSOData,
  setIsInvoiceEdited
} from 'src/store/slices/features/service-invoice';
import { INVOICES_TYPES } from 'src/constants/common';
import { DebitNoteTables } from './components';
import { useUpdateDraftInvoice } from 'src/hooks/useInvoice';
import { getUserId } from 'src/store/selectors/features/auth';
import { getVendorId } from 'src/store/selectors/features/vendor';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';

export const CreateInvoice: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [t] = useTranslation('invoice');
  const invoiceLineItems = useSelector(getServiceInvoiceProducts);
  const invoiceType = useSelector(getInvoiceType);
  const invoiceData = useSelector(getServiceInvoice);
  const debitNoteType = useSelector(getInvoiceDNType);
  const vendorId = useSelector(getVendorId);
  const isInvoiceEdited = useSelector(getIsInvoiceEdited);
  const { NET_WO_TAX, NET_TAX, NET_W_TAX } = S_INV_KEYS;
  const userId = useSelector(getUserId);
  const { id } = useParams<RouteParams>();
  useResetState(resetPOData);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({ mode: 'onSubmit' });

  const {
    isSuccess: isSuccessUpdate,
    isError: isErrorUpdate,
    mutateAsync: updateDraftInvoiceMutation,
    isLoading: isLoadingUpdate
  } = useUpdateDraftInvoice();

  useEffect(() => {
    if (isErrorUpdate) {
      showErrorMessage(t('invoice.draftUpdateFailed'));
    }
  }, [isErrorUpdate]);

  useEffect(() => {
    if (isSuccessUpdate) {
      showSuccessMessage(t('invoice.draftUpdated'));
      dispatch(setIsInvoiceEdited(false));
      history.push(`/invoices/preview/${id}`);
    }
  }, [isSuccessUpdate]);

  const updateDraftInvoice = () => {
    const invoiceTypeToSave = debitNoteType ? debitNoteType : invoiceType;
    updateDraftInvoiceMutation({
      id: id,
      type: invoiceTypeToSave,
      createdById: userId,
      vendorId: vendorId,
      detail: invoiceData
    });
  };

  const proceedToPreview = () => {
    const { totalDueWOTax, totalTaxDue, totalDueWTax } =
      calculateInvoiceTotals(invoiceLineItems);

    const actionsArray = [
      { key: NET_WO_TAX, value: totalDueWOTax },
      { key: NET_TAX, value: totalTaxDue },
      { key: NET_W_TAX, value: totalDueWTax }
    ];

    dispatch(bulkUpdateSOData(actionsArray));

    if (id && id === 'draft')
      history.push(`/invoices/preview/${DRAFT_PLACEHOLDER}`);
    else if (id && id !== 'draft') {
      if (isInvoiceEdited) {
        updateDraftInvoice();
        return;
      }

      history.push(`/invoices/preview/${id}`);
    }
  };

  const renderLineItemsTable = () => {
    if (invoiceType === INVOICES_TYPES.SERVICE_INVOICE)
      return <ServiceOrderServiceTable props={{ control, errors, setValue }} />;
    else if (invoiceType === INVOICES_TYPES.DEBIT_NOTE)
      return <DebitNoteTables props={{ control, errors, setValue }} />;
  };

  return (
    <>
      {isLoadingUpdate && <OverlayLoader />}
      <TopBar title={t('invoice.title')} />
      <div className="mx-4 lg:mx-9 pb-8 px-7">
        <div className="flex justify-end items-center my-5">
          <ButtonPrimary
            type="submit"
            text={`${t('invoice.preview')}`}
            onClick={handleSubmit(proceedToPreview)}
          />
        </div>
        <Divider />

        <ServiceOrderForm props={{ control, errors, setValue }} />
        {renderLineItemsTable()}
      </div>
    </>
  );
};
