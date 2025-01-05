/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import React from "react";
import Button from 'react-bootstrap/Button';
import useLocalization from '@hooks/useLocalization';
import useActiveGame from "@hooks/useActiveGame";
import DekCommonAppModal from '@components/core/modal';

import ModFileCard from '@components/core/mod-file-card';
import useCommonChecks from "@hooks/useCommonChecks";

export default function NxmLinkModal({show,setShow, deepLinkData=null}) {
    const { requiredModulesLoaded, commonAppData } = useCommonChecks();

    const onCancel = React.useCallback(() => setShow(false), []);
    const { activeGame } = useActiveGame();
    const { t } = useLocalization();
    const game = activeGame;

    const [triggers, setTriggers] = React.useState({});
    const [file, setFile] = React.useState(null);

    React.useEffect(() => {
        if (!show) return;
        if (!deepLinkData) {
            return;
            // onCancel();
        }

        (async () => {
            const api_key = await window.uStore.get('api_key');
            const game_slug = deepLinkData.game_slug;//commonAppData?.selectedGame?.map_data.providers.nexus;
            const {files, file_updates} = await window.nexus(api_key, 'getModFiles', deepLinkData.mod_id, game_slug);
            setFile(files.find(f => f.file_id == deepLinkData.file_id));

            // 577
            // 6185


            setTriggers({
                autoDownload: true,
                key: deepLinkData.key,
                expires: deepLinkData.expires,
            })
        })();


    }, [show, deepLinkData, onCancel]);

    console.log('d', deepLinkData)

    const headerText = t('modals.nxm-link.head', {game, mod: deepLinkData});
    const modalOptions = {show, setShow, onCancel, headerText, showX: true};
    return <DekCommonAppModal {...modalOptions}>
        <div type="DekBody" className="d-grid p-3 px-4 text-start">
            {deepLinkData && file && <ModFileCard mod={deepLinkData} file={file} triggers={triggers} showHR={false} />}
        </div>
    </DekCommonAppModal>;
}
