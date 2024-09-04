/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import React from 'react';
// import { useTranslation } from 'react-i18next';
import wait from '@utils/wait';

const VALID_LANGUAGES = ['dev', 'en'];//, 'es', 'fr', 'de', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];
const ARTIFICIAL_LOAD_DELAY = 2500;
// cache the bundle object
let bundle = null;

// simple wrapper around the useTranslation hook
// to provide a keyFormattedTranslation function
// that allows for formatted translations using 
// an array of replacer keys. 
export default function useLocalization() {
    const hasWindow = typeof window !== 'undefined';
    // const [bundle, setBundle] = React.useState({});
    const [ready, setReady] = React.useState(false);
    const [language, setLanguage] = React.useState(null);

    // try to load the language bundle for the selected locale
    const tryUpdateLanguage = async (locale) => {
        try {return (await import(`../../resources/locales/${locale}-translation.json`)).default} 
        catch (e) { console.error(e) }
        return null;
    }

    // updates selected language bundle with fallback to english
    const onUpdateLanguage = async (locale) => {
        if (!hasWindow || !window.ipc) return;
        let newbundle = await tryUpdateLanguage(locale);
        if (!newbundle) newbundle = await tryUpdateLanguage('en');
        await ipc.invoke("set-config", "locale", locale);
        setLanguage(locale);
        bundle = newbundle;
    }

    // setup the language bundle on mount
    React.useEffect(() => {
        if (!hasWindow || !window.ipc) return;
        if (!language) (async() => {
            const locale = await ipc.invoke("get-config", "locale", "en");
            await wait(ARTIFICIAL_LOAD_DELAY); // artificial delay to show load screen
            await onUpdateLanguage(locale);
            setReady(bundle && Object.keys(bundle).length > 0);
        })();
    }, [hasWindow]);

    // translate to string (inner function ~ not directly exposed)
    const innerT = (pointkey) => {
        let bundle_point = bundle;
        for (const key of pointkey.split('.')) {
            if (!bundle_point[key]) continue;
            bundle_point = bundle_point[key];
        }
        if (Array.isArray(bundle_point)) return bundle_point; 
        if (typeof bundle_point !== 'string') return pointkey;
        return bundle_point ?? pointkey;
    }

    // translate to string
    // replicate the t function from react-i18next useTranslation hook
    const t = React.useCallback((keystring, replacers={}, expectedArraySize=null) => {
        if (!bundle) return keystring;

        const innerM = (bundle_point="") => {
            let matches = bundle_point.match(/{{(.*?)}}/g) ?? [];
            matches = matches.map(key => key.replace(/[{}]/g, ''));
            if (!matches.length) return bundle_point;
    
            for (const match of matches) {
                const data = innerT(match);
                if (match === data) continue;
                bundle_point = bundle_point.replaceAll(`{{${match}}}`, data);
            }
    
            // check for matches in the string and replace them with the replacers
            bundle_point = matches.reduce((acc, match) => {
                let data = replacers;//JSON.parse(JSON.stringify(replacers));
                for (const key of match.split('.')) {
                    if (data[key]) data = data[key];
                }
                return acc.replaceAll(`{{${match}}}`, data);
            }, bundle_point);
    
            return bundle_point;
        }

        let bundle_point = innerT(keystring); // bundle[keystring] ?? keystring;
        if (Array.isArray(bundle_point)) {
            try {
                return bundle_point.map(innerT).map(innerM);// handle array of strings
            } catch (e) {
                console.error(e);
                return [];
            }
        }

        const finalized = innerM(bundle_point); // finalized string
        // create array of expected size with finalized elements in each
        if (expectedArraySize) return Array(expectedArraySize).fill(finalized);
        return finalized;

    }, [bundle]);

    // translate to array
    const tA = React.useCallback((keystring, replacersOrSize={}, expectedSize=1) => {
        const replacers = typeof replacersOrSize === 'object' ? replacersOrSize : {};
        if (typeof replacersOrSize === 'number') expectedSize = replacersOrSize;
        return t(keystring, replacers, expectedSize);
    }, [t]);

    // translate to object
    const tO = React.useCallback((keystring) => {
        const result = innerT(keystring);
        if (result === keystring) return null;
        return result;
    }, [t]);

    const changeLanguage = React.useCallback((...args) => {
        onUpdateLanguage(...args);
    }, []);

    const getResourceBundle = React.useCallback((...args) => {
        return bundle;
    }, []);

    return { t, tA, tO, language, changeLanguage, ready, VALID_LANGUAGES };
};
