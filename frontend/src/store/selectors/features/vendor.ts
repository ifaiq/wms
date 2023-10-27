import get from 'lodash.get';
import { createSelector } from 'reselect';
import { Permission } from 'src/constants/auth';
import { getIsUserAllowed } from './auth';

const vendorFeatureSelector = (state: TReduxState) => state.features.vendor;

export const getVendor = createSelector(vendorFeatureSelector, (vendor) =>
  get(vendor, 'data', {})
);

export const getVendorId = createSelector(getVendor, (data) =>
  get(data, 'id', '')
);

export const getVendorName = createSelector(getVendor, (data) =>
  get(data, 'name', '')
);

export const getVendorType = createSelector(getVendor, (data) =>
  get(data, 'type', '')
);

export const getVendorCountry = createSelector(getVendor, (data) =>
  get(data, 'country', '')
);

export const getVendorCompany = createSelector(getVendor, (data) =>
  get(data, 'company', '')
);

export const getVendorTaxID = createSelector(getVendor, (data) =>
  get(data, 'taxID', '')
);

export const getVendorStatus = createSelector(getVendor, (data) =>
  get(data, 'status', '')
);

export const getVendorCompIVendorAttachment = createSelector(
  getVendor,
  (data) => get(data, 'compIVendorAttachment', '')
);

export const getVendorAddress = createSelector(getVendor, (data) =>
  get(data, 'address', '')
);

export const getVendorPhone = createSelector(getVendor, (data) =>
  get(data, 'phone', '')
);

export const getVendorEmail = createSelector(getVendor, (data) =>
  get(data, 'email', '')
);

export const getVendorJobPosition = createSelector(getVendor, (data) =>
  get(data, 'jobPosition', '')
);

export const getVendorCRNumber = createSelector(getVendor, (data) =>
  get(data, 'crNumber', '')
);

export const getVendorSTRN = createSelector(getVendor, (data) =>
  get(data, 'strn', '')
);

export const getVendorCreatedAt = createSelector(getVendor, (data) =>
  get(data, 'createdAt', '')
);

export const getVendorUpdatedAt = createSelector(getVendor, (data) =>
  get(data, 'updatedAt', '')
);

export const getVendorBankAccounts = createSelector(getVendor, (data) =>
  get(data, 'bankAccounts', [])
);

export const getVendorAttachments = createSelector(getVendor, (data) =>
  get(data, 'attachment', [])
);

export const getVendorTaxIDPath = createSelector(
  getVendorAttachments,
  (data) => {
    const invoice = data?.find(
      (x: IVendorAttachment) => x.fieldName === 'taxID'
    );

    return invoice?.path;
  }
);

export const getVendorSTRNPath = createSelector(
  getVendorAttachments,
  (data) => {
    const cInvoice = data?.find(
      (x: IVendorAttachment) => x.fieldName === 'strn'
    );

    return cInvoice?.path;
  }
);

export const getVendorCRNumberPath = createSelector(
  getVendorAttachments,
  (data) => {
    const cInvoice = data?.find(
      (x: IVendorAttachment) => x.fieldName === 'crNumber'
    );

    return cInvoice?.path;
  }
);

export const getVendorTaxIDName = createSelector(
  getVendorAttachments,
  (data) => {
    const invoice = data?.find(
      (x: IVendorAttachment) => x.fieldName === 'taxID'
    );

    return invoice?.fileName;
  }
);

export const getVendorSTRNName = createSelector(
  getVendorAttachments,
  (data) => {
    const cInvoice = data?.find(
      (x: IVendorAttachment) => x.fieldName === 'strn'
    );

    return cInvoice?.fileName;
  }
);

export const getVendorCRNumberName = createSelector(
  getVendorAttachments,
  (data) => {
    const cInvoice = data?.find(
      (x: IVendorAttachment) => x.fieldName === 'crNumber'
    );

    return cInvoice?.fileName;
  }
);
export const getIsCreateVendorAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CREATE_VENDOR]);

export const getIsEditVendorAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.EDIT_VENDOR]);

export const getIsCancelVendorAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CANCEL_VENDOR]);

export const getIsConfirmVendorAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CONFIRM_VENDOR]);

export const getIsLockUnLockVendorAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.LOCK_UNLOCK_VENDOR]);

export const getIsEnableDisableVendorAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.STATUS_VENDOR]);

export const getVendorEditFlag = createSelector(
  vendorFeatureSelector,
  (vendor) => vendor.isVendorEdited
);
