/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/

import React from 'react';
import Markdown from 'react-markdown';
import Image from 'react-bootstrap/Image';

// Custom link renderer to open links in a new tab
const LinkRenderer = (props) => {
    if (props.href.startsWith('/')) return <a href={props.href}>{props.children}</a>;
    return <a href={props.href} target="_blank" rel="noopener noreferrer">{props.children}</a>;
};

const ImageRenderer = (props) => {
    return <Image src={props.src} alt={props.alt} fluid thumbnail/>;
}

function MarkdownRenderer({ children }) {
    const components={
        a: LinkRenderer,
        img: ImageRenderer,
    }
    return <div className="markdown-container">
        <Markdown components={components}>{children}</Markdown>
    </div>;
}

export default MarkdownRenderer;