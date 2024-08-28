/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

import Head from 'next/head';
import { useState, cloneElement, Children, useMemo } from 'react';
import { useRouter } from 'next/router';
import useThemeSystem, { THEMES } from '@hooks/useThemeSystem';
import SettingsModal from '@components/modals/settings';
import NavbarModal from '@components/modals/navbar';
import MetaHead from '@components/core/metahead';
import Appbar from '@components/core/appbar';
import Navbar from '@components/core/navbar';
import Footer from '@components/core/footer';
import Dektionary from 'config/dektionary';


function GoogleTagManager() {
    const enabled = process.env.GOOGLE_TAG_ENABLED;
    const id = process.env.GOOGLE_TAG_ID;
    if (!enabled) return null;
    return <>
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
        <Script id="google-analytics">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', ${id});
        `}
        </Script>
    </>
}

export default function Layout({ children }) {
    // const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [theme_id, setThemeID, bg_id, setBgID] = useThemeSystem();
    const [showNavbarModal, setShowNavbarModal] = useState(false);
    const theme = `/themes/${THEMES[theme_id]}.css`;
    const active_route = useRouter().pathname;
    const bg = `game-bg-palworld${bg_id+1}`;

    const modals = {
        // onClickSettings: () => setShowSettingsModal(true),
        onClickHamburger: () => setShowNavbarModal(true),
    };

    const isbasepath = active_route !== '/';
    const bodystyle = isbasepath ? {overflowY: 'scroll'} : {};
    const commonTitle = "PalHUB Client";

    const ThemeController = useMemo(() => {
        return {
            theme_id,
            setThemeID,
            themes: THEMES,
            bg_id, setBgID,
        }
    }, [theme_id, bg_id]);

    console.log({theme_id, bg_id});

    return (
        <>
            {/* <!-- Load theme style: not best practice --> */}
            <Head><link rel='stylesheet' href={theme} /></Head>
            
            {/* <!-- use metahead component to dynamically set social media embeddings per page --> */}
            <MetaHead
                title={commonTitle}
                desc={commonTitle}
                url={active_route}
            />

            <GoogleTagManager />

            <div className='vh-100 theme-bg selection-secondary app-border'>
                <Appbar />
                <Navbar modals={modals} />
                <div id='main-body' className={`main-body h-full ${bg}`} style={bodystyle}>
                    {/* Add modals data to children to allow settings and store modal control */}
                    {Children.map(children, (child) => cloneElement(child, { modals, ThemeController }))}
                </div>
                {/* <SettingsModal
                    themes={THEMES}
                    theme_id={theme_id}
                    setThemeID={setThemeID}
                    show={true}
                    setShow={setShowSettingsModal}
                /> */}
                <NavbarModal
                    show={showNavbarModal}
                    setShow={setShowNavbarModal}
                />                 
                <Footer />
            </div>
        </>
    );
}
