/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

// !TODO:

import BaseStatsPanel from '@components/stats/base-stats';
import swrStats from '@hooks/useSwrStats';

export default function SiteStatsPanel() {
    return <></>
    const { data, error, loading, mutate } = swrStats(60 * 1000, null); // 60 sec refresh interval
    const stats = data?.basic || {};
    const tooltips = {
        users: 'Total number of registered users.',
        icons: 'Total number of icons generated to date.',
        speed: 'Average icon generation time',
        average: 'Average icons per user.',
    };
    return (
        <div className='py-3'>
            <BaseStatsPanel {...{ stats, tooltips }} />
        </div>
    );
}
