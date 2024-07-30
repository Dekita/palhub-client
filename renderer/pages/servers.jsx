import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

import Input from '../components/input';
import Button from '../components/button';
import Navbar from '../components/navbar';
import Modal from '../components/modal';

import ModCardComponent from '../components/mod-card';
import AppHeadComponent from '../components/app-head';

export default function HomePage() {


    return <React.Fragment>
        <div className="container">
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3 py-5">
                    <h1 className="font-bold mb-4">PalHUB Servers</h1>
                </div>
            </div>
        </div>
    </React.Fragment>
}
