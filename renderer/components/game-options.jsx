


import React from 'react';
import { ENVEntry, ENVEntryLabel } from '@components/modals/common';

import useCommonChecks from '@hooks/useCommonChecks';
import useLocalization from '@hooks/useLocalization';
import useAppLogger from '@hooks/useAppLogger';
// import wait from '@utils/wait';


export default function GameConfiguration({tempGame, setTempGame, runModloaderTask}) {
    const { requiredModulesLoaded, updateSelectedGamePath, commonAppData, refreshGames } = useCommonChecks();
    const [knownGamePath, setKnownGamePath] = React.useState(tempGame?.path);
    const { t, tA } = useLocalization();

    const handleGamePathChange = React.useCallback((name, new_value) => {
        setKnownGamePath(new_value);
        updateSelectedGamePath(tempGame, new_value, setTempGame);
    }, [tempGame, setKnownGamePath, setTempGame]);

    const install_types = tA('/settings.choices.install-type');
    const installed_type = install_types.indexOf(tempGame?.type);

    const pClasses = 'px-3 px-xl-5 mb-0';
    const dangerCard = 'col card bg-danger border-danger2 border p-3 text-center';
    const successCard = 'card bg-success border-success2 border p-3 text-center';

    if (!requiredModulesLoaded) return null;
    return <React.Fragment>

        {tempGame?.id && <div className='btn-group dek-choice w-100' role="group">
            <div className='btn btn-secondary px-3 w-50 disabled' disabled>
                <strong>{install_types[installed_type] ?? '???'}</strong>
            </div>
            <div className='btn btn-dark px-3 w-100 disabled' disabled>
                <strong>{tempGame?.name ?? 'No Game Found'}</strong>
            </div>
        </div>}

        <ENVEntry
            disabled={tempGame?.id}
            value={tempGame?.path ?? knownGamePath}
            updateSetting={handleGamePathChange}
            name={t('/settings.inputs.game-path.name', { game: tempGame })}
            tooltip={t('/settings.inputs.game-path.desc', { game: tempGame })}
        />

        {tempGame?.id && <div className='row'>
            <div className='col'>
                <ENVEntry
                    disabled={true}//tempGame?.id}
                    value={tempGame?.map_data?.platforms[tempGame.launch_type][tempGame.type].root}
                    updateSetting={handleGamePathChange}
                    name={"Unreal Project Root"}
                    tooltip={"Unreal Project Root Tooltip"}
                />
            </div>
            <div className='col'>
                <ENVEntry
                    disabled={true}//tempGame?.id}
                    value={tempGame?.map_data?.platforms[tempGame.launch_type][tempGame.type].app}
                    updateSetting={handleGamePathChange}
                    name={"Executable Name"}
                    tooltip={"Executable Name Tooltip"}
                />
            </div>
        </div>}

        {tempGame?.id && <div className="py-2">
            <ENVEntryLabel
                name={"Modloader Setup"}
                tooltip={"Modloader Setup Tooltip"}
            />
            <div className='row'>
                {tempGame?.has_ue4ss && <React.Fragment>
                    <div className='col'>
                        <div className="col btn btn-danger px-3 w-100" onClick={() => runModloaderTask('uninstall')}>
                            <strong>{t('/settings.buttons.uninstall-ue4ss')}</strong>
                        </div>
                    </div>
                </React.Fragment>}
                {!tempGame.has_ue4ss && <div className={dangerCard}>
                    <h4 className="mb-0 text-warning">
                        <strong>{t('/settings.setup.need-ue4ss.head', { game: tempGame })}</strong>
                    </h4>
                    {tA('/settings.setup.need-ue4ss.body', { game: tempGame }).map((text, i) => (
                        <p key={i} className={pClasses}>{text}</p>
                    ))}
                    <button className="btn btn-warning p-3 w-100 mt-3" onClick={()=>runModloaderTask('install')}>
                        <strong>{t('/settings.buttons.download-ue4ss', { game: tempGame })}</strong>
                    </button>
                </div>}
            </div>
        </div>}

    </React.Fragment>;
}
