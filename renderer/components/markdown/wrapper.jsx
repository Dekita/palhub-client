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

export default function MarkdownPageWrapper({ tagline, filename, header=true, fromGithub=false }) {
    const [content, setContent] = React.useState('');
    const { t, tString, language } = useLocalization();

    React.useEffect(() => { // Dynamically import the Markdown file on mount
        (async () => {
            let markdown = null;
            try { // Try to load the markdown file for the current locale
                if (!fromGithub) markdown = (await import(`../../markdown/${filename}.${language}.md`)).default;
            } catch (e) { // Fallback to English if the file doesn't exist for the current locale
                console.log(`Error loading markdown file: ${filename}.${language}.md`);
                if (!fromGithub) markdown = (await import(`../../markdown/${filename}.en.md`)).default;
            }
            // if from github, load data from given filename as url:
            if (fromGithub) {
                try {
                    console.log(`Fetching markdown file: ${filename}`);
                    const response = await fetch(filename, { cache: 'no-store' });
                    markdown = await response.text();
                } catch (e) {
                    console.log(`Error loading markdown file: ${filename}`);
                    markdown = null;
                }
            }
            // Set the content of the Markdown file if it was loaded
            if (markdown) setContent(markdown);
        })();
    }, [filename, language]); // Re-run effect if `markdownFile` changes

    // (keystring, replacers = {}, expectedArraySize = null, bundle_override=null)
    // bundle_point = '', replacers = {}, bundle_override=null

    if (!content) return null;

    return <React.Fragment>
        {header && <BrandHeader type='altsmall' tagline={t(tagline)}/>}
        <Container className='noverflow'>
            <div className="col-12 col-md-10 offset-0 offset-md-1 col-lg-8 offset-lg-2">
                <div className="mx-auto px-3 pt-5 pb-4">
                    <MarkdownRenderer>{tString(content)}</MarkdownRenderer>
                </div>
            </div>
        </Container>
    </React.Fragment>;
}
