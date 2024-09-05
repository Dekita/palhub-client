/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
!?// EXAMPLE USAGE: 
!?// add raw-loader to project to load .md and .json files
yarn add raw-loader

!?// Add rules to next..config.js for raw loading md/json files
config.module.rules.push({
    test: /\.(?:[a-zA-Z0-9]+)?\.(md|json)$/, 
    use: 'raw-loader',
});

!?// import file from '@hooks/useLocalization';
import useLocalization, { LocalizationProvider } from '@hooks/useLocalization';

!?// wrap the app root component with the localization provider
!?// this ensures the localization context is available to all 
!?// child components that use the useLocalization hook
export default function RootApplicationComponent() {
    return <LocalizationProvider>
        <...OtherThingsHere />
    </LocalizationProvider>
}

!?// import the useLocalization hook in any component or page
!?// export page or component with localization support
export default PageOrComponent() {
    const { ready, t, tA, tO, language, changeLanguage, VALID_LANGUAGES } = useLocalization();
    if (!ready) return <div>Loading...</div>;
    return <div>{t('key.string', {propname: "value"})}</div>;
}
*/
import React from 'react';
import wait from '@utils/wait';

const VALID_LANGUAGES = ['dev', 'en'];//, 'es', 'fr', 'de', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];
const ARTIFICIAL_LOAD_DELAY = 2500;

// format("Hi name!", {name: 'DekiaRPG}); // Hi DekiaRPG!
function format(base_string, replacers={}) {
    const regstr = Object.keys(replacers).join("|");
    const regexp = new RegExp(regstr,"gi");
    return base_string.replace(regexp, matched => {
        return replacers[matched.toLowerCase()];
    });
}

// Context for Localization
const LocalizationContext = React.createContext();

// Localization Provider Component
export const LocalizationProvider = ({ children }) => {
    const hasWindow = typeof window !== 'undefined';
    const [bundle, setBundle] = React.useState(null);
    const [ready, setReady] = React.useState(false);
    const [language, setLanguage] = React.useState(null);

    // translate to string (inner function ~ not directly exposed)
    const innerT = React.useCallback((pointkey) => {
        if (!bundle) return pointkey;
        let bundle_point = bundle;
        for (const key of pointkey.split('.')) {
            if (!bundle_point[key]) continue;
            bundle_point = bundle_point[key];
        }
        if (Array.isArray(bundle_point)) return bundle_point; 
        if (typeof bundle_point !== 'string') return pointkey;
        return bundle_point;// ?? pointkey;
    }, [bundle]);

    // translate to string with replacers (inner function ~ not directly exposed)
    const innerM = React.useCallback((bundle_point="", replacers={}) => {
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
                if (data[key] !== undefined) data = data[key];
            }
            return acc.replaceAll(`{{${match}}}`, data);
        }, bundle_point);

        return bundle_point;
    }, [innerT]);

    // translate to string based on keystring
    // fairly similar to react-i18next's useTranslation hook in functionality
    const t = React.useCallback((keystring, replacers={}, expectedArraySize=null) => {
        let bundle_point = innerT(keystring); 
        if (Array.isArray(bundle_point)) { // handle array of strings
            try { return bundle_point.map(innerT).map(e => innerM(e, replacers));
            } catch (error) { console.error(e) }
            return [];
        }
        // handle single strings
        const finalized = innerM(bundle_point, replacers); // finalized string
        // create array of expected size with finalized elements in each
        if (expectedArraySize) return Array(expectedArraySize).fill(finalized);
        return finalized;
    }, [bundle, innerT, innerM]);

    // translate to array of strings based on keystring
    const tA = React.useCallback((keystring, replacersOrSize = {}, expectedSize = 1) => {
        const replacers = typeof replacersOrSize === 'object' ? replacersOrSize : {};
        if (typeof replacersOrSize === 'number') expectedSize = replacersOrSize;
        return t(keystring, replacers, expectedSize);
    }, [t]);
  
    // translate to raw object/array/string based on keystring
    const tO = React.useCallback((keystring) => {
        const result = innerT(keystring);
        if (result === keystring) return null;
        return result;
    }, [innerT]);

    // try to load the language bundle for the selected locale
    const tryUpdateLanguage = React.useCallback(async (locale, namespace='dektionary') => {
        try {return (await import(`../locales/${locale}-${namespace}.json`)).default} 
        catch (e) { console.error(e) }
        return null;
    }, []);

    // updates selected language bundle with fallback to english
    const onUpdateLanguage = React.useCallback(async (locale, namespace=undefined) => {
        if (!hasWindow || !window.ipc) return;
        let newBundle = await tryUpdateLanguage(locale, namespace);
        if (!newBundle) newBundle = await tryUpdateLanguage('en', namespace);
        await ipc.invoke("set-config", "locale", locale);
        setBundle(newBundle);
        setLanguage(locale);
        // setReady(newBundle && Object.keys(newBundle).length > 0);
        setReady(true);
    }, [hasWindow]);

    const changeLanguage = React.useCallback((locale, namespace=undefined) => {
        onUpdateLanguage(locale, namespace);
    }, [onUpdateLanguage]);

    // setup the language bundle on mount
    React.useEffect(() => {
        if (!hasWindow || !window.ipc) return;
        if (!language) (async() => {
            const locale = await ipc.invoke("get-config", "locale", "en");
            await wait(ARTIFICIAL_LOAD_DELAY); // artificial delay to show load screen
            await onUpdateLanguage(locale);
        })();
    }, [hasWindow]);

    const exposed = { ready, t, tA, tO, language, changeLanguage, VALID_LANGUAGES };
    return <LocalizationContext.Provider value={exposed}>
        {children}
    </LocalizationContext.Provider>;
};

// Export actual hook to useLocalization
export default function useLocalization() {
    return React.useContext(LocalizationContext);
};

// dekitarpg@gmail.com