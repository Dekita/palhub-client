/*
########################################
# PalHUB::Server by dekitarpg@gmail.com
########################################
*/

import React from 'react';
import Markdown from 'react-markdown';

function MarkdownRenderer({ markdownText }) {
  return (
    <div className="markdown-container">
        <Markdown>{markdownText}</Markdown>
    </div>
  );
}

export default MarkdownRenderer;