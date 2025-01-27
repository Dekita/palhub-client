/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import Link from 'next/link';
import Carousel from 'react-bootstrap/Carousel';
import DekChoice from '@components/core/dek-choice';
import DekSelect from '@components/core/dek-select';
import DekCheckbox from '@components/core/dek-checkbox';
import BrandHeader from '@components/core/brand-header';

import { ENVEntry, ENVEntryLabel } from '@components/modals/common';
import GameConfigurationModal from '@components/modals/game-config';

import useLocalization from '@hooks/useLocalization';
import checkIsDevEnvironment from '@utils/isDevEnv';
import useCommonChecks from '@hooks/useCommonChecks';
import useAppLogger from '@hooks/useAppLogger';
import wait from '@utils/wait';
import GameCardComponent, {PlatformIcon} from '@components/game-card';
import * as CommonIcons from '@config/common-icons';

import useActiveGame from '@hooks/useActiveGame';
// import ActiveGameSelector from '@components/active-game-selector';
import ColorfulGameSelector from '@components/colorful-game-selector';


const COMMON_TIMEOUT_DURATION = 1000;


/* Main Component */
export default function SettingsPage({ modals, ThemeController }) {
    const { t, tA, changeLanguage, language, VALID_LANGUAGES } = useLocalization();
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const [showUE4SSInstall, setShowUE4SSInstall] = React.useState(false);
    const [showUE4SSSettings, setShowUE4SSSettings] = React.useState(false);
    const [showGameConfig, setShowGameConfig] = React.useState(false);
    const [settingsPageID, setSettingsPageID] = React.useState(0);
    const [tempGame, setTempGame] = React.useState(null);
    const isDevEnvironment = checkIsDevEnvironment();
    const applog = useAppLogger("SettingsPage");
    const [step, setStep] = React.useState(0);

    const game = commonAppData?.selectedGame;

    const onClickHelp = React.useCallback(() => {
        if (!window.ipc) return console.error('ipc not loaded');
        window.ipc.invoke('open-child-window', 'help');
    }, []);

    const onClickSetup = React.useCallback(() => {
        if (!window.ipc) return console.error('ipc not loaded');
        window.ipc.invoke('open-child-window', 'setup');
    }, []);

    const carouselOptions = React.useMemo(() => ({
        interval: null,
        controls: false,
        indicators: false,
        className: "container-fluid pb-5",
        activeIndex: settingsPageID,
    }), [settingsPageID]);

    if (!requiredModulesLoaded) return null;
    return <React.Fragment>
        <GameConfigurationModal show={showGameConfig} setShow={setShowGameConfig} tempGame={tempGame} setTempGame={setTempGame} />
        <BrandHeader 
            type="altsmall" 
            tagline={t('/settings.head')} 
            words={tA('/settings.words', { game })} 
            showImage={false}
        />
        <div className="container-fluid">
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3">
                    <div className='row py-2'>
                        <div className='col'>
                            <DekChoice
                                className="pb-1"
                                disabled={step !== 0}
                                active={settingsPageID}
                                choices={tA('/settings.choices.page', 3)}
                                onClick={(i, value) => setSettingsPageID(i)}
                            />
                        </div>
                        <div className='col-12 col-md-5'>
                            <div className='row'>
                                <div className='col pe-1'>
                                    <div className="btn btn-dark w-100" onClick={onClickHelp}>
                                        <strong>{t('/faq.name')}</strong>
                                    </div>
                                </div>
                                <div className='col ps-1'>
                                    <div className="btn btn-dark w-100" onClick={onClickSetup}>
                                        <strong>{t('/setup.name')}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Carousel {...carouselOptions}>
            <Carousel.Item className="">
                <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                    <div className="mx-auto px-3">
                        <SettingsPage_SetupStep {...{showUE4SSInstall, setShowUE4SSInstall, step, setStep}} />

                        <SettingsPage_ApplicationRequirements {...{setSettingsPageID}} />
                        {isDevEnvironment && <React.Fragment>
                            <ENVEntryLabel
                                name={t('/settings.options.language.name')}
                                tooltip={t('/settings.options.language.desc')}
                            />
                            <DekChoice
                                className="pb-3"
                                choices={VALID_LANGUAGES}
                                active={VALID_LANGUAGES.indexOf(language)}
                                onClick={(i, value) => changeLanguage(value)}
                            />
                        </React.Fragment>}
                    </div>
                </div>
            </Carousel.Item>
            <Carousel.Item className="">
                <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                    <div className="mx-auto px-3">
                        <SettingsPage_ApplicationCustomize />
                        <SettingsPage_Theme ThemeController={ThemeController} />
                    </div>
                </div>
            </Carousel.Item>
            <Carousel.Item className="">
                <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                    <div className="mx-auto px-3">
                        <SettingsPage_Game {...{showGameConfig, setShowGameConfig, tempGame, setTempGame}} />
                    </div>
                </div>
            </Carousel.Item>
        </Carousel>
    </React.Fragment>;
}

