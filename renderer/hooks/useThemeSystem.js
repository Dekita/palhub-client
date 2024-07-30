/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/
import { useState } from 'react';

// theme files should be located in /public/themes
export const THEMES = [
    'gpt1', 
    
    'vivid1',

    'ikon',

    'dek-dark',
    'dek-light',

    'steg1',

    '1',
    '2',
    '3',
    '4',
    '5',
    '6',

    'burnt-orange',
    'khakii',
    'metroid1',
    'metroid2',
    'nature1',
    'nature2',
    'nature3',
    'nature4',
    'purple1',
    'purple2',
];

export default function useThemeSystem() {
    let base_theme_id = 0;
    if (typeof window !== 'undefined') {
        // localStorage.setItem(key, value)
        base_theme_id = window.localStorage.getItem('utheme-id') || 0;
    }
    // const [theme_id, setTempThemeID] = useState(parseInt(base_theme_id));
    const [theme_id, setTempThemeID] = useState(0);

    // return theme_id and setter function for hook
    return [
        theme_id,
        (newtheme) => {
            if (typeof window === 'undefined') return null;
            if (!THEMES.includes(newtheme)) return null;
            const new_id = THEMES.indexOf(newtheme);
            localStorage.setItem('utheme-id', new_id);
            setTempThemeID(new_id);
            return new_id;
        },
    ];
}
