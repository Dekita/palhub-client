/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import React from 'react';
import { useTranslation } from 'react-i18next';

const VALID_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];

// simple wrapper around the useTranslation hook
// to provide a keyFormattedTranslation function
// that allows for formatted translations using 
// an array of replacer keys. 
export default function useLocalization() {
    const { t, i18n, ready } = useTranslation();

    // Returns a translation string with formatted values based on the replacer_keys
    // eg: json: {main_key: 'Hello, {{key1}}!', key1: 'World'}
    // keyFormattedTranslation('main_key', ['key1'])
    const keyFormattedTranslation = React.useCallback((main_key, replacer_keys, extra_replacers={}) => {
        if (!ready) return main_key;
        const reducer = (acc, key) => ({...acc, [key]: t(key)});
        return i18n.t(main_key, replacer_keys.reduce(reducer, extra_replacers));
    }, [i18n]);

    // Auto scan the main key for translations:
    // eg: json: {main_key: 'Hello, {{key1}}!', key1: 'World'}
    // autoT('main_key')
    // autoT('main_key', {key1: 'World'})
    const autoT = React.useCallback((main_key, extra_replacers={}) => {
        if (!ready) return main_key;
        const base_text = i18n.t(main_key);
        if (!base_text.includes('{{')) return base_text;
        const mapper = (key) => key.replace(/[{}]/g, '');
        const filterer = (key) => !extra_replacers.hasOwnProperty(key);
        const replacer_keys = base_text.match(/{{(.*?)}}/g).map(mapper).filter(filterer);
        return keyFormattedTranslation(main_key, replacer_keys, extra_replacers);
    }, [ready, i18n, keyFormattedTranslation]);

    return { t, i18n, ready, autoT, keyFormattedTranslation, VALID_LANGUAGES };
};
