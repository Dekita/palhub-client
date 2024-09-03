/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import React from 'react';
// import { useTranslation } from 'react-i18next';
import wait from '@utils/wait';

const VALID_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];


// simple wrapper around the useTranslation hook
// to provide a keyFormattedTranslation function
// that allows for formatted translations using 
// an array of replacer keys. 
export default function useLocalization() {
    const hasWindow = typeof window !== 'undefined';
    const [bundle, setBundle] = React.useState({});
    const [ready, setReady] = React.useState(false);
    const [language, setLanguage] = React.useState(null);

    React.useEffect(() => {
        if (!hasWindow) return;
        if (!window.deki18next) return;

        const onUpdateLanguage = async (newlang) => {
            const newbundle = await window.deki18next.getBundle(newlang);
            setReady(Object.keys(newbundle).length > 0);
            setBundle(newbundle);
            setLanguage(newlang);
        }

        const onSetup = async() => {
            const newlang = await window.deki18next.getLanguage();
            await onUpdateLanguage(newlang);
        };

        if (!language) onSetup();

        const removeOnUpdateHandler = window.ipc.on('language-change', onUpdateLanguage);
        return () => removeOnUpdateHandler();
    }, [hasWindow, language]);



    
    // replicate the useTranslation hook data from react-i18next
    const t = React.useCallback((keystring, replacers={}) => {

        // let bundle_point = bundle;
        // for (const key of keystring.split('.')) {
        //     if (!bundle_point[key]) continue;
        //     bundle_point = bundle_point[key];
        // }
        // if (typeof bundle_point !== 'string') return keystring;

        const innerT = (pointkey) => {
            let bundle_point = bundle;
            for (const key of pointkey.split('.')) {
                if (!bundle_point[key]) continue;
                bundle_point = bundle_point[key];
            }
            if (typeof bundle_point !== 'string') return pointkey;
            return bundle_point ?? pointkey;
        }

        let bundle_point = innerT(keystring);
        
        const mapper = (key) => key.replace(/[{}]/g, '');
        let matches = bundle_point.match(/{{(.*?)}}/g) ?? [];
        if (!matches.length) return bundle_point;

        for (const match of matches.map(mapper)) {
            const data = innerT(match);
            if (match === data) continue;
            bundle_point = bundle_point.replaceAll(`{{${match}}}`, data);
        }

        // check for matches in the string and replace them with the replacers
        bundle_point = matches.map(mapper).reduce((acc, match) => {
            let data = replacers;//JSON.parse(JSON.stringify(replacers));
            for (const key of match.split('.')) {
                if (data[key]) data = data[key];
            }
            return acc.replaceAll(`{{${match}}}`, data);
        }, bundle_point);

        return bundle_point;
    }, [bundle]);

    const changeLanguage = React.useCallback((...args) => {
        window?.deki18next?.changeLanguage(...args);
    }, []);

    const getResourceBundle = React.useCallback((...args) => {
        return window?.deki18next?.getBundle(...args);
    }, []);

    const i18n = { t, language, changeLanguage, getResourceBundle };

    // // Returns a translation string with formatted values based on the replacer_keys
    // // eg: json: {main_key: 'Hello, {{key1}}!', key1: 'World'}
    // // keyFormattedTranslation('main_key', ['key1'])
    // const keyFormattedTranslation = React.useCallback((main_key, replacer_keys, extra_replacers={}) => {
    //     if (!ready) return main_key;
    //     const reducer = (acc, key) => ({...acc, [key]: t(key)});
    //     return i18n.t(main_key, replacer_keys.reduce(reducer, extra_replacers));
    // }, [i18n]);

    // // Auto scan the main key for translations:
    // // eg: json: {main_key: 'Hello, {{key1}}!', key1: 'World'}
    // // autoT('main_key')
    // // autoT('main_key', {key1: 'World'})
    // const autoT = React.useCallback((main_key, extra_replacers={}) => {
    //     if (!ready) return main_key;
    //     const base_text = i18n.t(main_key);
    //     if (!base_text.includes('{{')) return base_text;
    //     const mapper = (key) => key.replace(/[{}]/g, '');
    //     const filterer = (key) => !extra_replacers.hasOwnProperty(key);
    //     const replacer_keys = base_text.match(/{{(.*?)}}/g).map(mapper).filter(filterer);
    //     return keyFormattedTranslation(main_key, replacer_keys, extra_replacers);
    // }, [ready, i18n, keyFormattedTranslation]);

    return { t, i18n, ready, VALID_LANGUAGES };
};
