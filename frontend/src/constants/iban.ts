import { COUNTRY_CODES } from './common';

export const PAKISTAN_IBAN: IBAN = {
  country: COUNTRY_CODES.PAKISTAN,
  sample: 'PK00AAAA0001234567890123',
  format: '^[Pp][Kk][a-zA-Z0-9]{2}s?([a-zA-Z]{4}s?){1}([0-9]{4}s?){4}s?$'
};

export const SAUDI_IBAN: IBAN = {
  country: COUNTRY_CODES.SAUDIARABIA,
  sample: 'SA0380000000608010167519',
  format: '^[Ss][Aa][0-9]{2}s?([0-9]{2})([0-9]{2}s?)([0-9]{4}s?){4}s?$'
};

export const UAE_IBAN: IBAN = {
  country: COUNTRY_CODES.UAE,
  sample: 'AE070331234567890123456',
  format:
    '^[Aa][Ee][0-9]{2}s?([0-9]{3})([0-9]{1}s?)([0-9]{4}s?){3}([0-9]{3})s?$'
};

export const getIBAN = (country: string) => {
  const IBANS: Record<string, any> = {
    [COUNTRY_CODES.PAKISTAN]: PAKISTAN_IBAN,
    [COUNTRY_CODES.UAE]: UAE_IBAN,
    [COUNTRY_CODES.SAUDIARABIA]: SAUDI_IBAN
  };

  return IBANS[country];
};
