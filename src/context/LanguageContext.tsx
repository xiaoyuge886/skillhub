import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language } from '../i18n/translations';

console.log('Loaded translations:', translations);

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    console.log('Loading language from localStorage:', savedLang);
    if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    console.log('Setting language to:', lang);
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string) => {
    if (!translations[language]) {
      console.error(`Language ${language} not found in translations`);
      return key;
    }

    const keys = key.split('.');
    let current: any = translations[language];
    
    console.log(`Translating ${key} for language ${language}`);

    for (const k of keys) {
      if (current === undefined || current[k] === undefined) {
        console.warn(`Translation key not found: ${key} for language: ${language}`);
        return key;
      }
      current = current[k];
    }
    
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
