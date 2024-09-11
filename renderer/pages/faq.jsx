/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import BrandHeader from '@components/core/brand-header';
import Container from 'react-bootstrap/Container';
import FAQCard from '@components/faq-card';

import useLocalization from '@hooks/useLocalization';

// export const getServerSideProps = async () => {
//     return { props: {} };
// };

export default function FAQPage(props) {
    const { t, tA, tO } = useLocalization();
    const tagline = t('/faq.head');
    const rawFAQs = tO('/faq.faqs') ?? [];
    const answers = rawFAQs.map((v,i) => t(`/faq.faqs.${i}.a`));
    const questions = rawFAQs.map((v,i) => t(`/faq.faqs.${i}.q`));
    return <React.Fragment>
        <BrandHeader type='altsmall' words={questions} tagline={tagline}/>
        <Container className='text-center py-5 noverflow'>
            {rawFAQs.map((v, i) => <FAQCard index={i} key={'faq' + i} q={questions[i]} a={answers[i]} />)}
        </Container>
    </React.Fragment>
}
