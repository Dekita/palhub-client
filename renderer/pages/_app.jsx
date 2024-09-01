/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import react and core layout
import React from 'react';
import Layout from '@components/core/layout';
// Import i18next provider to handle localizations
import { I18nextProvider } from 'react-i18next';
// Import customized & initialized i18n instance
import i18n from '@utils/i18n';  
// Import global stylesheets
import 'bootstrap/dist/css/bootstrap.css';
import '@styles/dek-style.css';
import '@styles/globals.css';

export default function MainAppWrapper({ Component, pageProps }) {
    // console.log({Component, pageProps});
    return <I18nextProvider i18n={i18n}>
        <Layout>
            <Component {...pageProps}/>
        </Layout>
    </I18nextProvider>;
};