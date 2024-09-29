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

    const game = commonAppData?.selectedGame;

    const onClickHelp = React.useCallback(() => {
        if (!window.ipc) return console.error('ipc not loaded');
        window.ipc.invoke('open-child-window', 'help');
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
                    <SettingsPage_SetupStep {...{showUE4SSInstall, setShowUE4SSInstall}} />
                    <div className='row pb-2'>
                        <div className='col'>
                            <DekChoice
                                className="pb-1"
                                disabled={false}
                                active={settingsPageID}
                                choices={tA('/settings.choices.page', 3)}
                                onClick={(i, value) => setSettingsPageID(i)}
                            />
                        </div>
                        <div className='col-12 col-md-2'>
                            <div className="btn btn-dark w-100" onClick={onClickHelp}>
                                <strong>{t('/faq.name')}</strong>
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
                        <SettingsPage_ApplicationRequirements />
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
function SettingsPage_SetupStep({showUE4SSInstall, setShowUE4SSInstall}) {
    const { t, tA } = useLocalization();
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const cache_dir = commonAppData?.cache;
    const game_path = commonAppData?.selectedGame?.path;
    const api_key = commonAppData?.apis?.nexus;
    const game = commonAppData?.selectedGame;

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
    let step = 0;
    if (!game_path) step = 1;
    if (!api_key) step = 2;
    if (!cache_dir) step = 3;
    if (game_path && !game?.has_exe) step = 4;
    if (game?.has_exe && !game?.has_ue4ss) step = 5;

    const pClasses = 'px-3 px-xl-5 mb-0';
    const dangerCard = 'card bg-danger border-danger2 border my-4 p-3 text-center';
    const successCard = 'card bg-success border-success2 border my-4 p-3 text-center';

    // console.log(game)
    // console.log(t(`games.${game.id}.name`))

    switch (step) {
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

function SettingsPage_ApplicationRequirements() {
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const [cacheDirectory, setCacheDirectory] = React.useState(commonAppData?.cache);
    const [nexusApiKey, setNexusApiKey] = React.useState(commonAppData?.apis?.nexus);
    const [showNexusKey, setShowNexusKey] = React.useState(false);
    const { t } = useLocalization();

    // cache directory related handlers
    let cacheDirectoryTimeoutHandler = null;
    // updates the cache directory when the input changes and sets a timeout to save it
    const onUpdateCacheDirectory = React.useCallback((name, new_value) => {
        if (cacheDirectoryTimeoutHandler) clearTimeout(cacheDirectoryTimeoutHandler);
        cacheDirectoryTimeoutHandler = setTimeout(() => {
            window.uStore.set('app-cache', new_value);
        }, COMMON_TIMEOUT_DURATION);
        setCacheDirectory(new_value);
    }, []);
    // open file dialog to select cache directory
    const onClickPathInput = React.useCallback(async (name, value) => {
        const result = await window.ipc.invoke('open-file-dialog', {
            title: t("/settings.inputs.app-cache-dir.open"),
            properties: ['openDirectory'],
        });
        if (!result.cancelled && !!result.filePaths[0]) {
            onUpdateCacheDirectory(null, result.filePaths[0]);
        }
    }, []);

    // nexus api key related handlers
    let nexusApiKeyHandler = null;
    // updates the nexus api key when the input changes and sets a timeout to save it
    const onUpdateNexusApiKey = React.useCallback((name, new_value) => {
        if (nexusApiKeyHandler) clearTimeout(nexusApiKeyHandler);
        nexusApiKeyHandler = setTimeout(() => {
            window.uStore.set('api-keys.nexus', new_value);
            setShowNexusKey(false);
        }, COMMON_TIMEOUT_DURATION);
        setNexusApiKey(new_value);
        setShowNexusKey(true);
    }, []);
    // toggles the visibility of the nexus api key
    const onToggleShowNexusKey = React.useCallback(() => {
        setShowNexusKey((current) => !current);
    }, []);

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
        <div className="row mb-2">
            <div className="col px-3">
                <DekCheckbox
                    inline={true}
                    // iconPos='left'
                    text={t('/settings.options.show-api-key.name')}
                    checked={showNexusKey}
                    onClick={onToggleShowNexusKey}
                />
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
    </React.Fragment>;
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
        })})();
    }, [requiredModulesLoaded]);

    return <React.Fragment>
        <div className="row mb-2">
            <div className="col-12 col-lg-4">
                <ENVEntry
                    value={settings['auto-boot']}
                    updateSetting={(n, v) => updateConfig('auto-boot', v)}
                    name={t('/settings.options.auto-boot.name')}
                    tooltip={t('/settings.options.auto-boot.desc')}
                />
            </div>
            <div className="col-12 col-lg-4">
                <ENVEntry
                    value={settings['auto-tiny']}
                    updateSetting={(n, v) => updateConfig('auto-tiny', v)}
                    name={t('/settings.options.auto-tiny.name')}
                    tooltip={t('/settings.options.auto-tiny.desc')}
                />
            </div>
            <div className="col-12 col-lg-4">
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

    if (!requiredModulesLoaded) return null;
    return <React.Fragment>
        <ENVEntryLabel
            name={t('/settings.options.theme-color.name')}
            tooltip={t('/settings.options.theme-color.desc')}
        />
        <DekChoice
            className="pb-3 mt-1"
            choices={ThemeController.themes}
            active={ThemeController.theme_id}
            onClick={(i, value) => ThemeController.setThemeID(value)}
        />
        <ENVEntryLabel
            name={t('/settings.options.theme-image.name')}
            tooltip={t('/settings.options.theme-image.desc')}
        />
        <DekChoice
            className="pb-3"
            disabled={false}
            active={ThemeController.bg_id}
            choices={tA(`games.${game_id}.theme-images`)}
            onClick={(i, value) => ThemeController.setBgID(i)}
        />        
    </React.Fragment>
}

