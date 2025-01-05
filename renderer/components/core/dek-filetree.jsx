/*
########################################
# PalHUB::Client by dekitarpg@gmail.com
########################################
*/
import React from 'react';
import { SphereSpinner } from 'react-spinners-kit';

export default function DekFileTree({ data }) {
    if (!data || !data.children) {
        return <div className="d-flex justify-content-center p-3">
            <SphereSpinner color="currentColor" />
        </div>
    }

    const renderTree = (nodes) => (
        <ul>
            {nodes.map((node) => (
                <li key={node.path}>
                    {node.type === 'directory' ? <>
                        <strong>{node.name}</strong>
                        {node.children && renderTree(node.children)}
                    </> : <span>
                        {node.name} ({node.size})
                    </span>}
                </li>
            ))}
        </ul>
    );

    return <div>{renderTree(data.children)}</div>;
}
