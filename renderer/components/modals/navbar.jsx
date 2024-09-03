/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
modal is displayed when mobile (small viewpoert) user
clicks on "hamburger menu" in navbar :)
*/

import { motion } from 'framer-motion';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import IconX from '@svgs/fa5/regular/window-close.svg';
import Footer from '@components/core/footer';
import { useRouter } from 'next/router';
import navbar_items from 'config/navbar-items';
// import * as CommonIcons from 'config/common-icons';
import useLocalization from '@hooks/useLocalization';

export default function NavbarModal({ show, setShow }) {
    const handleCancel = () => setShow(false);
    const { t } = useLocalization();
    const router = useRouter();
    return <Modal show={show} onHide={handleCancel} fullscreen centered>
        <Modal.Header className='navbar theme-text'>
            <Modal.Title>
                <small><strong>{t('app.brandname')}</strong></small>
            </Modal.Title>
            <Button
                variant='none'
                className='p-0 hover-dark no-shadow'
                onClick={handleCancel}>
                <IconX className='modalicon' fill='currentColor' />
            </Button>
        </Modal.Header>
        <Modal.Body className='container-fluid'>
            {navbar_items.map((element, index) => {
                const delay = index * 0.1 + 0.25;
                const onClick = () => { handleCancel(); router.push(element.href) };
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
        </Modal.Body>
        <Footer/>
    </Modal>;
}
