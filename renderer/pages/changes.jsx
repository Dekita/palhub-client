/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React, { useEffect, useState } from 'react';
import MarkdownPageWrapper from '@components/markdown/wrapper';
export default function ChangelogsPage({ modals }) {
    // const [fetchedUrls, setFetchedUrls] = useState(null);
    // const [error, setError] = React.useState('');
    // const repo = 'Dekita/ue-mod-hub';
  
    // // React.useEffect(() => {
    // //     const fetchUrls = async () => {
    // //         try {
    // //             // URL for the latest commit changelog
    // //             const commitUrl = `https://raw.githubusercontent.com/${repo}/master/CHANGELOG.md`;

    // //             // Fetch the latest release data
    // //             const releaseApiUrl = `https://api.github.com/repos/${repo}/releases/latest`;
    // //             const releaseResponse = await fetch(releaseApiUrl, { cache: 'no-store' });
    // //             if (!releaseResponse.ok) {
    // //                 throw new Error(`Failed to fetch release: ${releaseResponse.statusText}`);
    // //             }
    // //             const releaseData = await releaseResponse.json();

    // //             // URL for the latest release changelog
    // //             const tagName = releaseData.tag_name;
    // //             const releaseUrl = `https://raw.githubusercontent.com/${repo}/${tagName}/CHANGELOG.md`;

    // //             // Save URLs
    // //             setFetchedUrls({ commitUrl, releaseUrl });
    // //         } catch (err) {
    // //             setError(err.message);
    // //         }
    // //     };
    // //     fetchUrls();
    // // }, [setFetchedUrls, setError]);

    // // console.log(fetchedUrls)

    return <MarkdownPageWrapper {...{ 
        tagline: "/terms.head", 
        // filename: fetchedUrls?.releaseUrl, 
        filename: "https://raw.githubusercontent.com/Dekita/ue-mod-hub/refs/heads/master/CHANGELOG.md", 
        fromGithub: true,
        header: false,
    }} />;
}
