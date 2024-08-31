import BrandHeader from '@components/core/brand-header';
import Container from 'react-bootstrap/Container';
import Dektionary from 'config/dektionary';
import React from 'react';
import DekChoice from '@components/core/dek-choice';

import * as CommonIcons from '@config/common-icons';

import useCommonChecks from '@hooks/useCommonChecks';
import useAppLogger from '@hooks/useAppLogger';
// export const getServerSideProps = async () => {
//     return { props: {} };
// };


export default function LogsPage(props) {
    const words = ['Printing game logs since 2024...'];
    const title = `${Dektionary.brandname}: Logs`;

    const applog = useAppLogger("LogsPage");
    const [commonData, onRunCommonChecks] = useCommonChecks();
    const [appLogs, setAppLogs] = React.useState("");
    const [ue4ssLogs, setUE4SSLogs] = React.useState("");
    const [logPageID, setLogPageID] = React.useState(0);

    React.useEffect(() => {
        // Ensure the palhub library is loaded
        if (!onRunCommonChecks()) return applog('error','modules not loaded');
        if (!commonData) applog('error','commonData not loaded');

        let app_log_path = null;
        let ue4ss_log_path = null; 

        // Listen for changes in the various watched files
        const removeWatchedFileChangeHandler = window.ipc.on('watched-file-change', (data, contents) => {
            data.path.endsWith('UE4SS.log') ? setUE4SSLogs(contents.trim()) : setAppLogs(contents.trim());
        });

        // Initialize the logs
        (async () => {
            try {
                app_log_path = await window.ipc.invoke('get-path', 'log');
                const app_log_string = await window.palhub('readFile', app_log_path, {encoding : 'utf-8'});
                await window.palhub('watchForFileChanges', app_log_path);
                setAppLogs(app_log_string.trim());
            } catch (error) {
                setAppLogs(`Error fetching logs:\n${error.message}`);
            }
            try {
                ue4ss_log_path = await window.palhub('joinPath', commonData.game_data.ue4ss_root, 'UE4SS.log');
                const ue4ss_log_string = await window.palhub('readFile', ue4ss_log_path, {encoding : 'utf-8'});
                await window.palhub('watchForFileChanges', ue4ss_log_path);
                setUE4SSLogs(ue4ss_log_string.trim());
            } catch (error) {
                setUE4SSLogs(`Error fetching logs:\n${error.message}`);
            }
        })();

        // Remove the watcher when the component is unmounted
        return () => {
            removeWatchedFileChangeHandler();
            if (app_log_path) window.palhub('unwatchFileChanges', app_log_path);
            if (ue4ss_log_path) window.palhub('unwatchFileChanges', ue4ss_log_path);
        }
    }, [commonData]);

    const scrollToTop = React.useCallback(() => {
        const main_body = document.getElementById('main-body');
        if (main_body) main_body.scrollTo(0, 0);
    }, []);
    const scrollToBottom = React.useCallback(() => {
        const main_body = document.getElementById('main-body');
        if (main_body) main_body.scrollTo(0, main_body.scrollHeight);
    }, []);
    
    React.useEffect(scrollToBottom, [appLogs, ue4ssLogs, logPageID]);

    const logString = [appLogs, ue4ssLogs][logPageID];

    return <React.Fragment>
        {/* <BrandHeader
            type='altsmall'
            words={words}
            tagline={title.replace(':', '')}
        /> */}
        <Container className='text-start pt-5 pb-3 noverflow'>
            <div className='row'>
                <div className='col'>
                    <DekChoice 
                        className='pb-3'
                        disabled={false}
                        choices={['App', 'Game']}
                        active={logPageID}
                        onClick={(i,value)=>{
                            setLogPageID(i);
                        }}
                    />
                </div>
                <div className='col-4 col-md-3 col-lg-2'>
                    <button className='btn btn-info w-100' onClick={scrollToBottom}>
                        <CommonIcons.arrow_down fill='currentColor' height="1rem" /> Bottom
                    </button>
                </div>
            </div>
            <pre>{logString}</pre>
            <button className='btn btn-info w-100' onClick={scrollToTop}>
                <CommonIcons.arrow_up fill='currentColor' height="2rem" />
            </button>
        </Container>

    </React.Fragment>
}
