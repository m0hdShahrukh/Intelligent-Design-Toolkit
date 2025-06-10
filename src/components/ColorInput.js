import React, { useState, useEffect } from 'react';

const ColorInput = ({ baseColor, onColorChange }) => {
    const [hex, setHex] = useState(baseColor);

    useEffect(() => {
        setHex(baseColor);
    }, [baseColor]);

    const handleHexChange = (e) => {
        const value = e.target.value;
        setHex(value);
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            onColorChange(value);
        }
    };

    return (
        <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
            <label htmlFor="color-picker" className="cursor-pointer">
                <div className="w-12 h-12 rounded-md border-2 border-white shadow-md" style={{ backgroundColor: baseColor }}></div>
                <input
                    id="color-picker"
                    type="color"
                    value={baseColor}
                    onChange={(e) => onColorChange(e.target.value)}
                    className="opacity-0 w-0 h-0 absolute"
                />
            </label>
            <div>
                <label className="block text-sm font-medium text-gray-700">Hex Code</label>
                <input
                    type="text"
                    value={hex}
                    onChange={handleHexChange}
                    className="mt-1 px-3 py-1.5 w-32 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
            </div>
        </div>
    );
};

export default ColorInput;