/* Page Specific Components */
function SettingsPage_SetupStep({showUE4SSInstall, setShowUE4SSInstall, step, setStep}) {
    const { t, tA } = useLocalization();
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const cache_dir = React.useMemo(()=> commonAppData?.cache, [commonAppData?.cache]);
    const game_path = React.useMemo(()=> commonAppData?.selectedGame?.path, [commonAppData.selectedGame?.path]);
    const api_key = React.useMemo(()=> {
        console.log('api_key', commonAppData?.apis?.nexus);  
        return commonAppData?.apis?.nexus ?? '';
    }, [commonAppData]);
    const game = React.useMemo(()=> commonAppData?.selectedGame, [commonAppData]);

    const handleUE4SSInstall = React.useCallback(async () => {
        if (!requiredModulesLoaded) return;
        if (!cache_dir || !game_path || !game) return;
        setShowUE4SSInstall(true);
        await window.palhub('downloadAndInstallUE4SS', cache_dir, game_path);
        const maybe_data = await window.palhub('validateGamePath', game_path);
        if (maybe_data && maybe_data.has_exe) {
            for (const prop in maybe_data) {
                if (!Object.prototype.hasOwnProperty.call(maybe_data, prop)) continue;
                game[prop] = maybe_data[prop];
            }
        }
        await wait(COMMON_TIMEOUT_DURATION); // small delay to allow the process to finish
        setShowUE4SSInstall(false);
    }, [requiredModulesLoaded]);


    // determine the current setup step

    const pClasses = 'px-3 px-xl-5 mb-0';
    const dangerCard = 'card bg-danger border-danger2 border my-4 p-3 text-center';
    const successCard = 'card bg-success border-success2 border my-4 p-3 text-center';

    React.useEffect(() => {
        (async()=>{
            let newstep = 0;
            // if (!game_path) newstep = 1;
            if (!api_key) newstep = 2;
            if (!cache_dir) newstep = 3;
            // if (game_path && !game?.has_exe) newstep = 4;
            // if (game?.has_exe && !game?.has_ue4ss) newstep = 5;
            if (api_key && !await window.nexus(api_key, 'validateKey', api_key)) {
                newstep = 2;
            }
            if (!await window.palhub('checkIsValidFolderPath', cache_dir)) {
                newstep = 3;
            }
            console.log('newstep', newstep);
            setStep(newstep);
        })();
    }, [game, game_path, api_key, cache_dir]);

    // console.log(game)
    // console.log(t(`games.${game.id}.name`))

    switch (step) {
        case 0: return null;
        case 0: return <div className={successCard}>
            <h4 className="mb-0">
                <strong>{t('/settings.setup.ready.head', { game })}</strong>
            </h4>
            {tA('/settings.setup.ready.body', { game }).map((text, i) => (
                <p key={i} className={pClasses}>{text}</p>
            ))}
            <div className="row gap-2 px-3 mt-3">
                <Link href="/play" className="col btn btn-dark p-3">
                    <strong>{t('/settings.buttons.play-game', { game })}</strong>
                </Link>
                <Link href="/mods" className="col btn btn-dark p-3">
                    <strong>{t('/settings.buttons.add-mods', { game })}</strong>
                </Link>
            </div>
        </div>;
        case 1: return <div className={dangerCard}>
            <h4 className="mb-0 text-warning">
                <strong>{t('/settings.setup.need-game.head', { game })}</strong>
            </h4>
            {tA('/settings.setup.need-game.body', { game }).map((text, i) => (
                <p key={i} className={pClasses}>{text}</p>
            ))}
        </div>;
        case 2: return <div className={dangerCard}>
            <h4 className="mb-0 text-warning">
                <strong>{t('/settings.setup.need-apik.head', { game })}</strong>
            </h4>
            {tA('/settings.setup.need-apik.body', { game }).map((text, i) => (
                <p key={i} className={pClasses}>{text}</p>
            ))}
        </div>;
        case 3: return <div className={dangerCard}>
            <h4 className="mb-0 text-warning">
                <strong>{t('/settings.setup.need-cache.head', { game })}</strong>
            </h4>
            {tA('/settings.setup.need-cache.body', { game }).map((text, i) => (
                <p key={i} className={pClasses}>{text}</p>
            ))}
        </div>;
        case 4: return <div className={dangerCard}>
            <h4 className="mb-0 text-warning">
                <strong>{t('/settings.setup.invalid-game.head', { game })}</strong>
            </h4>
            {tA('/settings.setup.invalid-game.body', { game }).map((text, i) => (
                <p key={i} className={pClasses}>{text}</p>
            ))}
        </div>;
        case 5: return <div className={dangerCard}>
            <h4 className="mb-0 text-warning">
                <strong>{t('/settings.setup.need-ue4ss.head', { game })}</strong>
            </h4>
            {tA('/settings.setup.need-ue4ss.body', { game }).map((text, i) => (
                <p key={i} className={pClasses}>{text}</p>
            ))}
            <button className="btn btn-warning p-3 w-100 mt-3" onClick={handleUE4SSInstall}>
                <strong>{t('/settings.buttons.download-ue4ss', { game })}</strong>
            </button>
        </div>;
    }
    return null;
};

