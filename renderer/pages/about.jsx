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
import * as CommonIcons from '@config/common-icons';

export default function AboutPage() {

    return <React.Fragment>
        <div className="container">
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3 py-5">
                    <h1 className="font-bold mb-4">About PalHUB Client</h1>
                    <p className="mb-4">
                        PalHUB Client is an application that allows you to download and easily manage mods for Palworld from the nexus mods website.
                        This application is built using the modern technologies, and is designed to be as simple and easy to use as possible. If you encounter any bugs or issues, please let us know!
                    </p>

                    <Link href="https://discord.gg/WyTdramBkm" className='w-100 btn btn-dark hover-primary py-3 px-4'>
                        <CommonIcons.discord
                            height='2rem'
                            fill='currentColor'
                            style={{ opacity: 0.5 }}
                        />
                        <strong className='ps-2'>
                            Join Support Server
                        </strong>

                    </Link>


                    <div className='alert alert-warning text-center mt-3'>
                        <strong>
                        This application is not affiliated with, or endoresed by the developers of Palworld.
                        </strong>
                    </div>
                            
                </div>
            </div>
        </div>
    </React.Fragment>
}
