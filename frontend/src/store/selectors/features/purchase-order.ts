import { createSelector } from 'reselect';
import isEmpty from 'lodash.isempty';
import get from 'lodash.get';
import omit from 'lodash.omit';
import { getIsUserAllowed, getUserId } from './auth';
import { PO_STATUS } from 'src/constants/purchase-order';
import {
  calculateTotalAmounts,
  handleProductCalculations
} from 'src/pages/purchase-order/helper';
import { PO_TYPES_CODES } from 'src/constants/purchase-order';
import { getSearchedProducts } from '../entities/product';
import { Permission } from 'src/constants/auth';
import { getCurrency } from './app';
import { CURRENCY_LIST } from 'src/constants/currency';

const purchOrderFeatureSelector = (state: TReduxState) => state.features.po;

export const getPurchaseOrder = createSelector(
  purchOrderFeatureSelector,
  (po) => get(po, 'data', {})
);

export const getPurchaseOrderId = createSelector(getPurchaseOrder, (data) =>
  get(data, 'id', null)
);

export const getPOLocationId = createSelector(getPurchaseOrder, (data) =>
  get(data, 'warehouseId', null)
);

export const getPOBUId = createSelector(getPurchaseOrder, (data) =>
  get(data, 'businessUnitId', null)
);

export const getIsLocationSelected = createSelector(
  getPOLocationId,
  (locationId) => (locationId ? false : true)
);

export const getPOCreationDate = createSelector(getPurchaseOrder, (data) =>
  get(data, 'createdAt', null)
);

export const getPurchaserData = createSelector(getPurchaseOrder, (data) =>
  get(data, 'purchaser', null)
);

export const getPurchaserName = createSelector(getPurchaserData, (purchaser) =>
  get(purchaser, 'name', null)
);

export const getPOVendorData = createSelector(getPurchaseOrder, (data) =>
  get(data, 'vendor', null)
);

export const getPOVendorName = createSelector(getPOVendorData, (vendor) =>
  get(vendor, 'name', null)
);

export const getPOVendorId = createSelector(getPurchaseOrder, (data) =>
  get(data, 'vendorId', null)
);

export const getPOCountryName = createSelector(getPurchaseOrder, (data) =>
  get(data, 'country', null)
);

export const getPOBusinessUnitData = createSelector(getPurchaseOrder, (data) =>
  get(data, 'businessUnit', null)
);

export const getPOBusinessUnitName = createSelector(
  getPOBusinessUnitData,
  (vendor) => get(vendor, 'name', null)
);

export const getPOWareHouseData = createSelector(getPurchaseOrder, (data) =>
  get(data, 'warehouse', null)
);

export const getPOWareHouseName = createSelector(getPOWareHouseData, (vendor) =>
  get(vendor, 'name', null)
);

export const getPOStatus = createSelector(getPurchaseOrder, (data) =>
  get(data, 'status', PO_STATUS.IN_REVIEW)
);

export const getPOPaymentType = createSelector(getPurchaseOrder, (data) =>
  get(data, 'payment', null)
);

export const getPOPaymentDays = createSelector(getPurchaseOrder, (data) =>
  get(data, 'paymentDays', 0)
);

export const getPOComfirmedAt = createSelector(getPurchaseOrder, (data) =>
  get(data, 'confirmedAt', null)
);

export const getPOAttachments = createSelector(getPurchaseOrder, (data) =>
  get(data, 'attachment', [])
);

export const getPOType = createSelector(getPurchaseOrder, (data) =>
  get(data, 'type', PO_TYPES_CODES.STANDARD)
);

export const getPOGSTInvoicePath = createSelector(getPOAttachments, (data) => {
  const invoice = data?.find((x: any) => x.fieldName === 'gstInvoice');
  return invoice?.path;
});

export const getPOComInvoicePath = createSelector(getPOAttachments, (data) => {
  const cInvoice = data?.find((x: any) => x.fieldName === 'comInvoice');
  return cInvoice?.path;
});

export const getPOGSTInvoiceNumber = createSelector(getPurchaseOrder, (data) =>
  get(data, 'gstInvoiceNumber', null)
);

export const getPOComInvoiceName = createSelector(getPOAttachments, (data) => {
  const cInvoice = data?.find((x: any) => x.fieldName === 'comInvoice');
  return cInvoice?.fileName;
});

export const getProducts = createSelector(getPurchaseOrder, (data) => {
  const products: [] = get(data, 'products', []);
  return (
    products?.map((product: TObject, key: number) => ({
      ...handleProductCalculations({ ...product }),
      key
    })) || []
  );
});

export const getPOProductIds = createSelector(getPurchaseOrder, (data) => {
  const products: [] = get(data, 'products', []);
  // extract ids and return new array of ids
  return products.map((product: TObject) => product?.productId || product?.id);
});

