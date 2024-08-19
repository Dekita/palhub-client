import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
// import Image from 'next/image'
import { Image } from 'react-bootstrap'

import Input from '@components/input';
import Button from '@components/button';
import Navbar from '@components/navbar';
import Modal from '@components/modal';

import ModCardComponent from '@components/mod-card';
import AppHeadComponent from '@components/app-head';
import { useRouter } from 'next/router';

import CheckModsModal from '@components/modals/mod-check';
import LoadListModal from '@components/modals/load-list';
import PlayVanillaModal from '@components/modals/play-vanilla';


export default function PlayPage() {
    const router = useRouter();

    const [showLoadListModal, setShowLoadListModal] = React.useState(false);
    const [showCheckModsModal, setShowCheckModsModal] = React.useState(false);
    const [showPlayVanillaModal, setShowPlayVanillaModal] = React.useState(false);

    const onRunCommonChecks = () => {
        return window && window.uStore && window.palhub;
    }

    React.useEffect(() => {
        if (!onRunCommonChecks()) return console.error('modules not loaded');
        (async () => {
            const api_key = await window.uStore.get('api_key');
            if (!api_key) return router.push('/settings');
            
            const game_path = await window.uStore.get('game_path');
            if (!game_path) return router.push('/settings');
            
            const game_data = await window.palhub('validateGamePath', game_path);
            if (!game_data.has_exe) return router.push('/settings');
            if (!game_data.has_ue4ss) return router.push('/settings');
        })();
    }, []);
    

    // xs={12} md={6} lg={4} xl={3}
    // () => window.open('https://palhub.com', '_blank')

    const onRunGameExe = async () => {
        if (!onRunCommonChecks()) return console.error('modules not loaded');
        const game_path = await window.uStore.get('game_path');
        if (!game_path) return console.error('game_path not found');
        const game_data = await window.palhub('validateGamePath', game_path);
        if (!game_data.has_exe) return console.error('game exe not found');
        await window.palhub('launchExe', game_data.exe_path);
    }




    const onClickLaunchGame = async () => {
        await onRunGameExe();
    }

    const onClickCheckMods = async () => {
        if (!onRunCommonChecks()) return console.error('modules not loaded');
        setShowCheckModsModal(true);
    }

    const onClickLoadNewModlist = async () => {
        if (!onRunCommonChecks()) return console.error('modules not loaded');
        setShowLoadListModal(true);
    }

    const onClickPlayVanillaPalworld = async () => {
        if (!onRunCommonChecks()) return console.error('modules not loaded');
        setShowPlayVanillaModal(true);

        // const game_path = await window.uStore.get('game_path');
        // if (!game_path) return console.error('game_path not found');

        // const rando = await window.palhub('someRandoFunk');
        // const result = await window.palhub('uninstallAllMods', game_path);
        // console.log({game_path, result, rando});

        // // todo: uninstall all mods first
        // // await onRunGameExe();
    }

    return <React.Fragment>

        <CheckModsModal show={showCheckModsModal} setShow={setShowCheckModsModal} />
        <LoadListModal show={showLoadListModal} setShow={setShowLoadListModal} />
        <PlayVanillaModal show={showPlayVanillaModal} setShow={setShowPlayVanillaModal} onRunGameExe={onRunGameExe} />

        <div className="container">
            <div className="mx-auto px-3 pt-5 pb-4">
                <div className='row'>

                    <div className='col-12 card px-1'>
                        <div className='card-body py-2 px-1'>
                            <div className='row'>
                                <div className='d-lg-none col-lg-7'>
                                    <Image src="/img/3Pals.png" alt="Palworld" className='px-0' rounded fluid />
                                </div>
                                <div className='col-12 col-lg-5 pt-4 px-5 pe-lg-2'>
                                    <h1 className="font-bold mb-4">Play Palworld</h1>
                                    <p className="mb-4">
                                        Palworld is a game where you can catch your own creature based party, and have them build your base while you explore the world with your friends. But you knew that already!!
                                    </p>
                                    <p className="mb-4">
                                        You can play Palworld with mods to enhance your experience, and even play with friends on modified servers.
                                    </p>
                                    <p className="mb-4">
                                        Or.. You could choose to play plain old vanilla Palworld without any mods at all, but that's super boring.
                                    </p>
                                </div>
                                <div className='d-none d-lg-block col-lg-7'>
                                    <Image src="/img/Lamball.png" alt="Palworld" rounded fluid />
                                </div>
                            </div>

                            <div className='px-0'>
                                <button className='btn btn-success p-3 w-100 mt-3' onClick={onClickLaunchGame}>
                                    <strong>Launch Game</strong>
                                    <small className="d-block">With Installed Mods!</small>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                <div className='row mt-4'>
                   <div className='col-12 col-md-4 mb-3'>
                        <button className='btn btn-dark hover-primary p-3 w-100' onClick={onClickCheckMods}>
                            <strong>Check Installed Mods</strong>
                            <small className="d-block">Update & Validate Files!</small>
                        </button>
                    </div>
                   <div className='col-12 col-md-4 mb-3'>
                        <button className='btn btn-dark hover-warning p-3 w-100' onClick={onClickLoadNewModlist}>
                            <strong>Load New Modlist</strong>
                            <small className="d-block">Change Your Active Mods!</small>
                        </button>
                    </div>
                   <div className='col-12 col-md-4 mb-3'>
                        <button className='btn btn-dark hover-danger p-3 w-100' onClick={onClickPlayVanillaPalworld}>
                            <strong>Play Vanilla Palworld</strong>
                            <small className="d-block">Uninstalls ALL Mods!</small>
                        </button>
                    </div>
                </div>
{/* 
                <h1 className="font-bold mb-4">Suggested Servers</h1>
                <div className="row">
                    <ModCardComponent />
                    <ModCardComponent />
                    <ModCardComponent />
                    <ModCardComponent />
                </div>

                <h1 className="font-bold mb-4">Suggested Mods</h1>
                <div className="row">
                    <ModCardComponent />
                    <ModCardComponent />
                    <ModCardComponent />
                    <ModCardComponent />
                </div> */}



            </div>
        </div>
    </React.Fragment>
}
