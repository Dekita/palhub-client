/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
modal is displayed when mobile (small viewpoert) user
clicks on "hamburger menu" in navbar :)
*/
import React from 'react';
import { motion } from 'framer-motion';
import Card from 'react-bootstrap/Card';
import { useRouter } from 'next/router';
import navbar_items from 'config/navbar-items';
// import * as CommonIcons from 'config/common-icons';
import useLocalization from '@hooks/useLocalization';
import DekCommonAppModal from '@components/core/modal';
import game_map from '@main/dek/game-map';
import useCommonChecks from '@hooks/useCommonChecks';

export default function NavbarModal({ show, setShow }) {
    const onCancel = React.useCallback(() => setShow(false), []);
    const {commonAppData} = useCommonChecks();

    const { t } = useLocalization();
    const router = useRouter();
    const active_route = router.pathname;    
    const headerText = t('app.brandname');
    const modalOptions = {show, setShow, onCancel, headerText, showX: true};
    return <DekCommonAppModal {...modalOptions}>
        <div type="DekBody" className="d-grid pt-4 pb-2 text-center">
        {navbar_items.map((element, index) => {
            const is_this_route = element.href === active_route;
            const is_route_servers = element.href === '/servers';
            const hasServers = game_map[commonAppData.selectedGame?.id]?.platforms?.server;
            const isServer = commonAppData.selectedGame?.launch_type === 'server';
            if (is_route_servers && !(hasServers && !isServer)) return null;
            const delay = index * 0.1 + 0.25;
            const onClick = () => { onCancel(); router.push(element.href) };
            return <div key={index} className={`btn no-shadow p-0 w-100 hover-dark text-center`} onClick={onClick}>
                <motion.div
                    initial={{ y: 64, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay }}
                    // whileInView={{ y: 0, opacity: 1 }}
                    className='mb-3 px-5'>
                    <Card className='my-2'>
                        <Card.Body className='p-0'>
                            <Card.Title className='p-3 bg-secondary'>
                                <h4 className='p-0 mb-0'>
                                    <b>{t(element.text)}</b>
                                </h4>
                            </Card.Title>
                            <div className='position-relative'>
                                {/* <Image
                                src={element.image}
                                alt={`BG image for ${element.text}`}
                                width={1000}
                                height={600}
                                className='img-thumbnail img-fluid'
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                }}
                            /> */}
                                <div className='w-100 py-2 px-3'>
                                    <p className='lead theme-text'>
                                        <strong>
                                            {t(element.desc)}
                                        </strong>
                                    </p>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </motion.div>
            </div>;
        })}
        </div>
    </DekCommonAppModal>;
}
