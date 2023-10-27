import { combineReducers } from 'redux';
import { purchOrderEntityReducer } from './purchase-order';
import { receiptEntityReducer } from './receipt';
import { vendorEntityReducer } from './vendor';
import { transferEntityReducer } from './transfer';
import { productEntityReducer } from './product';
import { locationReducer } from './location';
import { userEntityReducer } from './user';
import { invoiceEntityReducer } from './invoices';
import { draftInvoiceEntityReducer } from './draft-invoices';

const entitiesReducer = combineReducers({
  po: purchOrderEntityReducer,
  receipt: receiptEntityReducer,
  vendor: vendorEntityReducer,
  transfer: transferEntityReducer,
  product: productEntityReducer,
  location: locationReducer,
  user: userEntityReducer,
  invoice: invoiceEntityReducer,
  draftInvoice: draftInvoiceEntityReducer
});

export { entitiesReducer };