function SettingsPage_ApplicationRequirements({setSettingsPageID}) {
    const { requiredModulesLoaded, commonAppData, updateCachePath, updateNexusApiKey, refreshCommonDataWithRedirect } = useCommonChecks();
    const [cacheDirectory, setCacheDirectory] = React.useState(commonAppData?.cache);
    const [cacheIsValid, setCacheIsValid] = React.useState(false);
    const [nexusApiKey, setNexusApiKey] = React.useState(commonAppData?.apis?.nexus);
    const [nexusKeyIsValid, setNexusKeyIsValid] = React.useState(false);
    const [nexusKeyIsPremium, setNexusKeyIsPremium] = React.useState(false);
    const [showNexusKey, setShowNexusKey] = React.useState(false);
    const { t } = useLocalization();

    const onUpdateCacheDirectory = React.useCallback(async (name, new_value) => {
        await updateCachePath(new_value);
        await setCacheDirectory(new_value);
        await refreshCommonDataWithRedirect();
    }, []);
    // open file dialog to select cache directory
    const onClickPathInput = React.useCallback(async (name, value) => {
        const result = await window.ipc.invoke('open-file-dialog', {
            title: t("/settings.inputs.app-cache-dir.open"),
            properties: ['openDirectory'],
        });
        if (!result.cancelled && !!result.filePaths[0]) {
            await onUpdateCacheDirectory(null, result.filePaths[0]);
        }
    }, []);

    // nexus api key related handlers
    let nexusApiKeyHandler = null;
    // updates the nexus api key when the input changes and sets a timeout to save it
    const onUpdateNexusApiKey = React.useCallback(async (name, new_value) => {
        new_value = new_value.trim();
        // ensure new value has only ascii printable characters;
        new_value = new_value.replace(/[^\x20-\x7E]/g, '');
        
        await updateNexusApiKey(new_value, valid_key_user=>{
            setNexusKeyIsValid(valid_key_user !== null); 
            if (valid_key_user !== null) {
                setSettingsPageID(2);
            }
        });
        refreshCommonDataWithRedirect();
        setNexusApiKey(new_value);
        setShowNexusKey(true);
        if (nexusApiKeyHandler) clearTimeout(nexusApiKeyHandler);
        nexusApiKeyHandler = setTimeout(() => setShowNexusKey(false), COMMON_TIMEOUT_DURATION);
        const validation_result = await window.nexus(new_value, 'getValidationResult');
        setNexusKeyIsPremium(validation_result?.is_premium ?? false);
    }, []);
    // toggles the visibility of the nexus api key
    const onToggleShowNexusKey = React.useCallback(() => {
        setShowNexusKey((current) => !current);
    }, []);

    React.useEffect(() => {
        if (!requiredModulesLoaded) return;
        if (!nexusApiKey) return;
        // setCacheDirectory(commonAppData?.cache);
        // setNexusApiKey(commonAppData?.apis?.nexus);
        updateNexusApiKey(nexusApiKey, async valid_key_user=>{
            setNexusKeyIsValid(valid_key_user !== null); 
            const validation_result = await window.nexus(nexusApiKey, 'getValidationResult');
            setNexusKeyIsPremium(validation_result?.is_premium ?? false);
        });
    }, [nexusApiKey]);

    // React.useEffect(() => {
    //     if (cacheDirectory) return;
    //     (async() => {
    //         const path = await window.ipc.invoke('get-path', 'app');
    //         const newpath = await window.palhub('joinPath', path, 'ModCache');
    //         onUpdateCacheDirectory(null, newpath);
    //     })();
    // }, [cacheDirectory]);

    if (!requiredModulesLoaded) return null;
    return <React.Fragment>

        <ENVEntry
            value={cacheDirectory}
            onClick={onClickPathInput}
            updateSetting={onUpdateCacheDirectory}
            name={t('/settings.inputs.app-cache-dir.name')}
            tooltip={t('/settings.inputs.app-cache-dir.desc')}
        />
        <ENVEntry
            value={nexusApiKey}
            updateSetting={onUpdateNexusApiKey}
            type={showNexusKey ? 'text' : 'password'}
            name={t('/settings.inputs.nexus-api-key.name')}
            tooltip={t('/settings.inputs.nexus-api-key.desc')}
        />

        <div className="row mb-1">
            <div className="col-auto px-3">
                <DekCheckbox
                    inline={true}
                    // iconPos='left'
                    text={t('/settings.options.show-api-key.name')}
                    checked={showNexusKey}
                    onClick={onToggleShowNexusKey}
                />
            </div>
            <div className="col-auto px-3">
                <SimpleCheckbox checked={nexusKeyIsValid} text={t("common.nexusKeyIsValid")} />
            </div>
            <div className="col-auto px-3">
                <SimpleCheckbox checked={nexusKeyIsPremium} text={t("common.nexusKeyIsPremium")} />
            </div>

            <div className="col text-end px-3">
                <Link
                    target="_blank"
                    href="https://next.nexusmods.com/settings/api-keys"
                    className="hover-dark text-warning"
                    style={{ width: 256 }}>
                    <strong>{t('/settings.buttons.get-api-key.name')}</strong>
                </Link>
            </div>
        </div>

        <SettingsPage_UseNexusDeepLinks />

    </React.Fragment>;
}



