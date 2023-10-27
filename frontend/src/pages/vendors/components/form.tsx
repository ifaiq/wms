import Form from 'antd/lib/form';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { COUNTRY_CODES, COUNTRIES } from 'src/constants/common';
import {
  VENDOR_STATUSES,
  VENDOR_TYPE,
  VENDOR_TYPES
} from 'src/constants/vendor';
import {
  useGetVendorById,
  useCreateVendors,
  useUpdateVendors,
  useResetState
} from 'src/hooks';
import { showErrorMessage, showSuccessMessage } from 'src/utils/alerts';
import { bankAccountsForm } from './bank-accounts-form';
import { CheckCircleOutlineOutlined } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  addVendorData,
  removeInvoices,
  resetVendorArrays,
  resetVendorData,
  resetVendorKeys,
  setVendorEditFlag,
  updateVendorData
} from 'src/store/slices/features/vendors';
import {
  getVendorName,
  getVendorCompany,
  getVendorJobPosition,
  getVendorAddress,
  getVendorCountry,
  getVendorType,
  getVendorTaxID,
  getVendorSTRN,
  getVendorPhone,
  getVendorEmail,
  getVendorCRNumber,
  getVendorTaxIDPath,
  getVendorSTRNPath,
  getVendorCRNumberPath,
  getVendorAttachments,
  getIsEditVendorAllowed,
  getIsConfirmVendorAllowed,
  getVendorBankAccounts,
  getVendorEditFlag
} from 'src/store/selectors/features/vendor';
import { UploadVendorAttachment } from './upload-attachment';
import { useHistory, useParams } from 'react-router-dom';
import {
  useCreateVendorTaxGroup,
  useDetachVendorFile,
  useFetchTaxGroupByVendorId,
  useFetchTaxGroups
} from 'src/hooks/useVendor';
import { vendorTaxGroup } from './vendor-tax-group';
import { NETWORK } from 'src/constants/config';
import {
  IconButtonPrimary,
  CustomForm,
  FormItem,
  InputItem,
  SelectItem,
  ConfirmPopUp,
  ButtonOutline,
  ButtonLoading
} from 'src/components';
import { OverlayLoader, Loader } from 'src/components/loader';

const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!'
  }
};

