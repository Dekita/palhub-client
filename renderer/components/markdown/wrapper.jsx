/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import BrandHeader from '@components/core/brand-header';
import Container from 'react-bootstrap/Container';
import MarkdownRenderer from '@components/markdown/renderer';
import useLocalization from '@hooks/useLocalization';

export default function MarkdownPageWrapper({ tagline, filename }) {
    const [content, setContent] = React.useState('');
    const { t, language } = useLocalization();

    React.useEffect(() => { // Dynamically import the Markdown file on mount
        (async () => {
            let markdown = null;
            try { // Try to load the markdown file for the current locale
                markdown = (await import(`../../markdown/${filename}.${language}.md`)).default;
            } catch (e) { // Fallback to English if the file doesn't exist for the current locale
                console.log(`Error loading markdown file: ${filename}.${language}.md`);
                markdown = (await import(`../../markdown/${filename}.en.md`)).default;
            }
            // Set the content of the Markdown file if it was loaded
            if (markdown) setContent(markdown);
        })();
    }, [filename, language]); // Re-run effect if `markdownFile` changes

    return <React.Fragment>
        <BrandHeader type='altsmall' tagline={t(tagline)}/>
        <Container className='noverflow'>
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3 pt-5 pb-4">
                    <MarkdownRenderer>{content}</MarkdownRenderer>
                </div>
            </div>
        </Container>
    </React.Fragment>;
}
