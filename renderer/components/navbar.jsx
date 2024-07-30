// components/Navbar.js
import React from 'react';
import Link from 'next/link';

const Navbar = () => {
    const navbar_style = "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium";

    return (
        <nav className="bg-gray-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">

                    <div className="flex items-center space-x-6">
                        <div className="flex-shrink-0">
                            <Link href="/home" className="text-white text-lg font-bold">
                                PalHUB Client
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href="/play" className={navbar_style}>Play</Link>
                            <Link href="/mods" className={navbar_style}>Mods</Link>
                            <Link href="/servers" className={navbar_style}>Servers</Link>
                            <Link href="/about" className={navbar_style}>About</Link>
                            {/* Add more links as needed */}
                        </div>
                    </div>
                    {/* an additional area for login/settings buttoons etc */}
                    <div className="flex items-center space-x-4 justify-items-end">
                        <Link href="/settings" className={navbar_style}>Settings</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
