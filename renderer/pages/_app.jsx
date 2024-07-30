import React from 'react';
import Layout from '@components/core/layout';
import 'bootstrap/dist/css/bootstrap.css';
import '@styles/dek-style.css';
import '@styles/globals.css';

export default function MainAppWrapper({ Component, pageProps }) {
    // console.log('pageProps', pageProps, Component);
    return <Layout><Component {...pageProps}/></Layout>
};