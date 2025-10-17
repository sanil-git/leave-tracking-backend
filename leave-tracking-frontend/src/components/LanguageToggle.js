import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  // Load saved language preference on mount
  React.useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  return (
    <div className="flex items-center space-x-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <button
        onClick={toggleLanguage}
        className="flex items-center space-x-1 text-sm font-medium transition-colors"
        aria-label="Toggle language"
      >
        <span 
          className={`${
            i18n.language === 'en' 
              ? 'text-purple-700 font-bold' 
              : 'text-gray-500'
          } transition-colors`}
        >
          EN
        </span>
        <span className="text-gray-400">|</span>
        <span 
          className={`${
            i18n.language === 'hi' 
              ? 'text-purple-700 font-bold' 
              : 'text-gray-500'
          } transition-colors`}
        >
          हिं
        </span>
      </button>
    </div>
  );
};

export default LanguageToggle;



