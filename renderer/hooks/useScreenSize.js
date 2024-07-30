/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/
import useMediaQuery from '@hooks/useMediaQuery'
import { useEffect, useState } from 'react';

export default function useScreenSize(minWidth='1024px', minHeight='768px') {
    const hasWidth = useMediaQuery(`(min-width: ${minWidth})`);
    const hasHeight = useMediaQuery(`(min-height: ${minHeight})`);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        setIsDesktop(hasWidth && hasHeight);
    }, [hasWidth, hasHeight]);

    return {isDesktop, hasWidth, hasHeight};
}
