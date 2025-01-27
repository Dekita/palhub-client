/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import React from "react";
import Button from 'react-bootstrap/Button';
import useLocalization from '@hooks/useLocalization';
import useActiveGame from "@hooks/useActiveGame";
import useCommonChecks from '@hooks/useCommonChecks';

import DekCommonAppModal from '@components/core/modal';
import DekChoice from '@components/core/dek-choice';
import DekSelect from '@components/core/dek-select';
import DekCheckbox from '@components/core/dek-checkbox';
import DekFileTree from "@components/core/dek-filetree";
import { ENVEntry, ENVEntryLabel } from '@components/modals/common';

// import { webUtils } from 'electron';


function buildFileTree(entries) {
    const root = { name: 'root', type: 'directory', children: [] };

    entries.forEach((entry) => {
        const parts = entry.outputPath.split('/').filter(Boolean); // Split and remove empty parts
        let currentNode = root;
  
        parts.forEach((part, index) => {
            let childNode = currentNode.children.find((child) => child.name === part);
    
            if (!childNode) {
            childNode = {
                name: part,
                type: index === parts.length - 1 && !entry.isDirectory ? 'file' : 'directory',
            };
    
            if (childNode.type === 'file') {
                childNode.size = entry.size;
            } else {
                childNode.children = [];
            }
    
            currentNode.children.push(childNode);
            }
    
            currentNode = childNode;
        });
    });
  
    return root;
}


// switch (installType) {
//     case 0: forcedRoot = `${commonAppData?.selectedGame?.unreal_root}/`; break;
//     case 1: forcedRoot = `Binaries/`; break;
//     case 2: forcedRoot = `Mods/`; break;
//     case 3: forcedRoot = `Content/`; break;
//     case 4: forcedRoot = `Paks/`; break;
//     case 5: forcedRoot = `LogicMods/`; break;
//     case 6: forcedRoot = `~mods/`; break;
// }
function getInstallTypeFromRoot(root) {
    switch (root) {
        case 'Binaries/': return 1;
        case 'Mods/': return 2;
        case 'Content/': return 3;
        case 'Paks/': return 4;
        case 'LogicMods/': return 5;
        case '~mods/': return 6;
        default: return 0;
    }
}



