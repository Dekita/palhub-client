/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/



import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import IconX from '@svgs/fa5/regular/window-close.svg';
import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
// import Col from 'react-bootstrap/Col';
// import Row from 'react-bootstrap/Row';

// import DekSelect from '@components/core/dek-select';
import DekChoice from "@components/core/dek-choice";
import { fetcher } from '@hooks/useSwrJSON';
// import wait from "@utils/wait";

// import { motion } from 'framer-motion';
import Collapse from 'react-bootstrap/Collapse';
import Card from 'react-bootstrap/Card';
import useMediaQuery from '@hooks/useMediaQuery';

import config from '@config/main'


const commands = [
    { "cmd": "DoExit", "desc": "The 'DoExit' command forcefully stops the server, terminating all active processes and connections abruptly." },
    { "cmd": "Shutdown {Seconds} {MessageText}", "desc": "With 'Shutdown', you can initiate a server shutdown to occur after a specified time, providing a custom notification message to users." },
    { "cmd": "Broadcast {MessageText}", "desc": "Send important announcements or messages to all connected players with the 'Broadcast' command, ensuring communication across the entire server. Use underscores _ instead of spaces" },
    { "cmd": "KickPlayer {SteamID}", "desc": "Ensure server discipline by removing a specific player with the 'KickPlayer' command, preventing further participation in the ongoing session." },
    { "cmd": "BanPlayer {SteamID}", "desc": "Maintain server integrity by permanently banning a player using the 'BanPlayer' command, preventing future access for rule violations." },
    { "cmd": "ShowPlayers", "desc": "Gain insights into the current player base with 'ShowPlayers', revealing comprehensive information about all connected players for effective server management." },
    { "cmd": "Info", "desc": "Retrieve vital server details and configurations instantly using the 'Info' command, providing a comprehensive overview of the server's current state." },
    { "cmd": "Save", "desc": "Securely persist the current state of the server's world data with the 'Save' command, ensuring data integrity and facilitating regular backups." },
    { "cmd": "Clear", "desc": "Start fresh in the RCON terminal by using 'Clear', wiping previous commands and outputs for a clean and organized command-line environment." },

    // // only work while in game: 
    // { "cmd": "TeleportToPlayer {SteamID}", "desc": "Swiftly navigate to the exact location of a specified player using 'TeleportToPlayer', facilitating efficient monitoring and assistance." },
    // { "cmd": "TeleportToMe {SteamID}", "desc": "Bring a designated player directly to your current location through the 'TeleportToMe' command, ensuring quick coordination and support." },
];




/* 
    cant seem to use getServerSideProps to fetch env variables??
    had to use NEXT_PUBLIC_ prefix instead.. find a better solution!
*/
// export async function getServerSideProps() {
//     const PALHUB_ADMIN_PASS = process.env.PALHUB_ADMIN_PASS;
//     console.log("getServerSideProps:", PALHUB_ADMIN_PASS);
//     return {props: { PALHUB_ADMIN_PASS }};
// } 
  

function RCONCommandCard({ command, index }) {
    const even = index % 2 === 1;
    const [open, setOpen] = useState(false);
    const color = even ? 'secondary' : 'primary';
    const el_cmd_id = `cmd-${index}`;

    // console.log('command:', command)

    return <div className='mb-2'>
        <Button
            variant={color}
            className='w-100 p-3 radius0'
            onClick={() => setOpen(!open)}
            aria-controls={el_cmd_id}
            aria-expanded={open}>
            <strong>{command.cmd}</strong>
        </Button>
        <Collapse in={open}>
            <div id={el_cmd_id} className=''>
                <Card className='theme-border card-grey radius0'>
                    <Card.Body className='radius0'>
                        <p className='m-0'>{command.desc}</p>
                    </Card.Body>
                </Card>
            </div>
        </Collapse>
    </div>;
}


