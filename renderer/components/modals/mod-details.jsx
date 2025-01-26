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
import DekSelect from '@components/core/dek-select';
import DekSwitch from '@components/core/dek-switch'
import DekChoice from "@components/core/dek-choice";
// import DekCheckbox from '@components/core/dek-checkbox';

import ModFileCard from '@components/core/mod-file-card';
import Link from "next/link";

import useLocalization from '@hooks/useLocalization';
import DekCommonAppModal from '@components/core/modal';
import useCommonChecks from "@hooks/useCommonChecks";

export default function ModDetailsModal({show,setShow,mod}) {
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const { t, tA } = useLocalization();
    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;

    // if (!mod) mod = {name: 'n/a', author: 'n/a', summary: 'n/a', description: 'n/a', picture_url: 'n/a'};

    const [modpageID, setModpageID] = useState(0);
    const modpageTypes = tA('modals.mod-details.tabs', 2);

    const [modFiles, setModFiles] = useState([]);
    const [showArchive, setShowArchive] = useState(false);

    const onCancel = useCallback(() => {
        setShow(false);
        setTimeout(() => {
            setModpageID(0);
            setModFiles([]);
            setShowArchive(false);
        }, 250);
    }, []);

    useEffect(() => {
        (async () => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');
            if (!mod) return;

            try {
                const api_key = await window.uStore.get('api_key');
                const game_slug = commonAppData?.selectedGame?.map_data.providers.nexus;
                const {files, file_updates} = await window.nexus(api_key, 'getModFiles', mod.mod_id, game_slug);
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

    
    const height = fullscreen ? "calc(100vh - 96px)" : "calc(100vh / 4 * 3)";
    const headerText = `${mod.name} by ${mod.author}`;
    const modalOptions = {show, setShow, onCancel, headerText, showX: true};
    const hasArchivedFiles = modFiles.some(file => file && file.category_name === 'ARCHIVED');
    return <DekCommonAppModal {...modalOptions}>
        <div type="DekBody" className='d-block overflow-y-scroll p-2' style={{height}}>
            <div>
                <div className='ratio ratio-16x9'>
                    <img src={mod.picture_url} alt={mod.name} className='d-block w-100' />
                </div>
                <DekChoice 
                    className='py-2'
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
                        {hasArchivedFiles && <div className='row'>
                            <DekSwitch 
                                // labels={['Hide Archived Files','Display Archived Files']} 
                                labels={[]}
                                className='mb-3 px-0'
                                text={t('modals.mod-details.show-archive')}
                                checked={showArchive}
                                maxIconWidth={64} 
                                onClick={setShowArchive}
                            />
                        </div>}
                        {modFiles.map((file, i) => {
                            if (!showArchive && file && file.category_name === 'ARCHIVED') return null;
                            return <ModFileCard key={i} mod={mod} file={file} />
                        })}
                    </Carousel.Item>
                </Carousel>
                <div className="text-center mb-1">
                    <Link href={`https://www.nexusmods.com/${commonAppData?.selectedGame?.map_data.providers.nexus}/mods/${mod.mod_id}`} target='_blank' className='btn btn-warning p-2 px-4'>
                        <strong>{t('modals.mod-details.view-page')}</strong><br />
                        <small>{t('common.open-link')}</small>
                    </Link>
                </div>
            </div>
        </div>
    </DekCommonAppModal>;
}