export const getPOFilteredProducts = createSelector(
  getPOProductIds,
  getSearchedProducts,
  (productIds, products) => {
    const filteredProducts = products.filter(
      (product: TObject) =>
        !productIds.includes(product?.productId || product?.id)
    );

    return filteredProducts;
  }
);

export const getProductsLength = createSelector(
  getProducts,
  (products) => products.length
);

export const getShowReciptAndLockButton = createSelector(
  getPOStatus,
  (status) => status === PO_STATUS.PO || status === PO_STATUS.LOCKED
);

export const getShowPrintButton = createSelector(
  getPOStatus,
  (status) => status != 'DRAFT' && status != undefined && status != ''
);

export const getLockingButtonTextAndIcon = createSelector(
  getPOStatus,
  (status) => {
    if (status === PO_STATUS.PO) {
      return {
        text: 'Lock',
        icon: 'Lock'
      };
    }

    if (status === PO_STATUS.LOCKED) {
      return {
        text: 'Unlock',
        icon: 'LockOpen'
      };
    }

    return {
      text: '',
      icon: ''
    };
  }
);

export const getPOReqPayload = (state: TReduxState) => {
  const userId = getUserId(state);
  const purchaseOrder = getPurchaseOrder(state);
  const purchaseOrderId = getPurchaseOrderId(state);
  const products = getProducts(state);
  const totals = calculateTotalAmounts(products);
  const updatedProducts: TArrayOfObjects = [];
  let newPO = {};

  if (purchaseOrderId)
    newPO = {
      ...omit(purchaseOrder, [
        'businessUnit',
        'purchaser',
        'vendor',
        'warehouse',
        'availableQuantities',
        'purchaserId'
      ])
    };
  else {
    newPO = { ...purchaseOrder, purchaserId: userId };
  }

  products?.forEach((item: TObject) => {
    if (Object.values(item).every((value) => isEmpty(value))) return;

    const product = { ...item, productId: item?.productId || item?.id };

    if (item.poId)
      updatedProducts.push(omit(product, ['key', 'id', 'poId', 'tax']));
    else updatedProducts.push(omit(product, ['key', 'id', 'tax']));
  });

  return {
    ...newPO,
    ...totals,
    products: updatedProducts
  };
};

export const getPOHeader = createSelector(getPOStatus, (status) => {
  if (status === PO_STATUS.LOCKED) return 'po';
  if (status === PO_STATUS.PO) return 'editPO';
  if (status === PO_STATUS.CANCELLED) return 'cancelledRFQ';

  return 'editRFQ';
});

export const getRFQEditFlag = createSelector(
  purchOrderFeatureSelector,
  (po) => po.isRFQEdited
);

export const getPOEditFlag = createSelector(
  purchOrderFeatureSelector,
  (po) => po.isPOEdited
);

export const getShowConfirmButton = (state: TReduxState) =>
  getPOStatus(state) === PO_STATUS.IN_REVIEW;

export const getIsCreatePOAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CREATE_PO]);

export const getIsEditPOAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.EDIT_PO]);

export const getIsCancelPOAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CANCEL_PO]);

export const getIsConfirmPOAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CONFIRM_PO]);

export const getIsLockUnLockPOAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.LOCK_UNLOCK_PO]);

export const getPOCurrencyList = createSelector(getPurchaseOrder, (data) => {
  const { country } = data;
  const currency = getCurrency(country);

  if (!currency) return [];

  return [
    {
      id: CURRENCY_LIST[currency],
      name: CURRENCY_LIST[currency]
    },
    {
      id: CURRENCY_LIST.USD,
      name: CURRENCY_LIST.USD
    }
  ];
});

export const getPOCurrency = createSelector(getPurchaseOrder, (data) => {
  const { country } = data;
  const defCurrency = getCurrency(country);

  return get(data, 'currency', defCurrency);
});

export const getProductTableInfoDataSourcePO = createSelector(
  getProducts,
  (products) => {
    let totalProducts = 0;
    let totalQuantity = 0;
    let totalPriceWithoutTax = 0;
    let totalPriceWithTax = 0;

    for (const product of products) {
      if (product.sku || product.name) {
        totalProducts++;

        totalQuantity += product.quantity;
        totalPriceWithoutTax += product.subTotalWithoutTax;
        totalPriceWithTax += product.subTotalWithTax;
      }
    }

    const dataSource = [
      {
        title: 'Total Products',
        data: totalProducts
      },
      {
        title: 'Total Quantity Ordered',
        data: totalQuantity
      },
      {
        title: 'Total Price With Tax',
        data: totalPriceWithTax
      },
      {
        title: 'Total Price Without Tax',
        data: totalPriceWithoutTax
      }
    ];

    return dataSource;
  }
);
