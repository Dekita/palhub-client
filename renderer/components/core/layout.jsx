/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import Head from 'next/head';
import React, { useState, cloneElement, Children, useMemo } from 'react';
import { useRouter } from 'next/router';
import useThemeSystem, { THEMES } from '@hooks/useThemeSystem';
import useWindowNameFromDEAP from '@hooks/useWindowNameFromDEAP';
import NavbarModal from '@components/modals/navbar';
import MetaHead from '@components/core/metahead';
import Appbar from '@components/core/appbar';
import Navbar from '@components/core/navbar';
import Footer from '@components/core/footer';
import { PongSpinner } from 'react-spinners-kit';
import useLocalization from '@hooks/useLocalization';
import useDeepLinkListener from '@hooks/useDeepLinkListener';
import useAppLogger from '@hooks/useAppLogger';

function GoogleTagManager() {
    const enabled = process.env.GOOGLE_TAG_ENABLED;
    const id = process.env.GOOGLE_TAG_ID;
    if (!enabled) return null;
    return <React.Fragment>
        <Script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
        <Script id="google-analytics">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', ${id});
        `}
        </Script>
    </React.Fragment>
}


export default function DekAppLayoutWrapper({ children }) {
    const { ready } = useLocalization();
    const logger = useAppLogger("core/layout");
    const [deepLink, linkChanged, consumeDeepLink] = useDeepLinkListener();

    if (linkChanged) {
        logger('info', `Consumed Deep Link: ${deepLink}`);
        const { segments, params } = consumeDeepLink();
        logger('info', `AFTER Consumed Deep Link: ${segments.join('/')}`);
        logger('info', `AFTER Consumed Deep Query: ${JSON.stringify(params)}`);
    }

    // const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [theme_id, setThemeID, bg_id, setBgID] = useThemeSystem();
    const [showNavbarModal, setShowNavbarModal] = useState(false);
    const windowName = useWindowNameFromDEAP();
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

    const can_show_navbar = windowName && !['help'].includes(windowName);
    const nonav_page = can_show_navbar ? '' : 'game-bg-full';
    // console.log({theme_id, bg_id, windowName});

    // ready = false;

    return <React.Fragment>
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
            {/* Main application page contents */}
            {ready && <React.Fragment>
                {/* Appbar is shown (unless viewport is sm) */}
                <Appbar />
                {/* Show the main app navbar */}
                {can_show_navbar && <Navbar modals={modals} />}
                {/* Show the main application page contents */}
                <div id='main-body' className={`main-body h-full ${nonav_page} ${bg}`} style={bodystyle}>
                    {/* Add modals data to children to allow settings and store modal control */}
                    {Children.map(children, (child) => cloneElement(child, { modals, ThemeController }))}
                </div>
                {/* Add the navbar modal (shown when click hamburger menu on sm viewport) */}
                <NavbarModal show={showNavbarModal} setShow={setShowNavbarModal} />
                {/* Add the footer to the page */}
                {can_show_navbar && <Footer />}
            </React.Fragment>}
            {/* A basic loading page for when app/localization is finished loading */}
            {/* deap-dragbar to still allow for the window to be moved while loading */}
            {!ready && <div className={`main-body h-full game-bg-full ${bg} deap-dragbar`}>
                <div className='h-100 d-flex justify-content-center align-items-center'>
                    <div className='d-grid text-center text-secondary'>
                        <PongSpinner color='currentColor' size={256} />
                        <strong className='mt-3'>Loading</strong>
                    </div>
                </div>
            </div>}
        </div>
    </React.Fragment>;
}