function SettingsPage_UseNexusDeepLinks() {
    const { t } = useLocalization();
    const { requiredModulesLoaded } = useCommonChecks();

    // app options implemented by DEAP <3
    const [settings, setSettings] = React.useState({
        'nxm-links': false,
    });
    const updateConfig = React.useCallback(async (key, value) => {
        if (!requiredModulesLoaded) return;
        console.log('updating config', key, value);
        await window.ipc.invoke('set-config', key, value);
        setSettings((current) => ({ ...current, [key]: value }));
    }, [requiredModulesLoaded]);

   // load initial settings from store
   React.useEffect(() => {
        if (!requiredModulesLoaded) return;
        (async () => { setSettings({
            'nxm-links': await window.uStore.get('nxm-links', false),
        })})();
    }, [requiredModulesLoaded]);

    return <ENVEntry
        value={settings['nxm-links']}
        updateSetting={(n, v) => updateConfig('nxm-links', v)}
        name={t('/settings.options.nxm-links.name')}
        tooltip={t('/settings.options.nxm-links.desc')}
    />
}



function SettingsPage_ApplicationCustomize() {
    const { t } = useLocalization();
    const { requiredModulesLoaded } = useCommonChecks();

    // app options implemented by DEAP <3
    const [settings, setSettings] = React.useState({
        'auto-boot': false,
        'auto-play': false,
        'auto-tiny': false,
        'tiny-tray': false,
        'allow-rpc': false,
    });
    const updateConfig = React.useCallback(async (key, value) => {
        if (!requiredModulesLoaded) return;
        console.log('updating config', key, value);
        await window.ipc.invoke('set-config', key, value);
        setSettings((current) => ({ ...current, [key]: value }));
    }, [requiredModulesLoaded]);

   // load initial settings from store
   React.useEffect(() => {
        if (!requiredModulesLoaded) return;
        (async () => { setSettings({
            'auto-boot': await window.uStore.get('auto-boot', false),
            'auto-play': await window.uStore.get('auto-play', false),
            'auto-tiny': await window.uStore.get('auto-tiny', false),
            'tiny-tray': await window.uStore.get('tiny-tray', false),
            'allow-rpc': await window.uStore.get('allow-rpc', false),
        })})();
    }, [requiredModulesLoaded]);

    return <React.Fragment>
        <div className="row mb-2">
            <div className="col-12 col-lg-6">
                <ENVEntry
                    value={settings['auto-boot']}
                    updateSetting={(n, v) => updateConfig('auto-boot', v)}
                    name={t('/settings.options.auto-boot.name')}
                    tooltip={t('/settings.options.auto-boot.desc')}
                />
            </div>
            <div className="col-12 col-lg-6">
                <ENVEntry
                    value={settings['auto-tiny']}
                    updateSetting={(n, v) => updateConfig('auto-tiny', v)}
                    name={t('/settings.options.auto-tiny.name')}
                    tooltip={t('/settings.options.auto-tiny.desc')}
                />
            </div>
            <div className="col-12 col-lg-6">
                <ENVEntry
                    value={settings['allow-rpc']}
                    updateSetting={(n, v) => updateConfig('allow-rpc', v)}
                    name={t('/settings.options.allow-rpc.name')}
                    tooltip={t('/settings.options.allow-rpc.desc')}
                />
            </div>
            <div className="col-12 col-lg-6">
                <ENVEntry
                    value={settings['tiny-tray']}
                    updateSetting={(n, v) => updateConfig('tiny-tray', v)}
                    name={t('/settings.options.tiny-tray.name')}
                    tooltip={t('/settings.options.tiny-tray.desc')}
                />
            </div>
        </div>
    </React.Fragment>;
}

