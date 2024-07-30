/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

export default function BaseStatsPanel({ stats, tooltips }) {
    const nformatter = Intl.NumberFormat(undefined, { notation: 'compact' });
    const delay = { show: 100, hide: 250 };
    const statkeys = Object.keys(stats);
    const placement = 'bottom';
    const formatter = (key) => {
        const stat = stats[key];
        if (isNaN(stat)) return stat;
        return nformatter.format(stat);
    };
    return (
        <div className='container text-center px-4'>
            <div className='row'>
                {statkeys.map((key) => {
                    const overlay = (
                        <Tooltip style={{ position: 'fixed' }}>
                            {tooltips[key]}
                        </Tooltip>
                    );
                    return (
                        <OverlayTrigger
                            key={key}
                            placement={placement}
                            delay={delay}
                            overlay={overlay}>
                            <div className='col my-2'>
                                <h4 className='mb-0'>
                                    <strong>{formatter(key)}</strong>
                                </h4>
                                <small style={{ opacity: 0.69 }}>
                                    {key.toUpperCase()}
                                </small>
                            </div>
                        </OverlayTrigger>
                    );
                })}
            </div>
        </div>
    );
}
