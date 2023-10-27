import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { LANGUAGE } from '../../constants/language';
import { changeAppLanguage } from '../../utils/change-language';
import { ButtonPrimary } from 'src/components';

export const Welcome: React.FC = () => {
  const [t] = useTranslation('common');
  const history = useHistory();

  const changeLanguage = (lang: string) => {
    changeAppLanguage(lang);
  };

  return (
    <div className="text-center">
      <header className="bg-white min-h-screen flex flex-col justify-center items-center text-black">
        <img
          src={require('../../assets/images/retailo.png')}
          className="h-60 pointer-events-none motion-safe:animate-pulse"
          alt="logo"
        />
        <p data-cy="welcome-text">
          {t('welcome.title', { framework: 'Retailo' })}
        </p>
        <div className="flex-row">
          <ButtonPrimary
            text={'ur'}
            onClick={() => changeLanguage(LANGUAGE.URDU)}
            dataCy="ur-btn"
          />
          <ButtonPrimary
            text={'en'}
            onClick={() => changeLanguage(LANGUAGE.ENGLISH)}
            dataCy="en-btn"
          />
        </div>
        <p data-cy="description">{t('welcome.description')}</p>
        <div>
          <ButtonPrimary
            text={'Login'}
            onClick={() => history.push('/login')}
            dataCy="en-btn"
          />
        </div>
      </header>
    </div>
  );
};