function SettingsPage_Theme({ThemeController}) {
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const game_id = commonAppData?.selectedGame?.id;
    const { t, tA } = useLocalization();

    console.log('ThemeController', ThemeController.bg_opac);

    if (!requiredModulesLoaded) return null;
    return <React.Fragment>

        <div className='row'>
            <div className='col'>
                <ENVEntryLabel
                    name={t('/settings.options.theme-image.name')}
                    tooltip={t('/settings.options.theme-image.desc')}
                />
                <DekChoice
                    className="pb-3"
                    disabled={false}
                    active={Number(ThemeController.bg_id)}
                    choices={[1,2,3]}
                    //tA(`games.${game_id}.theme-images`)}
                    onClick={(i, value) => ThemeController.setBgID(i)}
                />
            </div>
            <div className='col'>
                <ENVEntryLabel
                    name={t('/settings.options.theme-opacity.name')}
                    tooltip={t('/settings.options.theme-opacity.desc')}
                />
                <DekChoice
                    className="pb-3"
                    disabled={false}
                    active={Number(ThemeController.bg_opac)}
                    choices={tA(`games.generic.theme-opacities`, 3)}
                    onClick={(i, value) => ThemeController.setBgOpac(i)}
                />
            </div>
        </div>
        <ENVEntryLabel
            name={t('/settings.options.theme-color.name')}
            tooltip={t('/settings.options.theme-color.desc')}
        />
        <DekChoice
            className="pb-3 mt-1"
            choices={ThemeController.themes}
            active={Number(ThemeController.theme_id)}
            onClick={(i, value) => ThemeController.setThemeID(value)}
        />
    </React.Fragment>
}

