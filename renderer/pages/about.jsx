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
import GameCardComponent from '@components/game-card';
import game_map from '@main/dek/game-map';

export default function AboutPage() {
    const { t, tA } = useLocalization();

    const gamesArray = Object.keys(game_map).sort((a, b) => {
        const aName = t(`games.${a}.name`);
        const bName = t(`games.${b}.name`);
        return aName.localeCompare(bName);
    });

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

                    <h2 className="font-bold mt-3">{t('/about.supported-games')}</h2>
                    {/* align to center */}
                    <div className='row justify-content-center'>
                        {gamesArray.map((id) => {
                            const key = `supported-game-card-${id}`;
                            const platforms = Object.keys(game_map[id]?.platforms?.game).filter(k => k != 'modloader');
                            const initGameData = { name: t(`games.${id}.name`), map_data: game_map[id] };
                            return <GameCardComponent key={key} {...{id, platforms, initGameData, small: true}} />
                        })}
                    </div>
                    <small className='text-dark text-center'>{t('/about.more-games-soon')}</small>
                </div>
            </div>
        </div>
    </div>;
}
