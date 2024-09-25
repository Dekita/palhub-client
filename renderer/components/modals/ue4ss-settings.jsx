/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import Collapse from 'react-bootstrap/Collapse';
import { stringify, parse } from 'ini';
import { ENVEntry, ENVEntryLabel, ensureEntryValueType } from '@components/modals/common';
import DekChoice from '@components/core/dek-choice';
import DekCommonAppModal from '@components/core/modal';
import useScreenSize from '@hooks/useScreenSize';
import useCommonChecks from '@hooks/useCommonChecks';
import useLocalization from '@hooks/useLocalization';
import replaceUe4ssIniKeyValue from '@utils/replaceIniKey';


const UE4SS_NUMBOOLS = [
    'EnableHotReloadSystem',
    'UseCache',
    'InvalidateCacheIfDLLDiffers',
    'LoadAllAssetsBeforeDumpingObjects',
    'DumpOffsetsAndSizes',
    'KeepMemoryLayout',
    'LoadAllAssetsBeforeGeneratingCXXHeaders',
    'IgnoreAllCoreEngineModules',
    'MakeAllFunctionsBlueprintCallable',
    'IgnoreEngineAndCoreUObject',
    'MakeAllPropertyBlueprintsReadWrite',
    'MakeEnumClassesBlueprintType',
    'MakeAllConfigsEngineConfig',
    'HookProcessInternal',
    'HookProcessLocalScriptFunction',
    'HookInitGameState',
    'HookCallFunctionByNameWithArguments',
    'HookBeginPlay',
    'HookLocalPlayerExec',
    'EnableDumping',
    'FullMemoryDump',
    'GUIUFunctionCaller',
    'ConsoleEnabled',
    'GuiConsoleEnabled',
    'GuiConsoleVisible',
    'GuiConsoleFontScaling',
];

const IGNORED_UE4SS_CONFIG = [
    'ConsoleEnabled',
    'GuiConsoleEnabled',
    'GuiConsoleVisible',
    'GraphicsAPI',
    'MajorVersion',
    'MinorVersion',
    'bUseUObjectArrayCache',
];