export const VendorForm: React.FC<IVendorChange> = ({
  status,
  changeStatus
}) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [t] = useTranslation('vendor');
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  useResetState(resetVendorData);
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
  const crNumber = useSelector(getVendorCRNumber);
  const ntnAttachment = useSelector(getVendorTaxIDPath);
  const strnAttachment = useSelector(getVendorSTRNPath);
  const crAttachment = useSelector(getVendorCRNumberPath);
  const attachments = useSelector(getVendorAttachments);
  const isEditVendor = useSelector(getIsEditVendorAllowed);
  const isConfirmVendor = useSelector(getIsConfirmVendorAllowed);
  const [isShowCancelPopUp, setIsShowCancelPopUp] = useState<boolean>(false);
  const bankAccounts: TArrayOfObjects = useSelector(getVendorBankAccounts);
  const isVendorEdited = useSelector(getVendorEditFlag);
  /* Utlising custom hooks using react-query for data get/add/upadte*/
  const { isLoading, data } = useGetVendorById(id);

  const { mutateAsync: createVendorMutation, isLoading: createLoading } =
    useCreateVendors();

  const {
    mutateAsync: updateVendorMutation,
    isLoading: updateLoading,
    isSuccess: updateSuccess
  } = useUpdateVendors();

  const {
    mutateAsync: createVendorTaxGroupMutation,
    isLoading: createVendorTaxGroupLoading
  } = useCreateVendorTaxGroup();

  /* Fetches Tax Groups of Vendors */
  const { data: taxGroups } = useFetchTaxGroups();
  const { data: taxGroupsByVendorId } = useFetchTaxGroupByVendorId(Number(id));
  const taxGroup = taxGroupsByVendorId?.data?.taxGroup?.id;
  const getTaxationUIFlag = NETWORK.TAXATION_UI_FLAG?.toLowerCase() === 'true';

  const { mutateAsync: detachFile, isLoading: isDetachLoading } =
    useDetachVendorFile();

  const navigate = (url: string) => {
    history.replace(url);
  };

  const showCanclePopUp = () => {
    setIsShowCancelPopUp(true);
  };

  const hideCancelPopUp = () => {
    setIsShowCancelPopUp(false);
  };

  const saveVendor = async (values: IVendor) => {
    try {
      const res = await createVendorMutation(values);

      if (values?.taxGroup) {
        await createVendorTaxGroupMutation({
          vendorId: Number(res?.data?.id),
          taxGroupId: values.taxGroup
        });
      }

      showSuccessMessage();
      dispatch(addVendorData(values));
      navigate(`/vendors/${res?.data?.id}`);
    } catch (error: TObject) {
      showErrorMessage(error?.data?.reason);
    }
  };

  const updateVendor = async (values: IVendor) => {
    values.id = Number(id);
    values.attachment = attachments;

    try {
      await updateVendorMutation(values);

      if (values?.taxGroup) {
        await createVendorTaxGroupMutation({
          vendorId: Number(id),
          taxGroupId: values.taxGroup
        });
      }

      showSuccessMessage();
      dispatch(addVendorData(values));
    } catch (error: TObject) {
      showErrorMessage(error?.data?.reason);
    }
  };

  const formHandler = (
    key: string,
    value: string | number | TArrayOfObjects
  ) => {
    dispatch(updateVendorData({ key, value }));
    dispatch(setVendorEditFlag(true));
  };

  const bankAccountHandler = (
    key: string,
    value: any,
    index: number,
    add: boolean
  ) => {
    const bankDetails = [...bankAccounts];

    if (add) {
      if (bankAccounts[index]?.bank) {
        bankDetails.splice(index, 1, { [key]: value });
      }

      if (!bankAccounts[index]?.bank) {
        bankDetails.push({
          [key]: value
        });
      }
    }

    if (!add) {
      bankDetails.splice(index, 1);
    }

    formHandler('bankAccounts', [...bankDetails]);
  };

  const countryHandler = (key: string, value: string | number) => {
    formHandler(key, value);
    form.resetFields(['taxID', 'crNumber', 'strn', 'bankAccounts', 'type']);
    dispatch(resetVendorKeys(['taxID', 'crNumber', 'strn', 'type']));
    dispatch(resetVendorArrays(['bankAccounts']));
  };

  const typeHandler = (key: string, value: string | number) => {
    formHandler(key, value);
    form.resetFields(['taxID']);
    dispatch(resetVendorKeys(['taxID']));
  };

  const getFormatedFormFields = (formFields: IVendor) => {
    const formatedBankAccounts = formFields?.bankAccounts?.filter((element) => {
      if (
        Object.values(element)[0] !== undefined &&
        Object.values(element)[1] !== undefined
      ) {
        return true;
      }

      return false;
    });

    formFields.bankAccounts = formatedBankAccounts;
    return formFields;
  };

  const removeFile = async (fileData: IUpload) => {
    try {
      await detachFile(fileData);
      dispatch(removeInvoices({ fileData }));
    } catch (error: TObject) {
      return;
    }
  };

  const confirmVendor = () => {
    changeStatus({ id, status: VENDOR_STATUSES.LOCKED });
  };

  useEffect(() => {
    if (updateSuccess) {
      dispatch(setVendorEditFlag(false));
    }
  }, [updateSuccess]);

  const onSubmit = () => {
    const formatedFormFields = getFormatedFormFields(form.getFieldsValue());

    if (id === 'create') {
      formatedFormFields.status = VENDOR_STATUSES.IN_REVIEW;
      formatedFormFields.attachment = [];
      saveVendor(formatedFormFields);
    } else {
      let fileData: IUpload = {
        name: 'vendor-detach',
        id: id
      };

      if (country === COUNTRY_CODES.PAKISTAN) {
        if (crAttachment) {
          fileData = {
            ...fileData,
            fieldName: 'crNumber'
          };
        }
      } else {
        if (strnAttachment) {
          fileData = {
            ...fileData,
            fieldName: 'strn'
          };
        }
      }

      if (!fileData?.fieldName) updateVendor(formatedFormFields);
      else {
        removeFile(fileData).then(() => {
          updateVendor(formatedFormFields);
        });
      }
    }
  };

  const resetForm = () => {
    form.resetFields();
    hideCancelPopUp();
  };

  useEffect(() => {
    const formData = { ...data?.data, taxGroup: taxGroup };

    if (id !== 'create' && formData) {
      form.setFieldsValue(formData);
      dispatch(addVendorData(data?.data));
    }
  }, [id, data, taxGroupsByVendorId]);

  return (
    <>
      {id !== 'create' && isLoading && <OverlayLoader />}

      <div className="mb-6 flex justify-between">
        <span className="text-2xl font-bold">
          {id === 'create'
            ? t('vendor.addVendorInfo')
            : t('vendor.confirmVendorInfo')}
        </span>
        {id != 'create' &&
          status === VENDOR_STATUSES.IN_REVIEW &&
          isConfirmVendor && (
            <div>
              <IconButtonPrimary
                dataTestID="testConfirmVendor"
                text="Confirm"
                icon={<CheckCircleOutlineOutlined className="mr-2" />}
                onClick={confirmVendor}
                disabled={isVendorEdited}
              />
            </div>
          )}
      </div>
      <CustomForm
        name="vendor-save"
        form={form}
        onFinish={onSubmit}
        validateMessages={validateMessages}
      >
        <div className={'flex justify-between'}>
          <div className="w-[45%]">
            <FormItem name={'company'} label={t('vendor.companyName')}>
              <InputItem
                dataTestID="testVendorCompany"
                placeholder={t('vendor.companyPlaceholder')}
                value={company || ''}
                onChange={(e) => formHandler('company', e.target.value)}
              />
            </FormItem>
            <FormItem
              name={'name'}
              label={t('vendor.name')}
              rules={[{ required: true }]}
            >
              <InputItem
                dataTestID="testVendorName"
                placeholder={t('vendor.vendorPlaceholder')}
                value={name || ''}
                onChange={(e) => formHandler('name', e.target.value)}
              />
            </FormItem>
            <FormItem name={'jobPosition'} label={t('vendor.jobPosition')}>
              <InputItem
                dataTestID="testVendorDesignation"
                placeholder={t('vendor.designationPlaceholder')}
                value={jobPosition || ''}
                onChange={(e) => formHandler('jobPosition', e.target.value)}
              />
            </FormItem>
            <FormItem name={'address'} label={t('vendor.address')}>
              <InputItem
                dataTestID="testVendorAddress"
                placeholder={t('vendor.addressPlaceholder')}
                value={address || ''}
                onChange={(e) => formHandler('address', e.target.value)}
              />
            </FormItem>
            <FormItem
              name={'country'}
              label={t('vendor.country')}
              rules={[{ required: true }]}
            >
              <SelectItem
                dataTestID="testVendorCountry"
                placeholder={t('vendor.countryPlaceholder')}
                value={country}
                onChange={(e: string) => countryHandler('country', e)}
                options={COUNTRIES}
              />
            </FormItem>
            <FormItem
              name={'type'}
              label={t('vendor.type')}
              rules={[{ required: true }]}
            >
              <SelectItem
                dataTestID="testVendorType"
                placeholder={t('vendor.typePlaceholder')}
                value={type}
                onChange={(e: string) => typeHandler('type', e)}
                options={
                  country === COUNTRY_CODES.PAKISTAN
                    ? VENDOR_TYPES
                    : VENDOR_TYPES.slice(0, -1)
                }
              />
            </FormItem>

            {country === COUNTRY_CODES.PAKISTAN &&
              (type === VENDOR_TYPE.INDIVIDUAL ? (
                <>
                  <FormItem
                    name={'taxID'}
                    label={t('vendor.nic')}
                    tooltip="Must match NIC format XXXXX-XXXXXXX-X"
                    rules={[
                      {
                        pattern: '^[0-9]{5}-[0-9]{7}-[0-9]{1}$',
                        message: 'Invalid NIC'
                      },
                      {
                        required: true
                      }
                    ]}
                  >
                    <InputItem
                      dataTestID="testVendorNIC"
                      placeholder={t('vendor.nicPlaceholder')}
                      value={ntn || ''}
                      maxLength={15}
                      onChange={(e) => formHandler('taxID', e.target.value)}
                    />
                  </FormItem>
                </>
              ) : (
                <>
                  <FormItem
                    name={'taxID'}
                    label={t('vendor.ntn')}
                    tooltip="Must match NTN format XXXXXXX-X"
                    rules={[
                      {
                        pattern: '^[A-Za-z0-9]{7}-[A-Za-z0-9]{1}$',
                        message: 'Invalid NTN'
                      },
                      {
                        required: true
                      }
                    ]}
                  >
                    <InputItem
                      dataTestID="testVendorNTM"
                      placeholder={t('vendor.ntnPlaceholder')}
                      value={ntn || ''}
                      maxLength={9}
                      onChange={(e) => formHandler('taxID', e.target.value)}
                    />
                  </FormItem>
                </>
              ))}

            {country !== COUNTRY_CODES.PAKISTAN && (
              <>
                <FormItem
                  name={'taxID'}
                  label={t('vendor.vat')}
                  rules={[
                    {
                      pattern: '^[0-9]{15}$',
                      message: `${t('vendor.vat')} must be 15 number`
                    },
                    {
                      required:
                        country === COUNTRY_CODES.SAUDIARABIA ? true : false
                    }
                  ]}
                >
                  <InputItem
                    dataTestID="testVendorVAT"
                    placeholder={t('vendor.vatPlaceholder')}
                    value={ntn || ''}
                    maxLength={15}
                    onChange={(e) => formHandler('taxID', e.target.value)}
                  />
                </FormItem>
              </>
            )}
            {id != 'create' && (
              <UploadVendorAttachment
                dataTestID="testVendorTaxIDAttachment"
                dataTestIdPath="testVendorTaxIDPath"
                dataTestIdRemove="testVendorTaxIDRemove"
                id={id}
                fieldName={'taxID'}
                path={ntnAttachment}
                alignment={'justify-end'}
              />
            )}
          </div>

          <div className="w-[45%]">
            {country === COUNTRY_CODES.PAKISTAN ? (
              <>
                <FormItem name={'strn'} label={t('vendor.strn')}>
                  <InputItem
                    dataTestID="testVendorSTRN"
                    placeholder={t('vendor.strnPlaceholder')}
                    value={strn || ''}
                    onChange={(e) => formHandler('strn', e.target.value)}
                  />
                </FormItem>
                {id != 'create' && (
                  <UploadVendorAttachment
                    dataTestID="testVendorSTRNAttachment"
                    dataTestIdPath="testVendorSTRNPath"
                    dataTestIdRemove="testVendorSTRNRemove"
                    id={id}
                    fieldName={'strn'}
                    path={strnAttachment}
                    alignment={'justify-end'}
                  />
                )}
              </>
            ) : null}
            {country !== COUNTRY_CODES.PAKISTAN && (
              <>
                <FormItem
                  name={'crNumber'}
                  label={t('vendor.crNo')}
                  rules={[
                    {
                      pattern: '^\\w+$',
                      message: `${t(
                        'vendor.crNo'
                      )} must be numbers or alphabets only`
                    },
                    {
                      required: country === COUNTRY_CODES.UAE ? true : false
                    }
                  ]}
                >
                  <InputItem
                    dataTestID="testVendorCRNumber"
                    placeholder={t('vendor.crnoPlaceholder')}
                    value={crNumber || ''}
                    onChange={(e) => formHandler('crNumber', e.target.value)}
                  />
                </FormItem>
                {id != 'create' && (
                  <UploadVendorAttachment
                    dataTestID="testVendorCRAttachment"
                    dataTestIdPath="testVendorCRPath"
                    dataTestIdRemove="testVendorCRRemove"
                    id={id}
                    fieldName={'crNumber'}
                    path={crAttachment}
                    alignment={'justify-end'}
                  />
                )}
              </>
            )}
            <FormItem
              name={'phone'}
              label={t('vendor.contactNo')}
              rules={[
                {
                  max: 15,
                  message: `${t(
                    'vendor.contactNo'
                  )} must be less than or equal to 15`
                }
              ]}
            >
              <InputItem
                dataTestID="testVendorPhone"
                placeholder={t('vendor.phonePlaceholder')}
                value={phone || ''}
                maxLength={15}
                onChange={(e) => formHandler('phone', e.target.value)}
              />
            </FormItem>
            <FormItem
              name={'email'}
              label={t('vendor.email')}
              rules={[{ type: 'email' }]}
            >
              <InputItem
                dataTestID="testVendorEmail"
                placeholder={t('vendor.emailPlaceholder')}
                value={email || ''}
                onChange={(e) => formHandler('email', e.target.value)}
              />
            </FormItem>

            {/* TaxGroup fields*/}
            {getTaxationUIFlag
              ? vendorTaxGroup({
                  t,
                  taxGroups: taxGroups?.data,
                  taxGroup
                })
              : null}

            {/* bank accounts form*/}
            {bankAccountsForm({
              t,
              bankAccountHandler,
              country: country,
              bankAccounts: bankAccounts
            })}
            <div className="flex flex-col lg:flex-row gap-x-4 justify-end">
              {id === 'create' && (
                <FormItem>
                  <ConfirmPopUp
                    onConfirm={resetForm}
                    onCancel={hideCancelPopUp}
                    visible={isShowCancelPopUp}
                    title={`${t('vendor.confirmResetVendorForm')}`}
                  >
                    <ButtonOutline
                      dataTestID="testVendorResetForm"
                      text={`${t('vendor.clearInfo')}`}
                      size="large"
                      onClick={() => showCanclePopUp()}
                    />
                  </ConfirmPopUp>
                </FormItem>
              )}
              {isEditVendor && (
                <FormItem>
                  {createLoading ||
                  createVendorTaxGroupLoading ||
                  updateLoading ? (
                    <ButtonLoading size="large" text={''} />
                  ) : (
                    <IconButtonPrimary
                      dataTestID="testVendorSubmit"
                      type="submit"
                      size="large"
                      icon={
                        (isDetachLoading || updateLoading) && (
                          <Loader className="mr-2" loaderColor="text-white" />
                        )
                      }
                      text={`${t('vendor.saveInfo')}`}
                    />
                  )}
                </FormItem>
              )}
            </div>
          </div>
        </div>
      </CustomForm>
    </>
  );
};
