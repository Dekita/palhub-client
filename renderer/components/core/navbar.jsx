/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import AutoUpdater from '@components/core/autoupdater';
import useLocalization from '@hooks/useLocalization';
import * as CommonIcons from '@config/common-icons';
import navbar_items from '@config/navbar-items';
import useCommonChecks from '@hooks/useCommonChecks';
// import useAppLogger from '@hooks/useAppLogger';
import game_map from '@main/dek/game-map';

export default function MainNavbar({modals: {onClickHamburger,onClickGemStore}}) {
    // const logger = useAppLogger('components/core/navbar');
    const {requiredModulesLoaded, commonAppData, updateSelectedGame} = useCommonChecks();
    const { t } = useLocalization();
    const router = useRouter();
    const active_route = router.pathname;

    // Scroll to top when route changes
    useEffect(() => {
        const main_body = document.getElementById('main-body');
        if (main_body) main_body.scrollTo(0, 0); // bottom: main_body.scrollHeight
    }, [active_route]);

    const is_settings = active_route === '/settings';
    const settings_color = is_settings ? 'text-warning' : 'hover-dark hover-secondary';
    const settings_classes = `col btn no-shadow p-2 pe-4 my-auto ${settings_color}`;

    // if (!ready) return <></>;

    console.log('commonAppData.selectedGame:', commonAppData.selectedGame);

    return <Navbar className='navbar theme-text'>
        <Container className='theme-text' fluid>
            {/* Area shown when on a small viewport (shows hamburger menu) */}
            <Nav className='d-flex d-md-none me-auto'>
                <div className={`btn p-2 no-shadow hover-dark hover-secondary`} onClick={onClickHamburger}>
                    <CommonIcons.navtoggle height='1.75rem' fill='currentColor' />
                </div>
            </Nav>
            {/* Area to display all of the regular navigation links */}
            <Nav className='d-none d-md-flex me-auto' activeKey={active_route}>
                {navbar_items.map((element) => {
                    const is_this_route = element.href === active_route;
                    const is_route_servers = element.href === '/servers';
                    const hasServers = game_map[commonAppData.selectedGame?.id]?.platforms?.server;
                    const isServer = commonAppData.selectedGame?.launch_type === 'server';
                    if (is_route_servers && !(hasServers && !isServer)) return null;

                    const route_color = is_this_route ? 'text-warning' : 'hover-dark hover-secondary ';
                    return <Link href={element.href} key={element.href} className={`btn px-3 no-shadow ${route_color}`}>
                        <strong>{t(element.text)}</strong>
                    </Link>;
                })}
            </Nav>

            {/* Area to display the update progress & settings cog */}
            <Nav className='text-end'>
                <div className='row'>
                    <div className='col-auto'><AutoUpdater/></div>
                    <div className={settings_classes} onClick={() => router.push('/settings')}>
                        <CommonIcons.cog height='1.75rem' fill='currentColor' />
                    </div>
                </div>
            </Nav>
        </Container>
    </Navbar>;
}
