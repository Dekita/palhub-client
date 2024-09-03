/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
// import react and core layout
import React from 'react';
import Layout from '@components/core/layout';
import useLocalization from '@hooks/useLocalization';
// Import global stylesheets
import 'bootstrap/dist/css/bootstrap.css';
import '@styles/dek-style.css';
import '@styles/globals.css';

export default function MainAppWrapper({ Component, pageProps }) {
    const { ready } = useLocalization();
    // console.log({Component, pageProps});
    return <Layout ready={ready}>
        <Component {...pageProps}/>
    </Layout>

};
