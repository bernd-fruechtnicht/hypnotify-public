import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Localization from 'expo-localization';
import i18n from '../services/i18n';
import { logger } from '../utils/logger';

interface LanguageContextType {
  currentLanguage: string;
  availableLanguages: { code: string; name: string; nativeName: string }[];

  changeLanguage: (languageCode: string) => Promise<void>;
  isDeviceLanguage: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const availableLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
];

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const [isDeviceLanguage, setIsDeviceLanguage] = useState(true);
  const [_isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize language detection
    const initializeLanguage = async () => {
      try {
        // Wait for i18n to be ready
        await i18n.loadLanguages([i18n.language]);

        const deviceLocales = Localization.getLocales();
        const deviceLanguage = deviceLocales[0]?.languageCode || 'en';
        const supportedDeviceLanguage = availableLanguages.find(
          lang => lang.code === deviceLanguage
        );

        if (supportedDeviceLanguage) {
          setIsDeviceLanguage(currentLanguage === deviceLanguage);
        } else {
          setIsDeviceLanguage(false);
        }

        setIsInitialized(true);
        logger.debug(
          'LanguageContext: Initialized with language:',
          currentLanguage
        );
      } catch (error) {
        logger.error('LanguageContext: Failed to initialize:', error);
        setIsInitialized(true);
      }
    };

    initializeLanguage();
  }, [currentLanguage]);

  const changeLanguage = async (languageCode: string) => {
    try {
      logger.debug('LanguageContext: Changing language to:', languageCode);

      // Load the language resources first
      await i18n.loadLanguages([languageCode]);

      // Change the language
      await i18n.changeLanguage(languageCode);

      // Update local state
      setCurrentLanguage(languageCode);

      // Check if this is the device language
      const deviceLocales = Localization.getLocales();
      const deviceLanguage = deviceLocales[0]?.languageCode || 'en';
      setIsDeviceLanguage(languageCode === deviceLanguage);

      logger.debug(
        'LanguageContext: Language changed successfully to:',
        languageCode
      );
    } catch (error) {
      logger.error('LanguageContext: Failed to change language:', error);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    isDeviceLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
