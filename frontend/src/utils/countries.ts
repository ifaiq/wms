import { COUNTRIES } from 'src/constants/common';

export const getCountryName = (code: string) => {
  return COUNTRIES.find((x: any) => x.id === code)?.name || '';
};
