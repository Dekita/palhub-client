import i18n from 'i18next';

// import ElectronBackend from 'i18next-electron-fs-backend'; // For electron backend 
// import HTTPBackend from 'i18next-http-backend'; // For client-side loading only
import FSBackend from 'i18next-fs-backend'; // For server-side loading only

// import LanguageDetector from 'i18next-browser-languagedetector'; // For client-side language detection
// import { initReactI18next } from 'react-i18next';
import path from 'path';
import { app } from 'electron';


let localeLoadPath = 'locales/{{lng}}-{{ns}}.json';
if (app.isPackaged) localeLoadPath = path.join(process.resourcesPath, localeLoadPath); // Packaged 
else localeLoadPath = path.join(app.getAppPath(), 'resources', localeLoadPath); // Development mode

console.log('Setting external localeLoadPath:', localeLoadPath);

i18n
// load translation using http -> see /public/locales
// learn more: https://github.com/i18next/i18next-http-backend
.use(FSBackend)

// detect user language
// learn more: https://github.com/i18next/i18next-browser-languageDetector
// .use(LanguageDetector)

// pass the i18n instance to react-i18next.
// .use(initReactI18next)

// init i18next
// for all options read: https://www.i18next.com/overview/configuration-options
.init({
    // lng: 'en', // Default language. dont use with language detector
    fallbackLng: 'en',
    backend: {
        loadPath: localeLoadPath,  
    },

    // localePath: localeLoadPath,
    
    // other options you might configure
    debug: true,
    // reloadOnPrerender: false,
    // saveMissing: false, // Disable saveMissing for client
    // saveMissingTo: "current",

    react: {
        useSuspense: false, // Disable suspense mode for React (optional)
    },
    interpolation: {
        escapeValue: false, // React already escapes values, no need to do it again
    },
});

export default i18n;