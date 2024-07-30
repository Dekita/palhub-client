'use client';/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

import { useCallback, useEffect, useMemo } from 'react';

function useFixMissingScroll({hasMoreItems,fetchMoreItems,query = 'main-body'}) {
    const mainElement = useMemo(() => document?.querySelector(query), []);
    const fetchCb = useCallback(() => {
        fetchMoreItems();
    }, [fetchMoreItems]);
    useEffect(() => {
        const hasScroll = mainElement
            ? mainElement.scrollHeight > mainElement.clientHeight
            : false;
        if (!hasScroll && hasMoreItems) setTimeout(() => fetchCb(), 100);
    }, [hasMoreItems, fetchCb, mainElement]);
}

export default useFixMissingScroll;
