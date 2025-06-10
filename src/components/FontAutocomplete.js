import React, { useState } from 'react';

const FontAutocomplete = ({ fonts, onSelect, placeholder, defaultSuggestions = [] }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isActive, setIsActive] = useState(false);

    // Show default suggestions when the user clicks into the input
    const handleFocus = () => {
        setIsActive(true);
        if (query === '') {
            setSuggestions(defaultSuggestions);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        if (value.length > 1) {
            const filtered = fonts.filter(font =>
                font.family.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 100); // Limit results for performance
            setSuggestions(filtered);
        } else {
            // If input is cleared, show the default suggestions again
            setSuggestions(defaultSuggestions);
        }
    };

    const handleSelect = (font) => {
        setQuery(font.family);
        setSuggestions([]);
        onSelect(font);
        setIsActive(false);
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={() => setTimeout(() => setIsActive(false), 200)} // Delay to allow click selection
                placeholder={placeholder}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500 transition"
            />
            {isActive && suggestions.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map(font => (
                        <li
                            key={font.family}
                            // Use onMouseDown to fire before onBlur hides the list
                            onMouseDown={() => handleSelect(font)}
                            className="px-4 py-2 cursor-pointer hover:bg-indigo-100"
                        >
                            {font.family}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FontAutocomplete;