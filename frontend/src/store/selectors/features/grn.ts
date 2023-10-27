import { createSelector } from 'reselect';
import get from 'lodash.get';
import { GRNStatus } from 'src/constants/grn';
import { getIsUserAllowed } from './auth';
import { Permission } from 'src/constants/auth';

const grnFeatureSelector = (state: TReduxState) => state.features.grn;

export const getGrn = createSelector(grnFeatureSelector, (grn) =>
  get(grn, 'data', {})
);

export const getGrnProducts = createSelector(getGrn, (data) => {
  const products: [] = get(data, 'products', []);
  return (
    products?.map((product: IGRNProduct, key: number) => ({
      ...product,
      key
    })) || []
  );
});

export const getReceiptId = createSelector(getGrn, (receipt) =>
  get(receipt, 'id', null)
);

export const getIsBackOrder = createSelector(getGrn, (data) => {
  const products: [] = get(data, 'products', []);
  return products?.some(
    (product: IGRNProduct) => product.quantityOrdered > product.quantityReceived
  );
});

export const getReturnReceiptsLength = createSelector(getGrn, (data) => {
  const returnReceipts: [] = get(data, 'returnReceipts', []);
  return returnReceipts?.length;
});

export const getGRNCreationDate = createSelector(getGrn, (data) =>
  get(data, 'createdAt', '')
);

export const getGRNReceivedDate = createSelector(getGrn, (data) =>
  get(data, 'confirmedAt', null)
);

export const getGRNVendorName = createSelector(getGrn, (data) =>
  get(data, 'vendorName', '')
);

export const getGRNWarehouseName = createSelector(getGrn, (data) =>
  get(data, 'warehouseName', '')
);

export const getGRNPoId = createSelector(getGrn, (data) =>
  get(data, 'poId', '')
);

export const getGRNStatus = createSelector(getGrn, (data) =>
  get(data, 'status', '') ? get(data, 'status', '') : GRNStatus.READY
);

export const getGRNReturnReason = createSelector(getGrn, (data) =>
  get(data, 'reasonId', '')
);

export const getGRNReceiptId = createSelector(getGrn, (data) =>
  get(data, 'receiptId', null)
);

export const getCanReturnFlag = createSelector(getGrn, (data) =>
  get(data, 'canReturn', '')
);

export const getGRNIsEdit = createSelector(grnFeatureSelector, (grn) =>
  grn?.isEditGRN ? true : false
);

export const getGRNIsReturn = createSelector(grnFeatureSelector, (grn) =>
  grn?.isReturnGRN ? true : false
);

export const getIsGrnStatusCancelled = createSelector(getGrn, (data) =>
  get(data, 'status', '') === GRNStatus.CANCELLED ? true : false
);

export const getGRNISReadyStatus = createSelector(getGrn, (data) =>
  get(data, 'status', '') === GRNStatus.READY ? true : false
);

export const getGrnCountry = createSelector(
  getGrn,
  (data) => get(data, 'location', null)?.country
);

export const getGrnBusinessUntiId = createSelector(
  getGrn,
  (data) => get(data, 'location', null)?.businessUnitId
);

export const getGrnWarehouseId = createSelector(
  getGrn,
  (data) => get(data, 'location', null)?.warehouseId
);

export const getLocationToId = createSelector(getGrn, (data) =>
  get(data, 'locationId', null)
);

export const getLocationFromId = createSelector(
  getGrn,
  (data) => get(data, 'receipt', null)?.location?.name
);

export const getGrnId = createSelector(getGrn, (data) => get(data, 'id', null));

export const getReceiptAttachments = createSelector(getGrn, (data) => {
  const { attachment, invoices } = data as TObject;

  const newAttachmentArr: TObject[] = [];

  attachment?.forEach((file: TObject) => {
    const index = invoices?.findIndex(
      (invoice: TObject) => invoice?.fieldName === file?.fieldName
    );

    if (index > -1) newAttachmentArr[index] = file;
  });

  return newAttachmentArr;
});

export const getReceiptInvoices = createSelector(
  getGrn,
  (data) => get(data, 'invoices', []) || []
);

export const getAllowCreateReturn = (state: TReduxState) => {
  const isReturnGRN: boolean = getGRNIsReturn(state);
  const status: GRNStatus = getGRNStatus(state);
  const receiptsLength: number = getReturnReceiptsLength(state);
  return (status === GRNStatus.DONE && !isReturnGRN) ||
    (status === GRNStatus.DONE && receiptsLength)
    ? true
    : false;
};

export const getSaveGRNReqPayload = (state: TReduxState) => {
  const grnProducts = getGrnProducts(state);
  const locationId = getLocationToId(state);
  const invoices = getReceiptInvoices(state);

  const products = grnProducts?.map((product: IGRNProduct) => {
    const formatedProduct: IGRNProductUpdate = {
      productId: product.productId,
      quantityReceived: product.quantityReceived,
      expiry: product.expiry ? product.expiry : null
    };

    return formatedProduct;
  });

  return { locationId, invoices, products };
};

export const getReturnReqPayload = createSelector(
  getReceiptId,
  getGRNReturnReason,
  getGrnProducts,
  getLocationToId,
  getReceiptInvoices,
  (id, reasonId, grnProducts, locationId, invoices) => {
    const products = grnProducts?.map((product: IGRNProduct) => {
      const formatedProduct: IGRNProductUpdate = {
        productId: product.productId,
        quantityReturned: Number(product.quantityReturned)
      };

      return formatedProduct;
    });

    return { id, locationId, products, reasonId, invoices };
  }
);

export const getIsEditGrnAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.EDIT_GRN]);

export const getIsCancelGrnAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CANCEL_GRN]);

export const getIsConfirmGrnAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CONFIRM_GRN]);

export const getIsCreateReturnAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CREATE_RETURN]);
export const getIsEditReturnAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.EDIT_RETURN]);

export const getIsCancelReturnAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CANCEL_RETURN]);

export const getIsConfirmReturnAllowed = (state: TReduxState) =>
  getIsUserAllowed(state, [Permission.CONFIRM_RETURN]);

export const getReturnInRefId = createSelector(getGrn, (data) =>
  get(data, 'returnInRefId', null)
);

export const getReturnInLocation = createSelector(
  getGrn,
  (data) => get(data, 'returnInRef', null)?.location
);

export const getProductTableInfoDataSourceGRN = createSelector(
  getGrnProducts,
  (products) => {
    let totalProducts = 0;
    let totalQuantityOrdered = 0;
    let totalQuantityReceived = 0;

    for (const product of products) {
      if (product.sku || product.name) {
        totalProducts++;

        totalQuantityOrdered += product.quantityOrdered;
        totalQuantityReceived += product.quantityReceived;
      }
    }

    const dataSource = [
      {
        title: 'Total Products',
        data: totalProducts
      },
      {
        title: 'Total Quantity Ordered',
        data: totalQuantityOrdered
      },
      {
        title: 'Total Quantity Received',
        data: totalQuantityReceived
      }
    ];

    return dataSource;
  }
);