export default function AddLocalModModal({show,setShow, refreshModList, initialModData={
    root: '',
    mod_id: '',
    version: '',
    file_id: '',
    file_name: '',
    entries: [],
    local: false,
    author: '',
    description: '',
    thumbnail: '',
}}) {
    console.log('initialModData:', initialModData);
    const onCancel = React.useCallback(() => {
        setShow(false);
        refreshModList();
    }, [setShow, refreshModList]);
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const [modName, setModName] = React.useState('');
    const [modVersion, setModVersion] = React.useState('');
    const [modAuthor, setModAuthor] = React.useState('');
    const [modDescription, setModDescription] = React.useState('');
    const [modThumbnail, setModThumbnail] = React.useState('');
    const [fileID, setFileID] = React.useState('');
    const [modID, setModID] = React.useState('');
    const [installType, setInstallType] = React.useState(0);

    // const api_key = commonAppData?.apis?.nexus;
    const game_path = commonAppData?.selectedGame.path;

    const { activeGame } = useActiveGame();
    const { t, tA } = useLocalization();
    const game = activeGame;
    // const game = commonAppData?.selectedGame;

    const [filetree, setFiletree] = React.useState(null);
    const [droppedFile, setDroppedFile] = React.useState(null);

    const handleDragOver = React.useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);
  
    const handleDrop = React.useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const newDroppedfile = files[0]; // Handle the first dropped file only
            const filepath = await window.ipc.getPathForFile(newDroppedfile);

            const entries = JSON.parse(await window.palhub('getArchiveEntriesAsJSON', filepath));
            const [install_path, ignored_files, entries2] = await window.palhub('determineInstallPath', game_path, entries);
            // format entries array to expected filetree structure;
            const filetree = buildFileTree(entries2);


            console.log('Dropped file:', {newDroppedfile, filepath, entries, install_path, ignored_files, entries2});

            newDroppedfile.install_path = install_path;
            newDroppedfile.ignored_files = ignored_files;
            newDroppedfile.path = filepath;
            setDroppedFile(newDroppedfile); 
            setFiletree(filetree);
            setModName(newDroppedfile.name);

            let selectedInstallType = 0;
            if (install_path === game_path) selectedInstallType = 0;
            if (install_path.endsWith('Binaries')) selectedInstallType = 1;
            if (install_path.endsWith('Win64')) selectedInstallType = 2;
            if (install_path.endsWith('WinGDK')) selectedInstallType = 2;
            if (install_path.endsWith('Content')) selectedInstallType = 3;
            if (install_path.endsWith('Paks')) selectedInstallType = 4;
            if (install_path.endsWith('LogicMods')) selectedInstallType = 5;
            if (install_path.endsWith('~mods')) selectedInstallType = 6;
            console.log('selectedInstallType:', selectedInstallType, install_path);
            setInstallType(selectedInstallType);
        }
    }, [game_path]);

    const handleInstall = React.useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        // installMod(cache_path, game_path, mod, file)
        const filename = droppedFile.path.split(/[\\/]/).pop();
        const cachePath = droppedFile.path.replace(filename, '');
        const mod = {version: 'local', mod_id: modName};
        const file = {file_name: filename, file_id: 'local', version: modVersion};

        let forcedRoot = null;
        switch (installType) {
            case 0: forcedRoot = `${commonAppData?.selectedGame?.unreal_root}/`; break;
            case 1: forcedRoot = `Binaries/`; break;
            case 2: forcedRoot = `Mods/`; break;
            case 3: forcedRoot = `Content/`; break;
            case 4: forcedRoot = `Paks/`; break;
            case 5: forcedRoot = `LogicMods/`; break;
            case 6: forcedRoot = `~mods/`; break;
        }

        const extraJsonProps = {
            local: true,
            author: modAuthor,
            description: modDescription,
            thumbnail: modThumbnail,
        };
        
        console.log('Installing mod:', {cachePath, filename, droppedFile, game_path, mod, file});
        await window.palhub('installMod', cachePath, game_path, mod, file, true, forcedRoot, extraJsonProps);
        onCancel();
    }, [droppedFile, game_path, modName, modVersion, modAuthor, modDescription, modID, fileID, installType, modThumbnail, onCancel]);


    const handleUnInstall = React.useCallback(async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Uninstalling mod:', {game_path, initialModData});
        await window.palhub('uninstallMod', game_path, initialModData, null, true);
        onCancel();
    }, [game_path, initialModData]);


    React.useEffect(() => {
        if (show && initialModData) {
            setModName(initialModData?.file_name || '');
            setModVersion(initialModData?.version || '');
            setModAuthor(initialModData?.author || '');
            setModDescription(initialModData?.description || '');
            setModThumbnail(initialModData?.thumbnail || '');
            setFileID(initialModData?.file_id || '');
            setModID(initialModData?.mod_id || '');
            setInstallType(getInstallTypeFromRoot(initialModData?.root || 0));
        } else {
            setModName('');
            setModVersion('');
            setModAuthor('');
            setModDescription('');
            setModThumbnail('');
            setFileID('');
            setModID('');
            setInstallType(0);
            setDroppedFile(null);
            setFiletree(null);
        }
    }, [show]);


    const headerText = t('modals.local-mod.head', {game});
    const modalOptions = {show, setShow, onCancel, headerText, showX: true};




    const canInstall = droppedFile && modName && modVersion && modAuthor && modDescription; // && modID && fileID
    const canUnInstall = initialModData?.root;
    const hasFileData = droppedFile || modName;

    return <DekCommonAppModal {...modalOptions}>
        <div type="DekBody" className="d-grid p-3 px-4 text-center" onDragOver={handleDragOver} onDrop={handleDrop}>
            {true && <div
                className="overflow-y-auto"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                    width: '100%',
                    height: '240px',
                    border: '2px dashed var(--dek-info-normal)',
                    display: 'flex',
                    justifyContent: droppedFile ? 'flex-start' : 'center',
                    alignItems: droppedFile ? 'flex-start' : 'center',
                }}
                >

                {droppedFile && <div className="text-start w-100 px-3 py-2">
                    <p className="mb-0">{t('common.filetree', {droppedFile})}</p> 
                    <DekFileTree data={filetree} />    
                </div>}

                {!droppedFile && <div>
                    <p>{t('/mods.drop-zip')}</p>
                </div>}

            </div>}

            {hasFileData && <div className="text-start">

                <div className="row">
                    <div className="col-6">
                        <ENVEntry
                            disabled={initialModData?.file_name}
                            value={modName}
                            onClick={()=>{}}
                            updateSetting={(name, value) => setModName(value)}
                            name={t('/mods.mod_name')}
                            tooltip={t('/mods.mod_name')}
                        />
                    </div>
                    <div className="col-6 pt-2">
                        <ENVEntryLabel
                            name={t('/mods.mod_type')}
                            tooltip={t('/mods.mod_type')}
                        />
                        <DekSelect active_id={installType} onChange={(event, text, innerText, index) => setInstallType(index)} disableInput={initialModData?.root}>
                            <dekItem text={`${commonAppData?.selectedGame?.unreal_root}/`} />
                            <dekItem text={`${commonAppData?.selectedGame?.unreal_root}/Binaries`}/>
                            <dekItem text={`${commonAppData?.selectedGame?.unreal_root}/Binaries/Win64 {WinGDK for GamePass}`}/>
                            <dekItem text={`${commonAppData?.selectedGame?.unreal_root}/Content`}/>
                            <dekItem text={`${commonAppData?.selectedGame?.unreal_root}/Content/Paks`}/>
                            <dekItem text={`${commonAppData?.selectedGame?.unreal_root}/Content/Paks/LogicMods`}/>
                            <dekItem text={`${commonAppData?.selectedGame?.unreal_root}/Content/Paks/~mods`}/>
                        </DekSelect>
                    </div>
                </div>

                <div className="row">
                    <div className="col-3">
                        <ENVEntry
                            disabled={initialModData?.version}
                            value={modVersion}
                            onClick={()=>{}}
                            updateSetting={(name, value) => setModVersion(value)}
                            name={t('/mods.mod_version')}
                            tooltip={t('/mods.mod_version')}
                        />
                    </div>
                    {/* <div className="col-3">
                        <ENVEntry
                            value={modID}
                            onClick={()=>{}}
                            updateSetting={(name, value) => setModID(value)}
                            name={t('/mods.mod_id')}
                            tooltip={t('/mods.mod_id')}
                        />
                    </div>
                    <div className="col-3">
                        <ENVEntry
                            value={fileID}
                            onClick={()=>{}}
                            updateSetting={(name, value) => setFileID(value)}
                            name={t('/mods.file_id')}
                            tooltip={t('/mods.file_id')}
                        />
                    </div> */}
                    <div className="col-3">
                        <ENVEntry
                            disabled={initialModData?.author}
                            value={modAuthor}
                            onClick={()=>{}}
                            updateSetting={(name, value) => setModAuthor(value)}
                            name={t('/mods.mod_author')}
                            tooltip={t('/mods.mod_author')}
                        />
                    </div>
                    <div className="col-6">
                        <ENVEntry
                            disabled={initialModData?.thumbnail}
                            value={modThumbnail}
                            onClick={()=>{}}
                            updateSetting={(name, value) => setModThumbnail(value)}
                            name={t('/mods.thumbnail')}
                            tooltip={t('/mods.thumbnail')}
                        />
                    </div>
                </div>

                <ENVEntryLabel
                    name={t('/mods.mod_desc')}
                    tooltip={t('/mods.mod_desc')}
                />
                <textarea
                    disabled={initialModData?.description}
                    className='form-control form-control-sm form-secondary mb-3'
                    value={modDescription}
                    onChange={(event) => setModDescription(event.target.value)}
                    // disabled={pinConnected}
                    style={{
                        minHeight: '5rem',
                        // resize: 'none'
                    }}
                />

                {initialModData?.root && <Button
                    variant='danger'
                    className='w-100'
                    disabled={!canUnInstall}
                    onClick={handleUnInstall}>
                    <strong>{t('modals.mod-details.uninstall')}</strong>
                </Button>}

                {!initialModData?.root && <Button
                    variant='success'
                    className='w-100'
                    disabled={!canInstall}
                    onClick={handleInstall}>
                    <strong>{t('/mods.install-zip')}</strong>
                </Button>}
            </div>}

        </div>
        {/* <div type="DekFoot" className='d-flex w-100 gap-3'>
            <Button
                variant='danger'
                className='col p-2 px-3'
                disabled={false}
                onClick={onCancel}>
                <strong>{t('common.cancel')}</strong>
            </Button>
            <Button
                variant='success'
                className='col p-2 px-3'
                disabled={false}
                onClick={onCancel}>
                <strong>{t('common.confirm')}</strong>
            </Button>
        </div> */}
    </DekCommonAppModal>;
}

