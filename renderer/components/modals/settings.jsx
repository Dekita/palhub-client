/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import IconX from '@svgs/fa5/regular/window-close.svg';
import DekSelect from '../core/dek-select';
import { useState } from 'react';
import Dektionary from 'config/dektionary';

export default function SettingsModal({
    themes,
    theme_id,
    setThemeID,
    show,
    setShow,
}) {
    const handleCancel = () => setShow(false);

    const handleThemeChange = (event, newvalue) => {
        setThemeID(event.target.innerText);
    };

    return (
        <Modal
            show={show}
            onHide={handleCancel}
            backdrop='static'
            keyboard={false}
            centered>
            <Modal.Header className='p-4 theme-border '>
                <Modal.Title>
                    <strong>Settings</strong>
                </Modal.Title>
                <Button
                    variant='none'
                    className='p-0 hover-danger no-shadow'
                    onClick={handleCancel}>
                    <IconX className='modalicon' fill='currentColor' />
                </Button>
            </Modal.Header>
            <Modal.Body className='px-5 d-grid gap-2'>
                <DekSelect
                    onChange={handleThemeChange}
                    active_id={theme_id}
                    uid='theme-dropdown'>
                    {themes &&
                        themes.map((theme, index) => (
                            <dekItem text={theme} id={index} key={index} />
                        ))}
                </DekSelect>
            </Modal.Body>
            <Modal.Footer className='d-flex justify-content-center'>
                <Button
                    size='sm'
                    variant='success'
                    className='col'
                    disabled={false}
                    onClick={handleCancel}>
                    Confirm Settings
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
