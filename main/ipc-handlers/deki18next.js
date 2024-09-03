import deki18n from '../../utils/i18n';
import { Emitter } from '../dek/palhub';


const VALID_LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'pt', 'ru', 'zh'];

// Returns a translation string with formatted values based on the replacer_keys
// eg: json: {main_key: 'Hello, {{key1}}!', key1: 'World'}
// keyFormattedTranslation('main_key', ['key1'])
// keyFormattedTranslation('main_key', [], {key1: 'World'})
const keyFormattedTranslation = (main_key, replacer_keys=[], replacers={}) => {
    // if (!deki18n.ready) return main_key;
    const reducer = (acc, key) => ({...acc, [key]: t(key)});
    return deki18n.t(main_key, replacer_keys.reduce(reducer, replacers));
};

const autoT = (event, main_key, replacers={}) => {
    // if (!deki18n.ready) return main_key;
    const base_text = deki18n.t(main_key);
    if (!base_text.includes('{{')) return base_text;
    const mapper = (key) => key.replace(/[{}]/g, '');
    const filterer = (key) => !extra_replacers.hasOwnProperty(key);
    const replacer_keys = base_text.match(/{{(.*?)}}/g).map(mapper).filter(filterer);
    return keyFormattedTranslation(main_key, replacer_keys, replacers);
}

const t = (event, ...args) => deki18n.t(...args);

const changeLanguage = (event, lang) => {
    deki18n.changeLanguage(lang, ()=>{
        Emitter.emit('language-change', lang);
    });
}

const getLanguage = (event) => deki18n.language;

const getBundle = (event, ...args) => deki18n.getResourceBundle(...args);

export default (event, action, ...args) => {
    switch (action) {
        case 't': return t(event, ...args);
        case 'autoT': return autoT(event, ...args);
        case 'changeLanguage': return changeLanguage(event, ...args);
        case 'getLanguage': return getLanguage(event);
        case 'getBundle': return getBundle(event, ...args);
        case 'VALID_LANGUAGES': return VALID_LANGUAGES;
        default: return console.error(`deki18next function ${action} not found`);
    }
}