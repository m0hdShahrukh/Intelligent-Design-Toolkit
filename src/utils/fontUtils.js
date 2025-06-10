// Function to fetch all Google Fonts from the official API
export const fetchGoogleFonts = async (apiKey) => {
    const API_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Google Fonts API failed with status: ${response.status}`);
        }
        const data = await response.json();
        // Reformat the API response to match our app's structure
        return data.items.map(font => ({
            family: font.family,
            category: font.category,
        }));
    } catch (error) {
        console.error("Could not fetch Google Fonts. Please check your API key.", error);
        // Return a small fallback list in case of an API error
        return [
            { family: 'Roboto', category: 'sans-serif' },
            { family: 'Open Sans', category: 'sans-serif' },
            { family: 'Lato', category: 'sans-serif' },
            { family: 'Merriweather', category: 'serif' },
            { family: 'Playfair Display', category: 'serif' },
        ];
    }
};

export const calculateCompatibility = (baseFont, targetFont) => {
    if (!baseFont || !targetFont) return 0;
    if (baseFont.family === targetFont.family) return 0;

    let score = 50;

    if ((baseFont.category === 'serif' && targetFont.category === 'sans-serif') ||
        (baseFont.category === 'sans-serif' && targetFont.category === 'serif')) {
        score += 40;
    }

    if (baseFont.family.includes(targetFont.family.split(' ')[0]) ||
        targetFont.family.includes(baseFont.family.split(' ')[0])) {
        score += 25;
    }

    if (['display', 'handwriting'].includes(baseFont.category) &&
        ['display', 'handwriting'].includes(targetFont.category)) {
        score -= 50;
    }
    
    if ((baseFont.category === 'sans-serif' && targetFont.category === 'monospace') ||
        (baseFont.category === 'monospace' && targetFont.category === 'sans-serif')) {
        score += 20;
    }

    return Math.max(0, Math.min(100, score));
};

export const loadGoogleFont = (fontFamily) => {
    if (!fontFamily || document.getElementById(fontFamily)) return;
    const fontName = fontFamily.replace(/ /g, '+');
    const link = document.createElement('link');
    link.id = fontFamily;
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;700;900&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
};