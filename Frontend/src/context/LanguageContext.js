import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('language');
      return saved === 'en' ? 'en' : 'hi'; // Default to Hindi
    } catch (error) {
      console.warn('localStorage not available:', error);
      return 'hi';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch (error) {
      console.warn('Could not save language to localStorage:', error);
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => {
      const newLang = prev === 'hi' ? 'en' : 'hi';
      return newLang;
    });
  };

  const value = { language, toggleLanguage };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
