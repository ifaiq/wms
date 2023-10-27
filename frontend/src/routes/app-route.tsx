import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from 'src/components/not-found';
import { PrivateRoute } from './private-route';
import { AuthRoute } from './auth-route';
import { UpdateRoute } from './update-route';
import {
  Login,
  Vendors,
  Invoices,
  UpsertVendor,
  PurchaseOrder,
  CreatePurchOrder,
  EditPurchOrder,
  EditGRN,
  Receipts,
  Return,
  CreateAdjustment,
  EditAdjustment,
  Transfers,
  Locations,
  CreateLocation,
  EditLocation,
  User,
  CreateUser,
  EditUser,
  CreateTransfer,
  EditTransfer,
  CreateInvoice,
  PreviewInvoiceScreen
} from '../pages';

const AppRoutes = () => (
  <React.Fragment>
    <Switch>
      <Route path="/" exact>
        <AuthRoute component={<Login />} />
      </Route>
      <Route path="/vendors" exact>
        <PrivateRoute component={<Vendors />} permissions={[]} />
      </Route>
      <Route path="/vendors/:id" exact>
        <PrivateRoute component={<UpsertVendor />} permissions={[]} />
      </Route>
      <Route path="/purchase-order" exact>
        <PrivateRoute component={<PurchaseOrder />} permissions={[]} />
      </Route>
      <Route path="/purchase-order/create" exact>
        <PrivateRoute component={<CreatePurchOrder />} permissions={[]} />
      </Route>
      <Route path="/purchase-order/:id" exact>
        <PrivateRoute component={<EditPurchOrder />} permissions={[]} />
      </Route>
      <Route path="/purchase-order/:id/receipts" exact>
        <PrivateRoute component={<Receipts />} permissions={[]} />
      </Route>
      <Route path="/purchase-order/:poId/receipts/:id" exact>
        <PrivateRoute component={<EditGRN />} permissions={[]} />
      </Route>
      <Route path="/purchase-order/:poId/return/:id" exact>
        <PrivateRoute component={<Return />} permissions={[]} />
      </Route>
      <Route path="/inventory-movements" exact>
        <PrivateRoute component={<Transfers />} permissions={[]} />
      </Route>
      <Route path="/inventory-movements/adjustment/create" exact>
        <PrivateRoute component={<CreateAdjustment />} permissions={[]} />
      </Route>
      <Route path="/inventory-movements/adjustment/:id" exact>
        <PrivateRoute component={<EditAdjustment />} permissions={[]} />
      </Route>
      <Route path="/locations" exact>
        <PrivateRoute component={<Locations />} permissions={[]} />
      </Route>
      <Route path="/location/create" exact>
        <PrivateRoute component={<CreateLocation />} permissions={[]} />
      </Route>
      <Route path="/location/:id" exact>
        <PrivateRoute component={<EditLocation />} permissions={[]} />
      </Route>
      <Route path="/users" exact>
        <PrivateRoute component={<User />} permissions={[]} />
      </Route>
      <Route path="/user/create" exact>
        <PrivateRoute component={<CreateUser />} permissions={[]} />
      </Route>
      <Route path="/user/:id" exact>
        <PrivateRoute component={<EditUser />} permissions={[]} />
      </Route>
      <Route path="/inventory-movements/transfer/create" exact>
        <PrivateRoute component={<CreateTransfer />} permissions={[]} />
      </Route>
      <Route path="/inventory-movements/transfer/:id" exact>
        <PrivateRoute component={<EditTransfer />} permissions={[]} />
      </Route>
      <Route path="/wmsportal/*" exact>
        <UpdateRoute />
      </Route>
      <Route path="/invoices" exact>
        <PrivateRoute component={<Invoices />} permissions={[]} />
      </Route>
      <Route path="/invoices/create/:id" exact>
        <PrivateRoute component={<CreateInvoice />} permissions={[]} />
      </Route>
      <Route path="/invoices/preview/:id" exact>
        <PrivateRoute component={<PreviewInvoiceScreen />} permissions={[]} />
      </Route>
      <Route path="/*" exact>
        <NotFound />
      </Route>
    </Switch>
  </React.Fragment>
);

export default AppRoutes;
