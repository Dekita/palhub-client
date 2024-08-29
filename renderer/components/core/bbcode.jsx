/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import DOMPurify from 'dompurify';
import BBCode, {Tag} from 'bbcode-to-react';

class SizeTag extends Tag {
    // 1=small, 6=large
    toHTML() {
        const size_map = {
            1: '8px',
            2: '12px',
            3: '16px',
            4: '18px',
            5: '24px',
            6: '32px',
        }
        const size = size_map[this.params.size];
        return `<span style="font-size: ${size};">${this.getContent()}</span>`;
    }
    // toReact() {}
}

class ImageTag extends Tag {
    toHTML() {
        return `<img class="img-fluid" src="${this.getContent()}" />`;
    }
    // toReact() {}
}

class LinkTag extends Tag {
    toHTML() {
        return `<a class="hover-dark hover-warning" target="_blank" rel="noopener noreferrer" href="${this.params.url}">${this.getContent()}</a>`;
    }
}

BBCode.registerTag('size', SizeTag); // add custom size tag
BBCode.registerTag('img', ImageTag); // add custom image tag
BBCode.registerTag('url', LinkTag); // add custom link tag

function decodeHTMLEntities(text) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
}

function sanitizeBB(bbcodeText) {
    // remove anything malicious
    bbcodeText = DOMPurify.sanitize(bbcodeText);
    // remove <br /> tags and replace them with newlines
    bbcodeText = bbcodeText.replace(/<br\s*\/?>/gi, '');
    // decode HTML entities
    bbcodeText = decodeHTMLEntities(bbcodeText);
    // convert BBCode to html
    bbcodeText = BBCode.toHTML(bbcodeText);
    // return the formatted bbcodeText
    return bbcodeText;
}

export default function BBCodeRenderer({ bbcodeText }) {
    return <div className='bbcode-div mb-3' dangerouslySetInnerHTML={{
        __html: BBCode.toReact(sanitizeBB(bbcodeText))
    }}/>;
}

