/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/
import json from '@hooks/useSwrJSON';

function fallbackStats() {
    return {todo: {data: null}};
}

export default function swrStats(
    refreshInterval = 10000,
    fallbackData = fallbackStats(),
    path = `/api/stats`,
    opts = {},
) {
    return json(path, { fallbackData, refreshInterval, ...opts });
}
