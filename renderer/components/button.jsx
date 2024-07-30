// InputComponent.js
import React from 'react';

export default function ButtonComponent({ onClick, text, className, style, children }) {


    // defines various styles to be used for the button. 
    // each style shows a border on focus/hover, alters the background color to be slightly darker on hover, and changes the text color to lighter on hover.
    // each style should have a different color for the background and text color.
    // each style should also be semi transparent when disabled!!
    // styles for default, primary, secondary, info, warning, danger; 
    const button_styles = {
        default: "px-4 py-2 my-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white hover:bg-gray-100",
        primary: "px-4 py-2 my-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-blue-500 hover:bg-blue-600",
        secondary: "px-4 py-2 my-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-green-500 hover:bg-green-600",
        info: "px-4 py-2 my-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-blue-500 hover:bg-blue-600",
        warning: "px-4 py-2 my-2 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-yellow-500 hover:bg-yellow-600",
        danger: "px-4 py-2 my-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white bg-red-500 hover:bg-red-600",
    }

    return (
        <button
            onClick={onClick}
            className={className ?? button_styles[style] ?? button_styles.default}
        >
            {text ? text : null}
            {children}
        </button>
    );
}