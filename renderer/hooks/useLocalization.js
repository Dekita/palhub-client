/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// simple wrapper around the useTranslation hook
// to provide a keyFormattedTranslation function
// that allows for formatted translations using 
// an array of replacer keys. 
export default function useLocalization() {
    const { t, i18n } = useTranslation();

    // Returns a translation string with formatted values based on the replacer_keys
    // eg: json: {main_key: 'Hello, {{key1}}!', key1: 'World'}
    // keyFormattedTranslation('main_key', ['key1'])
    const keyFormattedTranslation = useCallback((main_key, replacer_keys) => {
        const reducer = (acc, key) => ({...acc, [key]: t(key)});
        return t(main_key, replacer_keys.reduce(reducer, {}));
    }, [t]);

    // Auto scan the main key for translations:
    // eg: json: {main_key: 'Hello, {{key1}}!', key1: 'World'}
    // autoT('main_key')
    const autoT = useCallback((main_key) => {
        const base_text = t(main_key);
        if (!base_text.includes('{{')) return base_text;
        const mapper = (key) => key.replace(/[{}]/g, '');
        const replacer_keys = base_text.match(/{{(.*?)}}/g).map(mapper);
        return keyFormattedTranslation(main_key, replacer_keys);
    }, [t, keyFormattedTranslation]);

    return { t, i18n, autoT };
};
