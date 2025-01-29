/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import useScreenSize from '@hooks/useScreenSize';
import useLocalization from '@hooks/useLocalization';
import useCommonChecks from '@hooks/useCommonChecks';

export default function ModTable({show,setShow, mods, showStatus=false}) {
    const { commonAppData } = useCommonChecks();
    const { t, tA } = useLocalization();
    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;

    const openModInBrowser = React.useCallback((mod_id) => {
        const gameID = commonAppData?.selectedGame.map_data.providers.nexus;
        window.open(`https://www.nexusmods.com/${gameID}/mods/${mod_id}`, '_blank');
    }, [commonAppData?.selectedGame]);

    const main_col_size = showStatus ? 'col-6 col-sm-5 col-md-5' :'col-8 col-sm-7 col-md-6';

    return <table className='table m-0'>
        <thead>
            <tr className="">
                <th className={`bg-dark ${main_col_size}`}>{t('modals.mod-table.name')}</th>
                <th className="bg-dark text-center d-none d-md-table-cell">{t('modals.mod-table.author')}</th>
                <th className="bg-dark text-center d-none d-sm-table-cell">{t('modals.mod-table.version')}</th>
                <th className="bg-dark text-end">{t('modals.mod-table.modids')}</th>
                {showStatus && <th className="bg-dark text-center">{t('modals.mod-table.status')}</th>}
            </tr>
        </thead>
        <tbody className='overflow-y-auto p-0 m-0' style={fullscreen?{height:"calc(100vh - 207px)"}:{height:"calc(100vh / 4 * 2)"}}>
            {mods.map(mod => (
                <tr key={mod.mod_id} className="" onClick={() => openModInBrowser(mod.mod_id)}>
                    <td className={`bg-dark ${main_col_size} truncate`}>{mod.name}</td>
                    <td className="bg-dark col text-center d-none d-md-table-cell truncate">{mod.author}</td>
                    <td className="bg-dark col text-center d-none d-sm-table-cell">{mod.version}</td>
                    <td className="bg-dark col text-end">{mod.mod_id} / {mod.file_id}</td>
                    {showStatus && <td className="bg-dark col text-center py-1">
                        {mod.installed && !mod.latest && (
                            <span className='badge bg-warning border border-success2 w-100 py-2'>
                                {t('common.can-update')}
                            </span>
                        )}
                        {mod.installed && mod.latest && (
                            <span className='badge bg-success border border-success2 w-100 py-2'>
                                {t('common.installed')}
                            </span>
                        )}
                        {mod.downloaded && !mod.installed && (
                            <span className='badge bg-primary border border-primary2 w-100 py-2'>
                                {t('common.downloaded')}
                            </span>
                        )}
                        {!mod.downloaded && !mod.installed && (
                            <span className='badge bg-danger border border-danger2 w-100 py-2'>
                                {t('common.required')}
                            </span>
                        )}
                    </td>}
                </tr>
            ))}
        </tbody>
    </table>
}