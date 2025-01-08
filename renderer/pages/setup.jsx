/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import MarkdownPageWrapper from '@components/markdown/wrapper';
export default function TermsOfServicePage({ modals }) {
    return <MarkdownPageWrapper {...{ tagline: "/terms.head", filename: 'setup', header: false }} />;
}