function SettingsPage_Game({showGameConfig, setShowGameConfig, tempGame, setTempGame}) {
    const { requiredModulesLoaded, commonAppData, updateSelectedGame, refreshCommonDataWithRedirect } = useCommonChecks();
    const api_key = commonAppData?.apis?.nexus;

    const {gamesArray, activeGame, selectedGameID} = useActiveGame();

    // const [knownGamePath, setKnownGamePath] = React.useState(game?.path);
    const { t, tA } = useLocalization();

    // const handleGamePathChange = React.useCallback((name, new_value) => {
    //     updateSelectedGamePath(game.id, new_value);
    //     setKnownGamePath(new_value);
    // }, [game]);

    const onClick = React.useCallback((game) => {
        setTempGame(game);
        setShowGameConfig(true);
    }, []);


    if (!requiredModulesLoaded) return null;
    return <React.Fragment>

        <div className="row mt-3">
            <div className='px-4 mb-3'>
                <ColorfulGameSelector />
            </div>
            {/* Game selection component */}

            {/* <ActiveGameSelector {...{selectedGameID, gamesArray}} /> */}

            {/* Add new game to be managed */}
            <div className="col-12 col-md-6 col-lg-6 col-xl-4 mb-2">
                <div className='card theme-border chartcard cursor-pointer' onClick={()=>onClick(null)}>
                    <div className='card-body text-start p-0'>
                        <div className='card-title p-1 mb-0 bg-warning'>
                            <div className="ratio ratio-16x9 theme-bg rounded">
                                <CommonIcons.plus fill='currentColor' className="bg-dark p-3" />
                            </div>
                        </div>
                        <div className='anal-cavity px-2 mb-2 pt-2'>
                            <strong className='text-warning'>{t('/settings.manage-game.head')}</strong>
                            <small className='text-dark'>{t('/settings.manage-game.info')}</small>
                            <span>{t('/settings.manage-game.span')}</span>
                        </div>
                    </div>
                </div>
            </div> 
            {/* list existing managed games */}
            {gamesArray.map(({id, type, launch_type, path, active}) => {
                // console.log('entry', {game_id, type, launch_type, path});
                const key = `card-${id}-${type}-${launch_type}`;
                return <GameCardComponent key={key} {...{id, path, onClick, tempGame}} />
            })}
        </div>

    </React.Fragment>;
}



function SimpleCheckbox({checked=false, text='Checkbox'}) {
    const common = {fill:'currentColor', height:'1rem'};
    return <div className='px-1 text-dark'>
        {checked && <CommonIcons.check_square {...common} />}
        {!checked && <CommonIcons.close {...common} />}
        <small className='px-2'>{text}</small>
    </div>;
}