function SettingsPage_Game({showGameConfig, setShowGameConfig, tempGame, setTempGame}) {
    const { requiredModulesLoaded, commonAppData, updateSelectedGame, refreshCommonDataWithRedirect } = useCommonChecks();
    const game = commonAppData?.selectedGame;
    const api_key = commonAppData?.apis?.nexus;

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


    // const install_types = tA('/settings.choices.install-type');
    // const installed_type = install_types.indexOf(game?.type);


    const gamesArray = React.useMemo(()=> {
        const gamesArray = [];
        for (const [id, data] of Object.entries(commonAppData?.games)) {
            if (id === 'active') continue;
            for (const [type, platform_data] of Object.entries(data)) {
                for (const [launch_type, path] of Object.entries(platform_data)) {
                    // console.log('iterating:', game_id, platform_type, launch_type);
                    const active = game?.id === id && game?.type === type && game?.launch_type === launch_type;
                    gamesArray.push({id, type, launch_type, path, active});
                }
            }
        }
        console.log('refreshing memoized datas', gamesArray);
        return gamesArray;
    }, [game, commonAppData]);

    const onChangeSelectedGame = React.useCallback(async(event, selected_text, target_text, index) => {
        updateSelectedGame(gamesArray[index], async (game) => {
            const slug = game.map_data.providers.nexus;
            await window.nexus(api_key, 'setGame', slug);
            await setTempGame(game);
        });
    }, [updateSelectedGame, gamesArray]);



    const activeGame = gamesArray.find(g => g.active);
    const selectedGameID = gamesArray.indexOf(activeGame);

    const iconOptions = {height:'1.8rem', style:{marginTop:-4}};

    if (!requiredModulesLoaded) return null;
    return <React.Fragment>

        <div className="row mt-3">
            {/* Game selection component */}
            <div className='col-12 pb-3'>
                <DekSelect active_id={selectedGameID} onChange={onChangeSelectedGame}>
                    {gamesArray.map(({id, type, launch_type, path, active}) => {
                        return <dekItem key={`${id} - ${type} - ${launch_type}`} text="hi">
                            <PlatformIcon type={type} options={iconOptions} />
                            {`${t(`games.${id}.name`)} `}
                            {launch_type !== 'game' && t(`common.app-types.${launch_type}`)}
                            {/* {` - ${path}`} */}
                        </dekItem>
                    })}
                </DekSelect>
            </div>
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
                return <GameCardComponent {...{id, path, onClick, tempGame}} />
            })}
        </div>

    </React.Fragment>;
}
