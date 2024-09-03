/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import Link from 'next/link';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Image from 'react-bootstrap/Image';

import * as CommonIcons from '@config/common-icons';
import useLocalization from '@hooks/useLocalization';
// import useAppLogger from '@hooks/useAppLogger';



export default function Footer() {
    const { t, ready } = useLocalization();
    const [userCount, setUserCount] = React.useState('??');
    const [rateLimits, setRateLimits] = React.useState('??');
    const delay = { show: 100, hide: 250 };

    React.useEffect(() => {
        if (!window.ipc) return console.error('ipc not loaded');
        (async () => {
            const user_result = await window.ipc.invoke('get-user-count');
            // format the user count to be more readable
            const locale = Intl.DateTimeFormat().resolvedOptions().locale;
            const options = { notation: 'compact', maximumFractionDigits: 1 };
            const readable_count = Intl.NumberFormat(locale, options).format(user_result);
            setUserCount(readable_count);
        })();
    }, []);

    React.useEffect(() => {
        const callback = async() => {
            console.log('checking rate limits');
            if (!window.nexus) return console.error('nexus not loaded');
            if (!window.uStore) return console.error('uStore not loaded');
            const api_key = await window.uStore.get('api_key');
            if (!api_key) return console.error('api_key not found');

            const rate_result = await window.nexus(api_key, 'getRateLimits');
            const readable_rate = `${rate_result.hourly} / ${rate_result.daily}`;
            setRateLimits(readable_rate);
        }
        callback(); // run once on load
        const handle = setInterval(callback, 1000 * 60 * 1);
        return () => clearInterval(handle);
    }, []);

    // if (!ready) return <></>;

    return <footer className='footer darker-bg3 text-center p-3'>
        <div className='row position-absolute w-100 text-dark'>
            <div className='col text-start'>
                <OverlayTrigger placement='top' delay={delay} overlay={<Tooltip className="text-end">{t('#footer.hover-nexus-api')}</Tooltip>}>
                    <small className='px-5'>{rateLimits}</small>
                </OverlayTrigger>
            </div>
            <div className='col text-end'>
                <OverlayTrigger placement='top' delay={delay} overlay={<Tooltip className="text-end">{t('#footer.hover-users-api')}</Tooltip>}>
                    <span className=''>
                        <CommonIcons.account height='1rem' fill='currentColor' />
                        <small className='ps-2 pe-5'>{t('#footer.users-today', {amount: userCount})}</small>
                    </span>
                </OverlayTrigger>
            </div>
        </div>
        <div className='to-contain-the-overlay-properly'>
            <OverlayTrigger placement='left' delay={delay} overlay={<Tooltip className="text-end">
                <Image src='https://img.shields.io/discord/1132980259596271657?logo=discord&style=for-the-badge&logoColor=e4e4e4&label=Support%20Server' fluid />
                </Tooltip>}>
                <Link href='https://discord.gg/WyTdramBkm' target='_blank' className='btn hover-secondary'>
                    <CommonIcons.discord height='1.6rem' fill='currentColor' style={{ opacity: 0.5 }}/>
                </Link>
            </OverlayTrigger>
        </div>
    </footer>;
}
