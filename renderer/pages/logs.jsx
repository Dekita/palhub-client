import BrandHeader from '@components/core/brand-header';
import Container from 'react-bootstrap/Container';
import Dektionary from 'config/dektionary';
import React from 'react';

// export const getServerSideProps = async () => {
//     return { props: {} };
// };


export default function LogsPage(props) {
    const words = ['Printing game logs since 2024...'];
    const title = `${Dektionary.brandname}: Logs`;

    const [ue4ssLogs, setUE4SSLogs] = React.useState("");

    React.useEffect(() => {
        (async () => {
            try {
                if (!window.uStore) return console.error('uStore not loaded');
                if (!window.palhub) return console.error('palhub not loaded');
                if (!window.nexus) return console.error('nexus not loaded');
    
                const api_key = await window.uStore.get('api_key');
                if (!api_key) return router.push('/settings');
                
                const game_path = await window.uStore.get('game_path');
                if (!game_path) return router.push('/settings');
                
                const game_data = await window.palhub('validateGamePath', game_path);
                if (!game_data.has_exe) return router.push('/settings');
                if (!game_data.has_ue4ss) return router.push('/settings');
    
                const log_path = await window.palhub('joinPath', game_data.ue4ss_root, 'UE4SS.log');
                const log_string = await window.palhub('readFile', log_path, {encoding : 'utf-8'});
    
                setUE4SSLogs(log_string);
            } catch (error) {
                console.error(error);
                setUE4SSLogs(`Error fetching logs:\n${error.message}`);
            }
        })();
    }, []);


    return <>
        <BrandHeader
            type='altsmall'
            words={words}
            tagline={title.replace(':', '')}
        />
        <Container className='text-start pt-5 noverflow'>
            <pre>{ue4ssLogs}</pre>
        </Container>
    </>
}
