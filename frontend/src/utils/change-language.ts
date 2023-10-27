import i18next from 'i18next';
import { LANGUAGE } from '../constants/language';

/**
 * @param language
 * @description This function changes the application language
 * on the basis of language {string}  passed to it
 */
export const changeAppLanguage = (language: string) => {
  if (language === LANGUAGE.ENGLISH) {
    i18next.changeLanguage(LANGUAGE.ENGLISH);
  } else if (language === LANGUAGE.URDU) {
    i18next.changeLanguage(LANGUAGE.URDU);
  }
};
