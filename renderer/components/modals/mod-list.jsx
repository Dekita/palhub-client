/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import IconX from '@svgs/fa5/regular/window-close.svg';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import useScreenSize from '@hooks/useScreenSize';
import ModTable from '@components/core/mod-table';

import useLocalization from '@hooks/useLocalization';
import useSelectedGame from '@hooks/useSelectedGame';


export default function ModListModal({show,setShow, mods}) {
    const game = useSelectedGame();
    const { t, tA } = useLocalization();
    const handleCancel = () => setShow(false);
    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;

    const [modConfig, setModConfig] = useState({});

    const prepareModList = (mods, modConfig) => {
        return JSON.stringify(mods.map(mod => ({
            name: mod.name,
            mod_id: mod.mod_id,
            author: mod.author,
            version: mod.version,
            file_id: modConfig.mods[mod.mod_id].file_id,
            file_name: modConfig.mods[mod.mod_id].file_name,
        })), null, 4).trim();
    }

    const onCopyModList = useCallback(() => {
        const json = prepareModList(mods, modConfig);
        navigator.clipboard.writeText(json);
    }, [mods, modConfig]);

    const onSaveModList = useCallback(() => {
        // download json document: 
        const element = document.createElement('a');
        const json = prepareModList(mods, modConfig);
        const file = new Blob([json], {type: 'application/json'});
        element.href = URL.createObjectURL(file);
        element.download = "mod-list-filename.json";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
        URL.revokeObjectURL(element.href);
    }, [mods, modConfig]);


    useEffect(() => {
        (async () => {
            if (!window.uStore) return console.error('uStore not loaded');
            if (!window.palhub) return console.error('palhub not loaded');
            if (!window.nexus) return console.error('nexus not loaded');
            if (!mods) return;

            const api_key = await window.uStore.get('api_key');
            const game_path = await window.uStore.get('game_path');
            const cache_dir = await window.uStore.get('cache_dir');

            const config = await window.palhub('readJSON', game_path);
            setModConfig(config);
        })();
    }, [mods]);

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
                <strong>{t('/mods.curr-list')}</strong>
            </Modal.Title>
            <Button
                variant='none'
                className='p-0 hover-danger no-shadow'
                onClick={handleCancel}>
                <IconX className='modalicon' fill='currentColor' />
            </Button>
        </Modal.Header>
        <Modal.Body className="p-0">
            {/* map mods into a table */}
            {modConfig && <ModTable mods={mods.map(mod => {
                const modConfigEntry = modConfig?.mods?.[mod.mod_id];
                if (!modConfigEntry) return null;
                const {file_id, file_name} = modConfigEntry;
                return {
                    ...mod,
                    file_id,
                    file_name,
                    installed: true, 
                    downloaded: true,
                }
            })}/>}
        </Modal.Body>

        <Modal.Footer className='d-flex justify-content-center'>
            <Button
                variant='primary'
                className='col p-2 px-3'
                disabled={false}
                onClick={onCopyModList}>
                <strong>{t('modals.check-mods.copy-json')}</strong>
            </Button>
            <Button
                variant='secondary'
                className='col p-2 px-3'
                disabled={false}
                onClick={onSaveModList}>
                <strong>{t('modals.check-mods.save-json')}</strong>
            </Button>
        </Modal.Footer>
    </Modal>;
}
