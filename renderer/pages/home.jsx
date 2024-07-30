import React from 'react'
// import Head from 'next/head'
// import Link from 'next/link'
// import Image from 'next/image'

// import Input from '../components/input';
// import Button from '../components/button';
// import Navbar from '../components/navbar';
// import Modal from '../components/modal';

// import ModCardComponent from '../components/mod-card';
// import AppHeadComponent from '../components/app-head';

export default function HomePage() {
    const [message, setMessage] = React.useState('No message found')
    const [inputValue, setInputValue] = React.useState('');

    const [showPassword, setShowPassword] = React.useState(false);


    React.useEffect(() => {
        (async () => {
            const apiKey = await window.uStore.get('api-key');
            setInputValue(apiKey);
        })();
        // window.ipc.on('message', setMessage);
    }, []);
    // const API_KEY = "NxAMpbF/sIp8rw8+PbSus15bkXhBbhnHT8ouWhoG9DE=--wBFinC4XtIXx1FDA--p4ZzA+BhWjE7V4qRzyqHTQ==";


    let passwordTimeoutHandler = null;

    const handleInputChange = React.useCallback((e) => {
        setShowPassword(true);
        setInputValue(e.target.value);
        if (passwordTimeoutHandler) clearTimeout(passwordTimeoutHandler);
        passwordTimeoutHandler = setTimeout(() => {
            if (window.uStore) {
                window.uStore.set('api-key', e.target.value);
            }
            setShowPassword(false);
        }, 1000);
    }, [passwordTimeoutHandler]);

    const commonTitle = "PalHUB Client: Palworld Mod Manager & Server Listing Service";

    return <React.Fragment>
        <div className="min-h-screen flex flex-col">
            <div className="flex-1 flex items-center justify-center">
                <div className="max-w-4xl mx-auto p-6">
                    <h1 className="text-2xl font-bold mb-4">{commonTitle}</h1>
                    <div className='mb-4'>
                        <p className="text-sm text-gray-500">Welcome to PalHUB Client, the ultimate Palworld mod manager and server listing service.</p>
                        <p className="text-sm text-gray-500">To get started, please enter your Nexus Mods API key below.</p>
                    </div>

                </div>
            </div>
        </div>
    </React.Fragment>
}
