import { combineReducers } from 'redux';
import { appFeatureReducer } from './app';
import { authFeatureReducer } from './auth';
import { grnFeatureReducer } from './grn';
import { purchOrderFeatureReducer } from './purchase-order';
import { adjustmentFeatureReducer } from './adjustment';
import { VendorFeatureReducer } from './vendors';
import { locationReducer } from './location';
import { transferFeatureReducer } from './transfer';
import { userFeatureReducer } from './user';
import { serviceInvoiceFeatureReducer } from './service-invoice';

const featuresReducer = combineReducers({
  app: appFeatureReducer,
  auth: authFeatureReducer,
  grn: grnFeatureReducer,
  po: purchOrderFeatureReducer,
  adjustment: adjustmentFeatureReducer,
  vendor: VendorFeatureReducer,
  location: locationReducer,
  transfer: transferFeatureReducer,
  user: userFeatureReducer,
  serviceInvoice: serviceInvoiceFeatureReducer
});

export { featuresReducer };
