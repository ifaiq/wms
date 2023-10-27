//@ts-nocheck
import React, { Suspense, useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { I18nextProvider } from 'react-i18next';
import { ErrorBoundary } from 'react-error-boundary';
import { QueryClient, QueryClientProvider } from 'react-query';
import i18n from './i18n';
import reduxStore from './store';
import { Router } from './routes';
import { ErrorScreen } from './components/error-screen';
import { resetUserData } from './store/slices/features/auth';
import { reportWebVitals } from './reportWebVitals';
import './styles/theme.css';

export const { store, persistor } = reduxStore();

const queryClient = new QueryClient();

export const App = () => {
  useEffect(() => {
    // log user out from all tabs if they log out in one tab
    window.addEventListener('storage', () => {
      if (
        !localStorage.wmsAuthToken ||
        localStorage.wmsAuthToken === undefined
      ) {
        store.dispatch(resetUserData());
      }
    });
  }, []);

  return (
    <React.StrictMode>
      <ErrorBoundary FallbackComponent={ErrorScreen}>
        <Provider store={store} data-testid="app">
          <PersistGate loading={null} persistor={persistor}>
            <QueryClientProvider client={queryClient}>
              <I18nextProvider i18n={i18n}>
                <Suspense fallback="loading">
                  <Router />
                </Suspense>
              </I18nextProvider>
            </QueryClientProvider>
          </PersistGate>
        </Provider>
      </ErrorBoundary>
    </React.StrictMode>
  );
};

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
