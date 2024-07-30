/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

import Head from 'next/head';
import { useRouter } from 'next/router';




export default function MetaHead({ title, desc, url = null }) {
    const router = useRouter();
    // const protocol = (window||{})?.location.protocol ?? '';
    // const hostname = (window||{})?.location.hostname ?? '';
    const protocol =
        typeof window !== 'undefined' && window.location.protocol
            ? window.location.protocol
            : '';
    const hostname =
        typeof window !== 'undefined' && window.location.hostname
            ? window.location.hostname
            : '';
    // const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';

    // const origin = window?.location.origin ?? '';

    const host_url = `${protocol}//${hostname}`;
    // const svg = `${host_url}/api/svg?header=${title}&caption=${desc}`;
    const svg = `/logo.webp`;
    url = `${host_url}${url ?? router.pathname}`;

    return (
        <Head>
            {/* <!-- General --> */}
            <title>{title}</title>
            <meta name='url' content={url} />
            <link rel='canonical' href={url} />
            <meta name='description' content={desc} />
            <meta
                name='viewport'
                content='width=device-width, initial-scale=1'
            />
            {/* <!-- Various OS Icons- credit: https://realfavicongenerator.net --> */}
            <link
                rel='apple-touch-icon'
                sizes='180x180'
                href='/apple-touch-icon.png'
            />
            <link
                rel='icon'
                type='image/png'
                sizes='32x32'
                href='/favicon-32x32.png'
            />
            <link
                rel='icon'
                type='image/png'
                sizes='16x16'
                href='/favicon-16x16.png'
            />
            <link rel='manifest' href='/site.webmanifest' />
            <link
                rel='mask-icon'
                href='/safari-pinned-tab.svg'
                color='#5bbad5'
            />
            <meta name='msapplication-TileColor' content='#ac0be3' />
            <meta name='theme-color' content='#ac0be3' />
            {/* <!-- Google / Search Engine Tags --> */}
            <meta itemProp='name' content={title} />
            <meta itemProp='description' content={desc} />
            <meta itemProp='image' content={svg} />
            {/* <!-- Discord / Facebook Meta Tags --> */}
            <meta property='og:type' content='website' />
            <meta property='og:site_name' content='palhub.dekitarpg.com' />
            <meta property='og:title' content={title} />
            <meta property='og:description' content={desc} />
            <meta property='og:url' content={url} />
            <meta property='og:image' content={svg} />
            {/* <!-- Twitter Meta Tags --> */}
            <meta name='twitter:site' content={url} />
            <meta name='twitter:creator' content='@dekitarpg' />
            <meta name='twitter:card' content='summary_large_image' />
            <meta name='twitter:title' content={title} />
            <meta name='twitter:description' content={desc} />
            <meta name='twitter:image' content={svg} />
        </Head>
    );
}
