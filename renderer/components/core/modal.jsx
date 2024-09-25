/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import React from "react";
import IconX from '@svgs/fa5/regular/window-close.svg';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import useScreenSize from '@hooks/useScreenSize';

export default function DekCommonAppModal({show,setShow,onCancel=()=>{}, headerText="", showX=true, children}) {
    const {isDesktop} = useScreenSize();
    const fullscreen = !isDesktop;
    const handleCancel = () => {
        setShow(false);
        onCancel();
    }
    const bodyChildren = React.Children.map(children, (child) => {
        return child?.props.type === 'DekBody' ? child : null;
    }, this);
    const footChildren = React.Children.map(children, (child) => {
        return child?.props.type === 'DekFoot' ? child : null;
    }, this);
    // return the actual envmodal
    return <Modal
        show={show}
        size="lg"
        fullscreen={fullscreen}
        onHide={handleCancel}
        backdrop='static'
        keyboard={false}
        centered>
        <Modal.Header className='p-4 theme-border'>
            <Modal.Title className='col py-1'>
                <strong className="">{headerText}</strong>
            </Modal.Title>
            {showX && <Button variant='none' className='p-0 hover-danger no-shadow' onClick={handleCancel}>
                <IconX className='modalicon' fill='currentColor' />
            </Button>}
        </Modal.Header>
        {bodyChildren.length> 0 && <Modal.Body className="p-0">{bodyChildren}</Modal.Body>}
        {footChildren.length > 0 && <Modal.Footer className='justify-content-center'>{footChildren}</Modal.Footer>}
    </Modal>;
}
