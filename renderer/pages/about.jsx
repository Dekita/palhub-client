import React from 'react'
import Link from 'next/link'
// import Image from 'next/image'

import * as CommonIcons from '@config/common-icons';

export default function AboutPage() {

    return <React.Fragment>
        <div className="container">
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3 py-5">
                    <h1 className="font-bold mb-4">About PalHUB Client</h1>
                    <p className="mb-4">
                        PalHUB Client is an application that allows you to download and easily manage mods for Palworld from the nexus mods website.
                        This application is built using modern technologies and is designed to be as simple and easy to use as possible. If you encounter any bugs or issues, please let us know!
                    </p>

                    <Link href="https://discord.gg/WyTdramBkm" target='_blank' className='w-100 btn btn-dark hover-success py-3 px-4'>
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
                        This application is not affiliated with, or endorsed by the developers of Palworld.
                        </strong>
                    </div>

                    <div className='row'>
                        <div className='col-12 col-xl-6'>
                            <h2 className="font-bold">Features</h2>
                            <ul className='px-0'>
                                <li className=''>Source code hosted on github for the world to see</li>
                                <li className=''>Download, and install mods from Nexus Mods</li>
                                <li className=''>Manage your mod library with minimal clicks</li>
                                <li className=''>Effortlessly join custom modified servers</li>
                            </ul>
                            <Link href="https://www.patreon.com/dekitarpg" target='_blank' className='w-100 btn btn-info py-3 px-4 mb-2 mb-xl-0'>
                                <CommonIcons.patreon
                                    height='2rem'
                                    fill='currentColor'
                                    style={{ opacity: 0.5 }}
                                />
                                <strong className='ps-2'>
                                    Support Development
                                </strong>
                            </Link>                            
                        </div>
                        <div className='col-12 col-xl-6 d-grid gap-2'>
                            <Link href="/privacy" className='w-100 btn btn-dark hover-success py-3 px-4'>
                                <CommonIcons.privacy
                                    height='2rem'
                                    fill='currentColor'
                                    style={{ opacity: 0.5 }}
                                />
                                <strong className='ps-2'>
                                    Privacy
                                </strong>
                            </Link>
                            <Link href="/terms" className='w-100 btn btn-dark hover-success py-3 px-4'>
                                <CommonIcons.terms
                                    height='2rem'
                                    fill='currentColor'
                                    style={{ opacity: 0.5 }}
                                />
                                <strong className='ps-2'>
                                    Terms
                                </strong>
                            </Link>
                            <Link href="/faq" className='w-100 btn btn-dark hover-success py-3 px-4'>
                                <CommonIcons.question
                                    height='2rem'
                                    fill='currentColor'
                                    style={{ opacity: 0.5 }}
                                />
                                <strong className='ps-2'>
                                    FAQs
                                </strong>
                            </Link>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    </React.Fragment>
}
