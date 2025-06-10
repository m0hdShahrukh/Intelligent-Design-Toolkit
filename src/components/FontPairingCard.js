import React from 'react';

const FontPairingCard = ({ baseFont, matchedFont, score }) => {
    const scoreColor = score > 70 ? 'text-green-500' : score > 40 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="p-4 border rounded-lg bg-white fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold">{matchedFont.family}</h3>
                    <p className="text-sm text-gray-500">Paired with {baseFont.family}</p>
                </div>
                <div className={`text-2xl font-bold ${scoreColor}`}>{score}%</div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded">
                <h1 style={{ fontFamily: `'${baseFont.family}', sans-serif` }} className="text-4xl font-bold truncate">
                    Headline Font
                </h1>
                <p style={{ fontFamily: `'${matchedFont.family}', serif` }} className="mt-2 text-gray-700">
                    This is a paragraph of body text to preview the font pairing.
                </p>
            </div>
        </div>
    );
};

export default FontPairingCard;