export default function RCONModal({show,setShow,ENV_FILE,PALHUB_ADMIN_PASS}) {
    const handleCancel = () => setShow(false);
    // const PALHUB_ADMIN_PASS = process.env.NEXT_PUBLIC_PALHUB_ADMIN_PASS;
    // console.log('config.pw:', config.pw)
    // console.log("PALHUB_ADMIN_PASS:", PALHUB_ADMIN_PASS);
    // console.log("process.env.PALHUB_ADMIN_PASS:", process.env.PALHUB_ADMIN_PASS);
    // console.log('NEXT_PUBLIC_PALHUB_ADMIN_PASS:', process.env.NEXT_PUBLIC_PALHUB_ADMIN_PASS);

    const [pageIndex, setPageIndex] = useState(0);
    const [preContent, setPreContent] = useState("");
    const [settings, setSettings] = useState({
        clear_input: true, 
        timestamp: true, 
        add_to_top: true, 
        auto_scroll: true, 
        log_commands: false, 
        force_commands: true, // force cmd log to be at the top?
    });

    const updateSetting = (key, value) => {
        setSettings((data) => {
            // if value is function, call it passing data and use return value as new value
            if (typeof value === 'function') value = value(data);
            // update the data using key and value
            const updated_data = { ...data, [key]: value };
            // return updated data
            return updated_data;
        });
    };      


    const scrollContainerRef = useRef();

    const isDesktop = useMediaQuery('(min-width: 1020px)');
    const hasHeight = useMediaQuery('(min-height: 720px)');


    const [text, setText] = useState("");
    const [error, setError] = useState(undefined);
    const [result, setResult] = useState(undefined);
    const [working, setWorking] = useState(false);


    const addLogLine = useCallback((message, force=false) => {
        setPreContent(current => {
            if (force || settings.add_to_top) {
                return `${message}\n${current}`.trim();
            }
            return `${current}\n${message}`.trim();
        });        
    }, [settings])

    const executeRCON = useCallback(async(cmd) => {
        if (working) return;

        console.log('fetching result using pw:', PALHUB_ADMIN_PASS)

        setError(null);
        // setResult(null);
        setWorking(true);
        // console.log(`attempting rcon: ${cmd} ${process.env.PALHUB_ADMIN_PASS}`);
        const fetch_result = await fetcher('/api/rcon', {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pwd: PALHUB_ADMIN_PASS,
                cmd,
            }),
            method: 'POST',
        });
        let stamp = null;
        const {error, result} = fetch_result;
        const should_never_print = "NO RESULT OR ERROR, REPORT TO DEVELOPER!! ";
        if (settings.timestamp) stamp = `[${new Date().toLocaleString()}] `;
        addLogLine(`${stamp}${error ?? result ?? should_never_print}`);
        if (settings.log_commands) addLogLine(`${stamp}${cmd}`, settings.force_commands);
        if (settings.clear_input) setText("");
        setWorking(false);
    }, [settings, working]);

    useEffect(() => {
        // Scroll to the bottom when content changes
        if (scrollContainerRef.current && !settings.add_to_top) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [preContent]);


    const onKeyUp = (e) => {
        // Check if the key pressed is 'Enter' (key code 13)
        if (e.key !== 'Enter') return;
        const cmd = e.target.value;
        if (cmd.toLowerCase() === 'clear') {
            setPreContent("");
            setText("");
        } else {
            executeRCON(e.target.value);
        }
    }

    const fullscreen = !isDesktop || !hasHeight;


    return (
        <Modal
            show={show}
            size="xl"
            fullscreen={fullscreen}
            
            onHide={handleCancel}
            backdrop='static'
            keyboard={false}
            centered>
            <Modal.Header className='p-4 theme-border '>
                <Modal.Title className='col'>
                    <strong>RCON Terminal</strong>
                </Modal.Title>
                <Button
                    variant='none'
                    className='p-0 hover-danger no-shadow'
                    onClick={handleCancel}>
                    <IconX className='modalicon' fill='currentColor' />
                </Button>
            </Modal.Header>


            <Modal.Body className='' style={fullscreen?{}:{height:"calc(100vh / 3 * 2)"}}>
                <DekChoice 
                    className='pb-3'
                    choices={['Terminal','Commands','Settings']}
                    active={pageIndex}
                    onClick={(i,value)=>{
                        console.log(`Setting Page: ${value}`)
                        setPageIndex(i);
                        // updateJobData('seamless', value === 'Yes')
                    }}
                />

                <Carousel 
                    style={{height:"calc(100% - 58px)"}}
                    // className="h-100" 
                    indicators={false} controls={false}interval={null} activeIndex={pageIndex}>
                    <Carousel.Item className="h-100">
                        {/* className="radius0" */}
                        <pre className="mb-3 px-3 py-2 radius0" style={{height:"calc(100% - 58px)"}} ref={scrollContainerRef}>
                            {preContent}
                        </pre>

                        {/* <hr /> */}

                        <input 
                            type="text" 
                            id="rcon-input" 
                            name="rcon-input" 
                            placeholder="Enter RCON Command HERE!" 
                            className='form-control form-secondary' 
                            onChange={e=>setText(e.target.value)} 
                            // disabled={working}
                            autoComplete="off"
                            list="fruitsList"
                            style={{ width: '100%' }}
                            onKeyUp={onKeyUp} 
                            value={text} 
                        />
                        <datalist id="fruitsList">
                            {commands.map((command, index) => (
                                <option key={index} value={command.cmd} />
                            ))}
                        </datalist> 

                    </Carousel.Item>

                    <Carousel.Item className="h-100">
                        <hr className='mt-0 border-secondary'/>
                        {commands && commands.map((command,index) => (
                            <RCONCommandCard key={index} {...{command,index}} />
                        ))}
                    </Carousel.Item>

                    <Carousel.Item className="container-fluid h-100">
                        <hr className='mt-0 border-secondary'/>
                        <div className='row'>
                            <div className='col-6 mb-3'>
                                <label className='w-100 form-label text-start px-1'>Clear input on enter?</label>
                                <DekChoice 
                                    choices={['No','Yes']}
                                    active={[false,true].indexOf(settings.clear_input)}
                                    onClick={(i,value)=>{
                                        console.log(value)
                                        updateSetting('clear_input', value === 'Yes')
                                    }}
                                />
                            </div>
                            <div className='col-6 mb-3'>
                                <label className='w-100 form-label text-start px-1'>Add timestamps?</label>
                                <DekChoice 
                                    choices={['No','Yes']}
                                    active={[false,true].indexOf(settings.timestamp)}
                                    onClick={(i,value)=>{
                                        console.log(value)
                                        updateSetting('timestamp', value === 'Yes')
                                    }}
                                />
                            </div>
                            <div className='col-6 mb-3'>
                                <label className='w-100 form-label text-start px-1'>Log Entry Position</label>
                                <DekChoice 
                                    // className='disabled'
                                    choices={['▲','▼']}
                                    active={[true,false].indexOf(settings.add_to_top)}
                                    onClick={(i,value)=>{
                                        console.log(value)
                                        updateSetting('add_to_top', !i)
                                    }}
                                />
                            </div>
                            <div className='col-6 mb-3'>
                                <label className='w-100 form-label text-start px-1'>Log Commands Used?</label>
                                <DekChoice 
                                    choices={['No','Yes']}
                                    active={[false,true].indexOf(settings.log_commands)}
                                    onClick={(i,value)=>{
                                        console.log(value)
                                        updateSetting('log_commands', value === 'Yes')
                                    }}
                                />
                            </div>
                            <div className='col-6 mb-3'>
                                <label className='w-100 form-label text-start px-1'>Enable Auto Scroll?</label>
                                <DekChoice 
                                    disabled={[false,true].indexOf(settings.add_to_top)}
                                    choices={['No','Yes']}
                                    active={[false,true].indexOf(settings.auto_scroll)}
                                    onClick={(i,value)=>{
                                        console.log(value)
                                        updateSetting('auto_scroll', value === 'Yes')
                                    }}
                                />
                            </div>
                            <div className='col-6 mb-3'>
                                <label className='w-100 form-label text-start px-1'>Log Commands Above?</label>
                                <DekChoice 
                                    choices={['No','Yes']}
                                    active={[false,true].indexOf(settings.force_commands)}
                                    disabled={[true,false].indexOf(settings.add_to_top && settings.log_commands)}
                                    onClick={(i,value)=>{
                                        console.log(value)
                                        updateSetting('force_commands', value === 'Yes')
                                    }}
                                />
                            </div>
                        </div>
{/* 
                        <DekSelect active_id={1} onChange={handleThemeChange}>
                            <dekItem text="hi"/>
                        </DekSelect>
 */}
                    </Carousel.Item>
                </Carousel>                
            </Modal.Body>

            
        </Modal>
    );
}
