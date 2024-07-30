import React from 'react';
import Head from 'next/head';

export default function AppHeadComponent() {
    const commonTitle = "PalHUB Client: Palworld Mod Manager & Server Listing Service";

    return <React.Fragment>
        <Head>
            <title>{commonTitle}</title>
        </Head>
    </React.Fragment>
}

