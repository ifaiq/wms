import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { BreadCrumbs, Stages, TopBar } from 'src/components';
import {
  getVendorBreadCrumb,
  VENDOR_STATUSES,
  VSTAGES
} from 'src/constants/vendor';
import { useGetVendorById } from 'src/hooks';
import { useChangeVendorStatus } from 'src/hooks/useVendor';
import {
  getVendorCompany,
  getVendorCountry,
  getVendorName
} from 'src/store/selectors/features/vendor';
import { resetSOData } from 'src/store/slices/features/service-invoice';
import { addVendorData } from 'src/store/slices/features/vendors';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';
import { setActiveStage } from '../purchase-order/helper';
import { VendorForm, VendorInformation } from './components';
import { FEATURE_FLAGS } from 'src/constants/config';
import { DRAFT_PLACEHOLDER } from 'src/constants/invoice';
import { getIsCreateInvoiceAllowed } from 'src/store/selectors/features/service-invoice';
import { COUNTRY_CODES } from 'src/constants/common';
import { Button } from 'antd';
import { AddCircleOutlined } from '@mui/icons-material';

export const UpsertVendor: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams<RouteParams>();
  const [t] = useTranslation('vendor');
  const [tInv] = useTranslation('invoice');
  const { data } = useGetVendorById(id);
  const changeStatus = useChangeVendorStatus();
  const [status, setStatus] = useState(data?.data?.status);
  const [stages, setStages] = useState<IStages[]>([]);
  const company = useSelector(getVendorCompany);
  const name = useSelector(getVendorName);
  const country = useSelector(getVendorCountry);
  const isCreateInvoice = useSelector(getIsCreateInvoiceAllowed);
  const history = useHistory();

  const changeVendorStatus = async (params: any) => {
    try {
      await changeStatus.mutateAsync(params);
      setStatus(params?.status);
      showSuccessMessage();
    } catch (error: TObject) {
      showErrorMessage(error?.data?.reason);
    }
  };

  useEffect(() => {
    if (!data) {
      setStatus(VENDOR_STATUSES.DRAFT);
    } else {
      dispatch(addVendorData(data?.data));
      setStatus(data?.data?.status);
    }
  }, [data]);

  useEffect(() => {
    if (status) {
      setStages(setActiveStage(VSTAGES, status));
    }
  }, [status]);

  const navigateToCreateInvoice = () => {
    dispatch(resetSOData());
    history.push(`/invoices/create/${DRAFT_PLACEHOLDER}`);
  };

  return (
    <>
      <TopBar title={t('vendor.vendors')} search={false} />
      <div className="mx-4 lg:mx-9">
        <div className="ml-6 flex">
          <div className="basis-4/5 self-center">
            <BreadCrumbs
              routesArray={getVendorBreadCrumb(
                status ? status : VENDOR_STATUSES.DRAFT,
                company ? company : name
              )}
            />
          </div>
          <div className="basis-1/5 self-end">{stages && Stages(stages)}</div>
        </div>
        <div className=" flex mr-7  mt-6 justify-end">
          {FEATURE_FLAGS.INVOICE_FLAG === 'true' &&
            isCreateInvoice &&
            country !== COUNTRY_CODES.PAKISTAN && (
              <Button
                data-test-id={'CreateInvoiceButton'}
                onClick={navigateToCreateInvoice}
                type="text"
                size="middle"
                icon={<AddCircleOutlined className=" text-blue-blue2" />}
                className="flex flex-row items-center bg-transparent"
              >
                <span className="pl-2 text-blue-blue2">
                  {tInv('invoice.createSingleInvoice')}
                </span>
              </Button>
            )}
        </div>
        <div className="pl-6 pr-6 py-12 rounded-lg">
          {status === VENDOR_STATUSES.LOCKED ||
          status === VENDOR_STATUSES.DISABLED ? (
            <VendorInformation
              status={status}
              changeStatus={changeVendorStatus}
            />
          ) : (
            <VendorForm status={status} changeStatus={changeVendorStatus} />
          )}
        </div>
      </div>
    </>
  );
};
