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

import MarkdownRenderer from '@components/markdown/renderer';
import BBCodeRenderer from "@components/core/bbcode";

import { ENVEntry } from '@components/modals/common';
// import DekSelect from '@components/core/dek-select';
import DekSwitch from '@components/core/dek-switch'
import DekChoice from "@components/core/dek-choice";
// import DekCheckbox from '@components/core/dek-checkbox';

import ModFileCard from '@components/core/mod-file-card';
import Link from "next/link";

import useLocalization from '@hooks/useLocalization';
import useSelectedGame from '@hooks/useSelectedGame';

export default function ModDetailsModal({show,setShow,mod}) {
    const game = useSelectedGame();
    const { t, tA } = useLocalization();
    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;

    // if (!mod) mod = {name: 'n/a', author: 'n/a', summary: 'n/a', description: 'n/a', picture_url: 'n/a'};

    const [modpageID, setModpageID] = useState(0);
    const modpageTypes = tA('modals.mod-details.tabs', 2);

    const [modFiles, setModFiles] = useState([]);

    const handleCancel = () => {
        setShow(false);
        setTimeout(() => setModpageID(0), 250);
    }

    useEffect(() => {
        (async () => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');
            if (!mod) return;

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
        })();
    }, [mod]);
    
    if (!mod) return null;

    return <Modal
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
                    <strong>{t('modals.mod-details.view-page')}</strong><br />
                    <small>{t('common.open-link')}</small>
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
    </Modal>;
}
