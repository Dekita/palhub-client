/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import BrandHeader from '@components/core/brand-header';
import Container from 'react-bootstrap/Container';
import FAQCard from '@components/faq-card';
import Dektionary from 'config/dektionary';

// export const getServerSideProps = async () => {
//     return { props: {} };
// };

export default function FAQPage(props) {
    const mapped = Dektionary.faqs.map((f) => f.q).filter((q) => q.length);
    const words = ['', ...mapped.reverse()];
    const title = `${Dektionary.brandname}: FAQ`;

    return <React.Fragment>
        <BrandHeader
            type='altsmall'
            words={words}
            tagline={title.replace(':', '')}
        />
        <Container className='text-center py-5 noverflow'>
            {Dektionary.faqs.map((v, i) => (
                <FAQCard key={'faq' + i} faq_id={i} />
            ))}
        </Container>
    </React.Fragment>
}
