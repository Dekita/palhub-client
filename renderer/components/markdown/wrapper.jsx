/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import BrandHeader from '@components/core/brand-header';
import Dektionary from '@config/dektionary';
import Container from 'react-bootstrap/Container';
import MarkdownRenderer from '@components/markdown/renderer';

export default function MarkdownPageWrapper({ tagline, filename }) {
    const title = `${Dektionary.brandname} ${tagline}`;
    const [content, setContent] = React.useState('');

    React.useEffect(() => { // Dynamically import the Markdown file on mount
        (async () => setContent((await import(`../../markdown/${filename}.md`)).default))();
    }, [filename]); // Re-run effect if `markdownFile` changes

    return <>
        <BrandHeader type='altsmall' tagline={title}/>
        <Container className='noverflow'>
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3 pt-5 pb-4">
                    <MarkdownRenderer>{content}</MarkdownRenderer>
                </div>
            </div>
        </Container>
    </>;
}
