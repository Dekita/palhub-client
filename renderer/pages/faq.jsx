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

    const banner_height = 128;

    const gold_mod = false;

    const color_a = gold_mod ? 'danger' : 'info';
    const color_b = gold_mod ? 'warning' : 'primary';

    const gradient_a = `bg-gradient-${color_a}-to-${color_b} border-${color_a}`;
    const gradient_b = `bg-${color_b} border-${color_a}`;
    const gradient_c = `bg-gradient-${color_b}-to-${color_a} border-${color_a}`;


    return <>
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
    </>
}