export default function Ue4ssSettingsModal({ show, setShow }) {
    const { isDesktop } = useScreenSize();
    const fullscreen = !isDesktop;
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();
    const game = commonAppData?.selectedGame;
    const { t, tA, ready } = useLocalization('ue4ss');

    // const height = fullscreen ? 'calc(100vh - 182px)' : 'calc(100vh / 4 * 2 + 26px)';
    const height = fullscreen ? "calc(100vh - 96px)" : "calc(100vh / 4 * 2 + 26px)";

    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [hasChanges, setHasChanges] = React.useState(false);
    const [settings, setSettings] = React.useState({});
    const [rawINI, setRawINI] = React.useState('');

    const onCancel = React.useCallback(() => {
        setShow(false);
        setTimeout(() => {
            setHasChanges(false);
            setShowAdvanced(false);
        }, 250);
    }, [setShow]);

    // function to call for updating individual setting
    const updateSetting = React.useCallback((key, value) => {
        const keys = key.split('.');
        setSettings((data) => {
            // if value is function, call it passing data and use return value as new value
            if (typeof value === 'function') value = value(data);
            // update the data using key and value
            const updated_data = { ...data, [keys[0]]: { ...data[keys[0]], [keys[1]]: value } };
            // return updated data
            return updated_data;
        });
        setHasChanges(true);
        console.log('updated setting:', key, value);
    }, [setSettings, setHasChanges]);

    const onApply = React.useCallback(async () => {
        if (!requiredModulesLoaded) return;
        console.log('saving ini:..');
        let updated_ini = `${rawINI}`;
        for (const category in settings) {
            for (const [key, data] of Object.entries(settings[category])) {
                if (['MajorVersion', 'MinorVersion'].includes(key)) continue;
                updated_ini = replaceUe4ssIniKeyValue(updated_ini, category, key, data);
                console.log('updated:', key, data);
            }
        }
        // const new_ini_string = stringify(settings);
        await window.palhub('writeFile', ini_path, updated_ini, { encoding: 'utf-8' });
        setHasChanges(false);
    }, [requiredModulesLoaded, game, settings, rawINI]);
    
    React.useEffect(() => {
        (async () => {
            if (!requiredModulesLoaded || !show) return;
            if (!game?.has_exe || !game?.has_ue4ss) return;
            const ini_path = await window.palhub('joinPath', game.ue4ss_root, 'UE4SS-settings.ini');
            const ini_string = await window.palhub('readFile', ini_path, { encoding: 'utf-8' });
            setSettings(parse(ini_string));
            setRawINI(ini_string);
        })();
    }, [requiredModulesLoaded, game, show]);

    // if (settings) console.log(settings);

    const headerText = t('modal.header');
    const modalOptions = {show, setShow, onCancel, headerText, showX: true};
    return <DekCommonAppModal {...modalOptions}>
        <div type="DekBody" className='d-block overflow-y-auto p-3' style={{height}}>
            {hasChanges && <div className="mb-3">
                <div className="btn btn-danger w-100 p-3" onClick={onApply}>
                    <strong>{t('modal.save-changes')}</strong>
                </div>
            </div>}
            <ENVEntryLabel name={t('modal.show-console-name')} tooltip={t('modal.show-console-help')} />
            <DekChoice
                className="pb-3"
                choices={tA('modal.console-choices', 3)}
                active={settings?.Debug?.ConsoleEnabled === '1' ? 1 : (settings?.Debug?.GuiConsoleEnabled === '1' ? 2 : 0)}
                onClick={(i, value) => {
                    const isGui = value === 'GUI';
                    const isConsole = value === 'Console';
                    updateSetting('Debug.ConsoleEnabled', isConsole ? '1' : '0');
                    updateSetting('Debug.GuiConsoleEnabled', isGui ? '1' : '0');
                    updateSetting('Debug.GuiConsoleVisible', isGui ? '1' : '0');
                }}
            />
            <ENVEntryLabel name={t('modal.graphics-api-name')} tooltip={t('modal.graphics-api-help')} />
            <DekChoice
                className="pb-3"
                choices={tA('modal.guiconsole-choices', 3)}
                disabled={settings?.Debug?.GuiConsoleEnabled !== '1'}
                active={settings?.Debug?.GraphicsAPI === 'dx11' ? 0 : settings?.Debug?.GraphicsAPI === 'd3d11' ? 1 : 2}
                onClick={(i, value) => updateSetting('Debug.GraphicsAPI', ["dx11", "d3d11", "opengl"][i])}
            />
            <div className="row">
                <div className="col">
                    <ENVEntry
                        name="bUseUObjectArrayCache" //{t('General.bUseUObjectArrayCache.name')}
                        value={settings?.General?.bUseUObjectArrayCache}
                        updateSetting={(name, value) => updateSetting(`General.bUseUObjectArrayCache`, !!value)}
                        tooltip={t('General.bUseUObjectArrayCache.desc')}
                    />
                </div>
                <div className="col">
                    <ENVEntry
                        name={t('modal.show-all-settings')}
                        value={showAdvanced}
                        updateSetting={(name, value) => setShowAdvanced(value)}
                        tooltip={t('modals.show-all-help')}
                    />
                </div>
            </div>
            <Collapse in={showAdvanced}>
                <div className="row">
                    <hr className="text-secondary border-4 mt-4" />
                    {Object.keys(settings).map((key) => {
                        return Object.keys(settings[key]).map((name, index) => {
                            if (IGNORED_UE4SS_CONFIG.includes(name)) return null;
                            const value = settings[key][name];
                            const type = UE4SS_NUMBOOLS.includes(name) ? 'numbool' : ensureEntryValueType(value);
                            const updater = (name, value) => updateSetting(`${key}.${name}`, ()=>{
                                return type === "numbool" ? (value ? "1" : "0") : value;
                            });
                            const tooltip = t(`${key}.${name}.desc`);
                            return <div className="col-12 col-md-6" key={index}>
                                <ENVEntry {...{ name, value, type, updateSetting: updater, defaults: settings, tooltip }}/>
                            </div>;
                        });
                    })}
                </div>
            </Collapse>
        </div>
    </DekCommonAppModal>;
}
