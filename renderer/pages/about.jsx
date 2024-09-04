/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import Link from 'next/link';
// import Image from 'next/image';

import * as CommonIcons from '@config/common-icons';
import useLocalization from '@hooks/useLocalization';
import useSelectedGame from '@hooks/useSelectedGame';

export default function AboutPage() {
    const game = useSelectedGame();
    const { t, tA } = useLocalization();

    return <div className="container">
        <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
            <div className="mx-auto px-3 py-5">
                <h1 className="font-bold mb-4">{t('/about.head')}</h1>
                <p className="mb-4">{t('/about.desc')}</p>
                <Link href="https://discord.gg/WyTdramBkm" target='_blank' className='w-100 btn btn-dark hover-success py-3 px-4'>
                    <CommonIcons.discord height='2rem' fill='currentColor' style={{ opacity: 0.5 }} />
                    <strong className='ps-2'>{t('/about.discord')}</strong>
                </Link>
                <div className='alert alert-warning text-center mt-3'>
                    <strong>{t('/about.notice')}</strong>
                </div>
                <div className='row'>
                    <div className='col-12 col-xl-6'>
                        <h2 className="font-bold">{t('/about.features.head')}</h2>
                        <ul className='px-0'>
                            {tA('/about.features.list').map((feature, idx) => <li key={idx}>{feature}</li>)}
                        </ul>
                        <Link href="https://www.patreon.com/dekitarpg" target='_blank' className='w-100 btn btn-info py-3 px-4 mb-2 mb-xl-0'>
                            <CommonIcons.patreon height='2rem' fill='currentColor' style={{ opacity: 0.5 }} />
                            <strong className='ps-2'>{t('/about.patreon')}</strong>
                        </Link>
                    </div>
                    <div className='col-12 col-xl-6 d-grid gap-2'>
                        <Link href="/privacy" className='w-100 btn btn-dark hover-success py-3 px-4'>
                            <CommonIcons.privacy height='2rem' fill='currentColor' style={{ opacity: 0.5 }} />
                            <strong className='ps-2'>{t('/privacy.name')}</strong>
                        </Link>
                        <Link href="/terms" className='w-100 btn btn-dark hover-success py-3 px-4'>
                            <CommonIcons.terms height='2rem' fill='currentColor' style={{ opacity: 0.5 }} />
                            <strong className='ps-2'>{t('/terms.name')}</strong>
                        </Link>
                        <Link href="/faq" className='w-100 btn btn-dark hover-success py-3 px-4'>
                            <CommonIcons.question height='2rem' fill='currentColor' style={{ opacity: 0.5 }} />
                            <strong className='ps-2'>{t('/faq.name')}</strong>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </div>;
}
