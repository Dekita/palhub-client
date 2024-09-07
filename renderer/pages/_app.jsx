/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import react and core layout
import React from 'react';
import Layout from '@components/core/layout';
import { LocalizationProvider } from '@hooks/useLocalization';
import { DeepLinkProvider } from '@hooks/useDeepLinkListener';

// Import global stylesheets
import 'bootstrap/dist/css/bootstrap.css';
import '@styles/dek-style.css';
import '@styles/globals.css';

export default function MainAppWrapper({ Component, pageProps }) {
    // console.log({Component, pageProps});
    return <LocalizationProvider>
        <DeepLinkProvider>
            <Layout>
                <Component {...pageProps}/>
            </Layout>
        </DeepLinkProvider>
    </LocalizationProvider>
};
