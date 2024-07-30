/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const SECOND = 1_000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export default function useTimer(initial, interval = SECOND) {
    const [time, setTime] = useState({
        d: 0, // days
        h: 0, // hours
        m: 0, // mins
        s: 0, // secs
        ms: 0, // millisec
    });
    const updater = useCallback(
        () =>
            setTime((_time) => {
                const diff = Math.abs(Date.now() - initial);
                return {
                    d: Math.floor(diff / DAY),
                    h: Math.floor((diff / HOUR) % 24),
                    m: Math.floor((diff / MINUTE) % 60),
                    s: Math.floor((diff / SECOND) % 60),
                    ms: diff % 1000,
                };
            }),
        [initial]
    );

    useEffect(() => {
        const handle = setInterval(updater, interval);
        return () => clearInterval(handle);
    }, [interval]);

    return time;
}
