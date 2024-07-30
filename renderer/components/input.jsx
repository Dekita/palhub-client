// InputComponent.js
import React from 'react';

export default function InputComponent({ type = 'text', placeholder = 'Enter text', label, value, onChange }) {
    return <React.Fragment>
        <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
            />
        </div>
    </React.Fragment>
}
