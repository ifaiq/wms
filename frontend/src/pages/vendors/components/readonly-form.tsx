import { LockOpen } from '@mui/icons-material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  CustomForm,
  CustomSwitch,
  IconButtonPrimary,
  UploadView
} from 'src/components';
import { COUNTRY_CODES } from 'src/constants/common';
import { VENDOR_STATUSES } from 'src/constants/vendor';
import {
  getIsEnableDisableVendorAllowed,
  getIsLockUnLockVendorAllowed,
  getVendorAddress,
  getVendorBankAccounts,
  getVendorCompany,
  getVendorCountry,
  getVendorCRNumber,
  getVendorCRNumberPath,
  getVendorEmail,
  getVendorJobPosition,
  getVendorName,
  getVendorPhone,
  getVendorSTRN,
  getVendorSTRNPath,
  getVendorTaxID,
  getVendorTaxIDPath,
  getVendorType
} from 'src/store/selectors/features/vendor';
import { getCountryName } from 'src/utils/countries';

export const VendorInformation: React.FC<IVendorChange> = ({
  status,
  changeStatus
}) => {
  const { id } = useParams<RouteParams>();
  const [t] = useTranslation('vendor');
  const name = useSelector(getVendorName);
  const company = useSelector(getVendorCompany);
  const jobPosition = useSelector(getVendorJobPosition);
  const address = useSelector(getVendorAddress);
  const country = useSelector(getVendorCountry);
  const type = useSelector(getVendorType);
  const ntn = useSelector(getVendorTaxID);
  const strn = useSelector(getVendorSTRN);
  const phone = useSelector(getVendorPhone);
  const email = useSelector(getVendorEmail);
  const bankAccounts = useSelector(getVendorBankAccounts);
  const crNo = useSelector(getVendorCRNumber);
  const ntnAttachment = useSelector(getVendorTaxIDPath);
  const strnAttachment = useSelector(getVendorSTRNPath);
  const crAttachment = useSelector(getVendorCRNumberPath);
  const isLockUnLockVendor = useSelector(getIsLockUnLockVendorAllowed);
  const isEnableDisableVendor = useSelector(getIsEnableDisableVendorAllowed);

  const renderItemDetail = (
    label: string,
    value: string,
    path?: string,
    dataTestId?: string
  ) => (
    <div className="flex flex-col justify-start mb-6">
      <h3>{label}</h3>
      <div className="flex justify-between items-center">
        <div className="mt-4 mr-4 text-gray-grey2">{value ? value : '---'}</div>
        {path && (
          <UploadView
            dataTestIdPath={dataTestId}
            className="mt-4 text-blue-blue2"
            fileLink={path}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <CustomForm name="vendor-save">
        <div className="flex justify-between h-14">
          <span className="text-2xl font-bold">
            {t('vendor.vendorDetails')}
          </span>
          {
            <div
              className={`flex items-center w-80 ${
                status === VENDOR_STATUSES.DISABLED || !isLockUnLockVendor
                  ? 'justify-end'
                  : 'justify-between'
              }`}
            >
              {status != VENDOR_STATUSES.DISABLED && isLockUnLockVendor ? (
                <IconButtonPrimary
                  dataTestID="testVendorLockUnlockButton"
                  text="Unlock"
                  icon={<LockOpen className="mr-2" />}
                  onClick={() =>
                    changeStatus({ id, status: VENDOR_STATUSES.IN_REVIEW })
                  }
                />
              ) : null}
              {isEnableDisableVendor && (
                <div className="flex w-24 justify-between">
                  <CustomSwitch
                    dataTestID="testVendorDisableSwitch"
                    onChange={() =>
                      changeStatus({
                        id,
                        ...(status === VENDOR_STATUSES.DISABLED
                          ? { status: VENDOR_STATUSES.LOCKED }
                          : { status: VENDOR_STATUSES.DISABLED })
                      })
                    }
                    checked={status === VENDOR_STATUSES.DISABLED}
                  />
                  <div>{t('vendor.disable')}</div>
                </div>
              )}
            </div>
          }
        </div>
        <div className="flex justify-between rounded-lg p-2">
          <div className="w-[45%]">
            {renderItemDetail(t('vendor.name'), name)}
            {renderItemDetail(t('vendor.companyName'), company)}
            {renderItemDetail(t('vendor.jobPosition'), jobPosition)}
            {renderItemDetail(t('vendor.address'), address)}
            {renderItemDetail(t('vendor.country'), getCountryName(country))}
            {renderItemDetail(t('vendor.type'), type)}
          </div>
          <div className="w-[45%]">
            {renderItemDetail(t('vendor.phone'), phone)}
            {renderItemDetail(t('vendor.email'), email)}
            {country === COUNTRY_CODES.PAKISTAN ? (
              <div className="flex justify-between">
                {renderItemDetail(
                  t('vendor.ntn'),
                  ntn,
                  ntnAttachment,
                  'testVendorNTNAttachmentView'
                )}
              </div>
            ) : (
              <div className="flex justify-between">
                {renderItemDetail(
                  t('vendor.vat'),
                  ntn,
                  ntnAttachment,
                  'testVendorNTNAttachmentView'
                )}
              </div>
            )}
            {country === COUNTRY_CODES.PAKISTAN && (
              <div className="flex justify-between">
                {renderItemDetail(
                  t('vendor.strn'),
                  strn,
                  strnAttachment,
                  'testVendorSTRNAttachmentView'
                )}
              </div>
            )}
            {country !== COUNTRY_CODES.PAKISTAN && (
              <div className="flex justify-between">
                {renderItemDetail(
                  t('vendor.crNo'),
                  crNo,
                  crAttachment,
                  'testVendorCRAttachmentView'
                )}
              </div>
            )}
          </div>
          <div className="w-[45%] ">
            <h3>Bank Accounts</h3>
            {bankAccounts &&
              bankAccounts?.map((items: any) => (
                <>
                  <div
                    className={`flex justify-between 
                  rounded-md border-dotted border-blue-blue2 border-2 my-6 px-4 pt-6`}
                  >
                    {renderItemDetail(t('vendor.bank'), items.bank)}
                    <div className="uppercase">
                      {renderItemDetail(
                        t('vendor.accountNo'),
                        items.accountNumber
                      )}
                    </div>
                  </div>
                </>
              ))}
            {bankAccounts.length === 0 && <p>No Bank Accounts Added</p>}
          </div>
        </div>
      </CustomForm>
    </>
  );
};
