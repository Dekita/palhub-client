/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import Card from 'react-bootstrap/Card';
import Dektionary from 'config/dektionary';

export default function FAQCard({ faq_id }) {
    const [open, setOpen] = useState(false);
    const even = faq_id % 2 === 0;
    const el_faq_id = `faq-${faq_id}`;
    const faq = Dektionary.faqs[parseInt(faq_id)];
    const initial_x = even ? 128 : -128;
    const color = even ? 'secondary' : 'primary';

    return (
        <motion.div
            initial={{ opacity: 0, x: initial_x }}
            // animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.25 + (faq_id + 1) / 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className='mb-2 col col-md-10 offset-md-1'>
            <Button
                variant={color}
                className='w-100 p-3 radius0'
                onClick={() => setOpen(!open)}
                aria-controls={el_faq_id}
                aria-expanded={open}>
                <strong>{faq.q.trim() || 'todo'}</strong>
            </Button>
            <Collapse in={open}>
                <div id={el_faq_id} className=''>
                    <Card className='theme-border card-grey radius0'>
                        <Card.Body className='radius0'>
                            <p className='m-0'>{faq.a.trim() || 'todo'}</p>
                        </Card.Body>
                    </Card>
                </div>
            </Collapse>
        </motion.div>
    );
}
