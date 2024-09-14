/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { parse } from 'dotenv';
import { useEffect, useState } from 'react';

// theme files should be located in /public/themes
export const THEMES = [
    'palhub', 
    'ikon',
    'khakii',
    
    
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    
    // 'vivid1',
    // 'dek-dark',
    // 'dek-light',
    // 'steg1',
    // 'burnt-orange',
    // 'nature2',
    // 'nature3',
    // 'nature4',
    // 'purple1',
    // 'purple2',
];


export default function useThemeSystem() {
    // const [theme_id, setTempThemeID] = useState(parseInt(base_theme_id));
    const [theme_id, setTempThemeID] = useState(0);
    const [bg_id, setTempBgID] = useState(0);

    const setThemeID = (newtheme) => {
        if (typeof window === 'undefined') return null;
        if (!THEMES.includes(newtheme)) return null;
        const new_id = THEMES.indexOf(newtheme);
        localStorage.setItem('utheme-id', new_id);
        setTempThemeID(new_id);
        return new_id;
    };

    const setBgID = (newbg, gameid) => {
        if (typeof window === 'undefined') return null;
        if (newbg < 0 || newbg >= 10) return null;
        localStorage.setItem('utheme-bg', newbg);
        setTempBgID(newbg);
        return newbg;
    }

    useEffect(() => {
        let base_theme_id = 0;
        let base_theme_bg = 0;
        if (typeof window !== 'undefined') {
            // localStorage.setItem(key, value)
            base_theme_id = window.localStorage.getItem('utheme-id') || 0;
            base_theme_bg = window.localStorage.getItem('utheme-bg') || 0;
        }
        setTempThemeID(parseInt(base_theme_id));
        setTempBgID(parseInt(base_theme_bg));
    }, []);

    // return theme_id and setter function for hook
    return [
        theme_id,
        setThemeID,
        bg_id,
        setBgID,
    ];
}
