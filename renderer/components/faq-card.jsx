/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import Card from 'react-bootstrap/Card';

export default function FAQCard({ q="", a="", index }) {
    const [open, setOpen] = useState(false);
    const even = index % 2 === 0;
    const el_index = `faq-${index}`;
    const initial_x = even ? 128 : -128;
    const color = even ? 'secondary' : 'primary';

    return <motion.div
        initial={{ opacity: 0, x: initial_x }}
        // animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.25 + (index + 1) / 10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className='mb-2 col col-md-10 offset-md-1'>
        <Button
            variant={color}
            className='w-100 p-3 radius0'
            onClick={() => setOpen(!open)}
            aria-controls={el_index}
            aria-expanded={open}>
            <strong>{q.trim() || 'todo'}</strong>
        </Button>
        <Collapse in={open}>
            <div id={el_index} className=''>
                <Card className='theme-border card-grey radius0'>
                    <Card.Body className='radius0'>
                        <p className='m-0'>{a.trim() || 'todo'}</p>
                    </Card.Body>
                </Card>
            </div>
        </Collapse>
    </motion.div>;
}
