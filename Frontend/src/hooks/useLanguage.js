import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { getTranslation } from '../services/translations';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    console.error('useLanguage must be used within LanguageProvider');
    // Return default values if context is not available
    return {
      language: 'en',
      toggleLanguage: () => console.warn('Language toggle not available'),
      t: (path) => path
    };
  }

  const { language, toggleLanguage } = context;

  const t = (path) => {
    return getTranslation(language, path);
  };

  return { language, toggleLanguage, t };
};
