import React, { useState } from 'react';

const PaletteDisplay = ({ title, colors }) => {
    const [copiedColor, setCopiedColor] = useState(null);

    const handleCopy = (color) => {
        navigator.clipboard.writeText(color);
        setCopiedColor(color);
        setTimeout(() => setCopiedColor(null), 2000);
    };

    return (
        <div>
            <h3 className="font-semibold text-lg mb-3">{title}</h3>
            <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                    <div
                        key={color}
                        onClick={() => handleCopy(color)}
                        className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105"
                        style={{ backgroundColor: color }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-50 rounded-lg transition-opacity">
                            <span className="text-white text-xs font-mono break-all text-center">
                                {copiedColor === color ? "Copied!" : color}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaletteDisplay;