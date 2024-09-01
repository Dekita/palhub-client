import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // For client-side language detection
// import ElectronBackend from 'i18next-electron-fs-backend'; // For electron backend 
import HTTPBackend from 'i18next-http-backend'; // For client-side loading only

// i18n.use(ElectronBackend);
i18n.use(HTTPBackend);

// Pass i18n instance to react-i18next
i18n.use(initReactI18next)
// For client-side language detection
i18n.use(LanguageDetector)

// Initialize i18n
i18n.init({
    // lng: 'en', // Default language. dont use with language detector
    fallbackLng: 'en',
    backend: {
        // loadPath: '/locales/{{lng}}/{{ns}}.json',
        // addPath: '/locales/{{lng}}/{{ns}}.missing.json',
        loadPath: '/locales/{{lng}}-{{ns}}.json',
        addPath: '/locales/{{lng}}-{{ns}}.missing.json',
    },
    
    // other options you might configure
    debug: true,
    saveMissing: true,
    saveMissingTo: "current",

    react: {
      useSuspense: false, // Disable suspense mode for React (optional)
    },
    interpolation: {
      escapeValue: false, // React already escapes values, no need to do it again
    },
});

export default i18n;