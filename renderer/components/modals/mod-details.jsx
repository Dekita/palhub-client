/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import IconX from '@svgs/fa5/regular/window-close.svg';

import Carousel from 'react-bootstrap/Carousel';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
// import Col from 'react-bootstrap/Col';
// import Row from 'react-bootstrap/Row';

// import useMediaQuery from '@hooks/useMediaQuery';
import useScreenSize from '@hooks/useScreenSize';

import MarkdownRenderer from '@components/core/markdown';
import BBCodeRenderer from "@components/core/bbcode";

import { ENVEntry } from '@components/modals/common';
// import DekSelect from '@components/core/dek-select';
import DekSwitch from '@components/core/dek-switch'
import DekChoice from "@components/core/dek-choice";
// import DekCheckbox from '@components/core/dek-checkbox';

import ModFileCard from '@components/core/mod-file-card';
import Link from "next/link";

export default function ModDetailsModal({show,setShow,mod}) {

    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;

    // if (!mod) mod = {name: 'n/a', author: 'n/a', summary: 'n/a', description: 'n/a', picture_url: 'n/a'};

    const [modpageID, setModpageID] = useState(0);
    const modpageTypes = ['Details', 'Download'];


    const [modFiles, setModFiles] = useState([]);

    const handleCancel = () => {
        setShow(false);
        setTimeout(() => setModpageID(0), 250);
    }


    // main settings object, formed from .env file variables
    // const [settings, setSettings] = useState({});

    // // function to call for updating individual setting
    // const updateSetting = (key, value) => {
    //     setSettings((data) => {
    //         // if value is function, call it passing data and use return value as new value
    //         if (typeof value === 'function') value = value(data);
    //         // update the data using key and value
    //         const updated_data = { ...data, [key]: value };
    //         // return updated data
    //         return updated_data;
    //     });
    //     console.log('updated setting:', key, value)
    //     console.log('envdatas:', envdatas);

    const updateModFiles = async() => {
        try {
            const api_key = await window.uStore.get('api_key');
            const {files, file_updates} = await window.nexus(api_key, 'getModFiles', mod.mod_id);
            files.sort((a,b) => b.uploaded_timestamp - a.uploaded_timestamp);
            console.log({files, file_updates});
            // const links = await window.nexus(api_key, 'getDownloadURLs', mod.mod_id);
            // console.log({links});
            setModFiles(files);
        } catch (error) {
            console.log('updateModFiles error:', error);
        }
    }


    useEffect(() => {
        (async () => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');
            if (!mod) return;

            await updateModFiles();
        })();
    }, [mod]);

    const onDownloadInstall = useCallback(async() => {
        console.log('downloading and installing mod:', mod);
        if (!window.uStore) return console.error('uStore not loaded');
        if (!window.palhub) return console.error('palhub not loaded');
        if (!window.nexus) return console.error('nexus not loaded');
        const api_key = await window.uStore.get('api_key');

        // get main mod file, either by primary or by timestamp
        const sorter = (a,b) => b.uploaded_timestamp - a.uploaded_timestamp;
        let main_file = modFiles.find(file => file.is_primary) ?? files.sort(sorter)[0];
        console.log({main_file});

        const links = await window.nexus(api_key, 'getDownloadURLs', mod.mod_id);
        console.log({links});

        // const required = await window.nexus(api_key, 'getRequiredMods', mod.mod_id);
        // console.log({required});

        // handleCancel();
    }, [mod, modFiles]);

    
    if (!mod) return null;

    // return the actual envmodal
    return (
        <Modal
            show={show}
            size="lg"
            fullscreen={fullscreen}
            onHide={handleCancel}
            backdrop='static'
            keyboard={false}
            centered>
            <Modal.Header className='p-4 theme-border '>
                <Modal.Title className='col'>
                    <strong>{mod.name}</strong> <small>by {mod.author}</small>
                </Modal.Title>
                <Button
                    variant='none'
                    className='p-0 hover-danger no-shadow'
                    onClick={handleCancel}>
                    <IconX className='modalicon' fill='currentColor' />
                </Button>
            </Modal.Header>
            <Modal.Body className='overflow-y-scroll' style={fullscreen?{}:{height:"calc(100vh / 4 * 3)"}}>
                <div className='ratio ratio-16x9'>
                    <img src={mod.picture_url} alt={mod.name} className='d-block w-100' />
                </div>

                <DekChoice 
                    className='py-3'
                    // disabled={true}
                    choices={modpageTypes}
                    active={modpageID}
                    onClick={(i,value)=>{
                        console.log(`Setting Page: ${value}`)
                        setModpageID(i);
                    }}
                />

                <Carousel interval={null} indicators={false} controls={false} className='theme-border' activeIndex={modpageID}>
                    <Carousel.Item className="container-fluid">
                        <BBCodeRenderer bbcodeText={mod.description} />
                    </Carousel.Item>

                    <Carousel.Item className="container-fluid">
                        {modFiles.map((file, i) => {
                            return <ModFileCard key={i} mod={mod} file={file} />
                        })}
                    </Carousel.Item>
                </Carousel>

                <div className="text-center mb-1">
                    <Link href={`https://www.nexusmods.com/palworld/mods/${mod.mod_id}`} target='_blank' className='btn btn-warning p-2 px-4'>
                        <strong>View on Nexus Mods</strong><br />
                        <small>opens in your default browser</small>
                    </Link>
                </div>


            </Modal.Body>
            {/* <Modal.Footer className='d-flex justify-content-center'>
                <Button
                    // size='sm'
                    variant='success'
                    className='col p-2'
                    disabled={false}
                    onClick={onDownloadInstall}>
                    <strong>Download & Install</strong><br />
                    <small>powered by nexusmods</small>
                </Button>
            </Modal.Footer> */}
        </Modal>
    );
}
