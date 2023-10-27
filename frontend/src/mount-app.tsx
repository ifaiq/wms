/* eslint-disable @typescript-eslint/no-unused-vars */

import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { App } from './app';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('../package.json');

const { version } = packageJson;
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new Integrations.BrowserTracing()],
  environment: process.env.REACT_APP_ENV,
  release: version,
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
});

const mount = (element: Element | Document | DocumentFragment | null) =>
  ReactDOM.render(<App />, element);

const devRoot = document.querySelector('#root');
mount(devRoot);

export { mount };
