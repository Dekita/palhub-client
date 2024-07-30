/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

/* use as: 
import useSwrJSON, {fetcher, mutate} from '@hooks/useSwrJSON';

export default function SomePageOrComponent(){
    const {data, error, loading, mutate } = useSwrJSON(`/api/endpoint`);
    if (loading) return (<h1>Loading...</h1>);
    if (error) return (<h1>{error}</h1>);
    return (<pre>{data}</pre>);
}
*/

import useSWR, { useSWRConfig as config } from 'swr';

export const useSWRConfig = config;

export const mutate = async (routekey) => {
    const { mutate: safetate } = useSWRConfig();
    return await safetate(routekey);
};

export const fetcher = async (...args) => {
    // await wait(10_000); // for testing slow connections
    try {
        const res = await fetch(...args);
        return await res.json();
    } catch (error) {
        return { error };
    }
};

export default function useSwrJSON(url, options = {}, ...fetchoptions) {
    const thisfetcher = () => fetcher(url, ...fetchoptions);
    const { data, error, mutate, isValidating } = useSWR(
        url,
        thisfetcher,
        options
    );
    const loading = !data && !error && !isValidating;
    return { data, error, loading, mutate };
}
