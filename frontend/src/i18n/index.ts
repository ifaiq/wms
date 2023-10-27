import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import commonEn from './en/common.json';
import commonUr from './ur/common.json';
import vendorEn from './en/vendor.json';
import vendorUr from './ur/vendor.json';
import authEn from './en/auth.json';
import authUr from './ur/auth.json';
import poEn from './en/purchase-order.json';
import poUr from './ur/purchase-order.json';
import grnEn from './en/grn.json';
import grnUr from './ur/grn.json';
import transferUr from './ur/transfer.json';
import transferEn from './en/transfer.json';
import adjustmentEn from './en/adjustment.json';
import adjustmentUr from './ur/adjustment.json';
import locationsEn from './en/locations.json';
import locationsUr from './ur/locations.json';
import userEn from './en/user.json';
import userUr from './ur/user.json';
import invoiceEn from './en/invoices.json';
import invoiceUr from './ur/invoices.json';

i18next
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(Backend)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {},
    resources: {
      en: {
        common: commonEn,
        vendor: vendorEn,
        auth: authEn,
        po: poEn,
        grn: grnEn,
        transfer: transferEn,
        adjust: adjustmentEn,
        location: locationsEn,
        user: userEn,
        invoice: invoiceEn
      },
      ur: {
        common: commonUr,
        vendor: vendorUr,
        auth: authUr,
        po: poUr,
        grn: grnUr,
        transfer: transferUr,
        adjust: adjustmentUr,
        location: locationsUr,
        user: userUr,
        invoice: invoiceUr
      }
    },
    react: { useSuspense: false }
  });

export default i18next;
