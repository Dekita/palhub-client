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

import MarkdownRenderer from '@components/core/markdown';
import BBCodeRenderer from "@components/core/bbcode";

import { ENVEntry } from '@components/modals/common';
// import DekSelect from '@components/core/dek-select';
import DekSwitch from '@components/core/dek-switch'
import DekChoice from "@components/core/dek-choice";
// import DekCheckbox from '@components/core/dek-checkbox';

import ModFileCard from '@components/core/mod-file-card';
import Link from "next/link";
import { version } from "dompurify";

import ModTable from '@components/core/mod-table';

async function wait(milliseconds = 1000) {
    return new Promise((r) => setTimeout(r, milliseconds));
}

export default function InstallUe4ssModal({show,setShow}) {

    const handleCancel = () => setShow(false);
    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;

    const height = fullscreen ? "calc(100vh - 182px)" : "calc(100vh / 4 * 2 + 26px)";
    const logRef = useRef(null);

    const [logMessages, setLogMessages] = useState([]);

    const addLogMessage = (message) => {
        setLogMessages(old => [...old, message]);
        if (logRef.current) {
            setTimeout(() => logRef.current.scrollTop = logRef.current.scrollHeight);
            // logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    };

    const resetLogMessages = () => {
        setLogMessages([]);
    };

    useEffect(() => {
        if (!window.ipc) return console.error('ipc not loaded');

        const remove_ue4ss_handler = window.ipc.on('ue4ss-process', (type, data) => {
            switch (type) {
                case 'download':
                addLogMessage(`Downloading: ${data.filename} - ${data.percentage}%`);
                break;

                case 'extract':
                addLogMessage(`Extracting: ${data.outputPath}`);
                break;
            }
        });

        return () => remove_ue4ss_handler();
    }, []);  

    // return the actual envmodal
    return (
        <Modal
            show={show}
            size="lg"
            fullscreen={fullscreen}
            onHide={handleCancel}
            backdrop='static'
            keyboard={false}
            centered>
            <Modal.Header className='p-4 theme-border '>
                <Modal.Title className='col'>
                    <strong>Installing UE4SS.. Please Wait.</strong>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <div className='overflow-auto m-0 p-3' style={{height}} ref={logRef}>
                    <pre className='m-0 p-2 text-start'>
                        {logMessages.join('\n')}
                    </pre>
                </div>
            </Modal.Body>
        </Modal>
    );
}
