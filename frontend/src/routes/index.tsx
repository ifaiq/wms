import * as React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import AppRoutes from './app-route';

export const Router: React.FC = () => (
  <BrowserRouter basename="/stockflo">
    <Switch>
      <Route path="">
        <AppRoutes />
      </Route>
    </Switch>
  </BrowserRouter>
);
