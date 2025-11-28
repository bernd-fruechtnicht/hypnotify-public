import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translation files
import enCommon from '../locales/en/common.json';
import deCommon from '../locales/de/common.json';
import zhCommon from '../locales/zh/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  de: {
    common: deCommon,
  },
  zh: {
    common: zhCommon,
  },
};

// Get device language and map to supported languages
const getDeviceLanguage = (): string => {
  const deviceLocales = Localization.getLocales();
  const deviceLocale = deviceLocales[0]?.languageCode || 'en';

  // Map device language to supported languages
  const supportedLanguages = ['en', 'de', 'zh'];
  if (supportedLanguages.includes(deviceLocale)) {
    return deviceLocale;
  }

  // Default to English if device language is not supported
  return 'en';
};

i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common'],

  interpolation: {
    escapeValue: false, // React already does escaping
  },

  react: {
    useSuspense: false, // Disable suspense for React Native
  },

  // Ensure proper initialization
  initImmediate: false,
  load: 'languageOnly',

  // Debug mode for development
  debug: __DEV__,
});

export default i18n;
