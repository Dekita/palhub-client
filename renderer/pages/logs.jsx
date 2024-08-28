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
        // Ensure the palhub library is loaded
        if (!window.ipc) return console.error('ipc not loaded');
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');

        
        let log_path = null; // data = {path, curr, prev}
        const logChangeHandler = (data, contents) => setUE4SSLogs(contents.trim());
        const removeChangeHandler = window.ipc.on('watched-file-change', logChangeHandler);

        // Initialize the logs
        (async () => {
            try {
    
                const api_key = await window.uStore.get('api_key');
                if (!api_key) return router.push('/settings');
                
                const game_path = await window.uStore.get('game_path');
                if (!game_path) return router.push('/settings');
                
                const game_data = await window.palhub('validateGamePath', game_path);
                if (!game_data.has_exe) return router.push('/settings');
                if (!game_data.has_ue4ss) return router.push('/settings');
    
                log_path = await window.palhub('joinPath', game_data.ue4ss_root, 'UE4SS.log');
                const log_string = await window.palhub('readFile', log_path, {encoding : 'utf-8'});
    
                setUE4SSLogs(log_string.trim());

                // Watch for changes in the UE4SS.log file
                // and update the state with the new contents
                await window.palhub('watchForFileChanges', log_path);

            } catch (error) {
                console.error(error);
                setUE4SSLogs(`Error fetching logs:\n${error.message}`);
            }
        })();

            
        // Remove the watcher when the component is unmounted
        return () => {
            removeChangeHandler();
            if (log_path) window.palhub('unwatchFileChanges', log_path);
        }
    }, []);
    
    React.useEffect(() => {
        if (!document) return;
        const main_body = document.getElementById('main-body');
        if (!main_body) return;
        // scroll to the bottom of the logs
        main_body.scrollTo(0, main_body.scrollHeight);
    }, [ue4ssLogs]);

    return <>
        {/* <BrandHeader
            type='altsmall'
            words={words}
            tagline={title.replace(':', '')}
        /> */}
        <Container className='text-start pt-5 noverflow'>
            <pre>{ue4ssLogs}</pre>
        </Container>
    </>
}
