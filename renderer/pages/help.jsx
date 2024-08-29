import BrandHeader from '@components/core/brand-header';
import Dektionary from '@config/dektionary';
import Container from 'react-bootstrap/Container';
// import Markdown from 'react-markdown';
import MarkdownRenderer from '@components/core/markdown';


// new terms specific to 'PAlHUB mod manager application for palworld.
const NewTermsMarkdown = `

HEEELP PAGGEE

`;

export default function HelpPage({ modals }) {
    const title = `${Dektionary.brandname} Terms of Service`;
    return <>
        <BrandHeader
            type='altsmall'
            tagline={title}
        />
        <Container className='noverflow'>
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3 pt-5 pb-4">
                    {/* <Markdown>{NewTermsMarkdown}</Markdown> */}
                    <MarkdownRenderer>{NewTermsMarkdown}</MarkdownRenderer>
                </div>
            </div>
        </Container>
    </>;
}
