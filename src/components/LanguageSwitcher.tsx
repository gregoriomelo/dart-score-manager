import React from 'react';
import { useI18n } from '../hooks/useI18n';
import './LanguageSwitcher.css';

const LanguageSwitcher: React.FC = () => {
  const { changeLanguage, currentLanguage } = useI18n();

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        aria-label="Switch to English"
        title="English"
      >
        🇺🇸 EN
      </button>
      <button
        className={`lang-btn ${currentLanguage === 'pt-BR' ? 'active' : ''}`}
        onClick={() => changeLanguage('pt-BR')}
        aria-label="Mudar para Português Brasileiro"
        title="Português Brasileiro"
      >
        🇧🇷 PT-BR
      </button>
    </div>
  );
};

export default LanguageSwitcher;
