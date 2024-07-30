/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/
import React from 'react';

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import IconLock from '@svgs/fa5/solid/lock.svg';
import IconDiscord from '@svgs/fa6/brands/discord.svg';
import * as CommonIcons from '@config/common-icons';


export default function Footer() {

    const [userCount, setUserCount] = React.useState('??');
    const [rateLimits, setRateLimits] = React.useState('??');

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



    console.log({ userCount, rateLimits });

    // const {data, error, loading, mutate } = useSwrJSON(`https://dekitarpg.com/ping`);
    // if (loading) return (<h1>Loading...</h1>);
    // if (error) return (<h1>{error}</h1>);
    // return (<pre>{data}</pre>);

    const tooltip_text = 'Nexus Mods API Rate Limits: Hourly / Daily';
    const overlay = <Tooltip className="text-end">{tooltip_text}</Tooltip>;
    const delay = { show: 100, hide: 250 };

    return (
        <footer className='footer darker-bg3 text-center p-3'>
            <div className='row position-absolute w-100 text-dark'>
                <div className='col text-start'>
                    <OverlayTrigger placement='top' delay={delay} overlay={overlay}>
                        <small className='px-5'>{rateLimits.toString()}</small>
                    </OverlayTrigger>

                </div>
                <div className='col text-end'>
                    <CommonIcons.account
                        height='1rem'
                        fill='currentColor'
                    />
                    <small className='ps-2 pe-5'>{userCount} users today!</small>
                </div>
            </div>
            <div>
                <a href='https://discord.gg/DCXh2TUF2u' target='_blank' className='btn hover-secondary'>
                    <IconDiscord
                        height='1.6rem'
                        fill='currentColor'
                        style={{ opacity: 0.5 }}
                    />
                </a>
            </div>
        </footer>
    );
}
