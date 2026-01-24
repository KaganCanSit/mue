import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initTranslations, translations } from 'lib/translations';
import variables from 'config/variables';
import EventBus from 'utils/eventbus';

const TranslationContext = createContext();

export function TranslationProvider({ children, initialLanguage }) {
  const [languagecode, setLanguagecode] = useState(initialLanguage);

  const changeLanguage = useCallback((newLanguage) => {
    // Update the i18n instance
    variables.language = initTranslations(newLanguage);
    variables.languagecode = newLanguage;
    document.documentElement.lang = newLanguage.replace('_', '-');

    // Update tab name if it's still the default
    if (localStorage.getItem('tabName') === variables.getMessage('tabname')) {
      const newTabName = translations[newLanguage.replace('-', '_')]?.tabname || variables.getMessage('tabname');
      localStorage.setItem('tabName', newTabName);
      document.title = newTabName;
    }

    // Update state to trigger re-render
    setLanguagecode(newLanguage);
  }, []);

  useEffect(() => {
    const handleLanguageChange = (data) => {
      if (data?.language) {
        changeLanguage(data.language);
      }
    };

    EventBus.on('languageChange', handleLanguageChange);

    return () => {
      EventBus.off('languageChange', handleLanguageChange);
    };
  }, [changeLanguage]);

  return (
    <TranslationContext.Provider value={{ languagecode, changeLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// Hook for reactive translations - triggers re-render when language changes
export function useMessage(key, optional = {}) {
  const { languagecode } = useTranslation();
  // The languagecode dependency ensures this hook re-evaluates when language changes
  // This is intentional - we use it to trigger re-renders even though it's not directly used
  return languagecode ? variables.getMessage(key, optional) : '';
}
