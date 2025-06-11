// Function to fetch all Google Fonts from the official API
export const fetchGoogleFonts = async (apiKey) => {
    const API_URL = `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}&sort=popularity`;
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Google Fonts API failed: ${response.status}`);
        const data = await response.json();
        
        // Enrich the font data with our custom metadata for scoring
        return data.items.map(font => ({
            family: font.family,
            category: font.category,
            // Add custom metadata based on our curated list
            ...fontMetadata[font.family]
        }));
    } catch (error) {
        console.error("Could not fetch Google Fonts. Please check your API key.", error);
        return []; // Return empty on error
    }
};

// A highly curated map of metadata for the new "intelligent" scoring system.
const fontMetadata = {
    // Excellent Body Fonts (High Body Fitness)
    'Roboto': { complexity: 1, headline_fitness: 0.6, body_fitness: 1.0 },
    'Open Sans': { complexity: 1, headline_fitness: 0.6, body_fitness: 0.95 },
    'Lato': { complexity: 2, headline_fitness: 0.7, body_fitness: 0.9 },
    'Noto Sans': { complexity: 1, headline_fitness: 0.6, body_fitness: 0.95 },
    'Inter': { complexity: 1, headline_fitness: 0.7, body_fitness: 1.0 },
    'Source Sans Pro': { complexity: 1, headline_fitness: 0.6, body_fitness: 0.9 },
    'Merriweather': { complexity: 4, headline_fitness: 0.8, body_fitness: 0.95 },
    'PT Serif': { complexity: 4, headline_fitness: 0.7, body_fitness: 0.85 },
    'Lora': { complexity: 5, headline_fitness: 0.8, body_fitness: 0.8 },
    'Karla': { complexity: 2, headline_fitness: 0.6, body_fitness: 0.9 },
    
    // Excellent Headline Fonts (High Headline Fitness)
    'Montserrat': { complexity: 2, headline_fitness: 0.9, body_fitness: 0.7 },
    'Poppins': { complexity: 2, headline_fitness: 1.0, body_fitness: 0.7 },
    'Raleway': { complexity: 2, headline_fitness: 0.9, body_fitness: 0.6 },
    'Oswald': { complexity: 3, headline_fitness: 1.0, body_fitness: 0.3 },
    'Playfair Display': { complexity: 7, headline_fitness: 1.0, body_fitness: 0.2 },
    'Roboto Slab': { complexity: 3, headline_fitness: 0.8, body_fitness: 0.7 },

    // Display / Script / Handwriting Fonts (Extremely Low Body Fitness)
    'Lobster': { complexity: 9, headline_fitness: 0.8, body_fitness: 0.01 },
    'Dancing Script': { complexity: 9, headline_fitness: 0.7, body_fitness: 0.01 },
    'Pacifico': { complexity: 8, headline_fitness: 0.7, body_fitness: 0.01 },
    'Caveat': { complexity: 7, headline_fitness: 0.6, body_fitness: 0.05 },
    'Lobster Two': { complexity: 9, headline_fitness: 0.8, body_fitness: 0.01 },
    'Yellowtail': { complexity: 8, headline_fitness: 0.7, body_fitness: 0.01 },
    'Sacramento': { complexity: 9, headline_fitness: 0.6, body_fitness: 0.01 },

    // Monospace
    'Inconsolata': { complexity: 2, headline_fitness: 0.4, body_fitness: 0.7 },
    'Roboto Mono': { complexity: 2, headline_fitness: 0.5, body_fitness: 0.8 },
};


// The "Hard-Fail" Intelligent Scoring Algorithm
export const calculateCompatibility = (baseFont, targetFont, intent = 'classic') => {
    if (!baseFont || !targetFont || baseFont.family === targetFont.family) {
        return { score: 0, reasons: [] };
    }

    const getFontProfile = (font) => {
        const profile = { ...font, ...fontMetadata[font.family] };
        if (!profile.complexity) { profile.complexity = (font.category === 'display' || font.category === 'handwriting') ? 8 : 3; }
        if (!profile.headline_fitness) { profile.headline_fitness = (font.category === 'display') ? 0.9 : 0.6; }
        if (!profile.body_fitness) {
            if (['display', 'handwriting'].includes(font.category)) { profile.body_fitness = 0.01; } 
            else if (['serif', 'sans-serif'].includes(font.category)) { profile.body_fitness = 0.7; }
            else { profile.body_fitness = 0.5; }
        }
        return profile;
    };

    const b = getFontProfile(baseFont);
    const t = getFontProfile(targetFont);
    const reasons = [];

    const UNREADABLE_BODY_CATEGORIES = ['handwriting', 'display'];
    
    if (UNREADABLE_BODY_CATEGORIES.includes(t.category)) {
        reasons.push("❌ Fatal Flaw: The body font is a decorative or script style, which is unreadable in paragraphs.");
        return { score: Math.floor(Math.random() * 8) + 1, reasons };
    }
    if (UNREADABLE_BODY_CATEGORIES.includes(b.category) && UNREADABLE_BODY_CATEGORIES.includes(t.category)) {
        reasons.push("❌ Fatal Flaw: Pairing two decorative fonts creates a visual clash and is difficult to read.");
        return { score: Math.floor(Math.random() * 5), reasons };
    }

    const roleSuitabilityScore = (b.headline_fitness * 0.4) + (t.body_fitness * 0.6);
    if (t.body_fitness > 0.85) { reasons.push("✅ Strong Foundation: The body font is highly readable."); }
    if (b.headline_fitness > 0.85) { reasons.push("✅ Strong Foundation: The headline font is impactful."); }

    let harmonyScore = 0.6;
    const isSuperfamily = b.family.split(' ')[0] === t.family.split(' ')[0] && b.family !== t.family;

    if (isSuperfamily) {
        harmonyScore = 1.0;
        reasons.push("✅ Perfect Harmony: These fonts are from the same family.");
    } else {
        switch (intent) {
            case 'classic':
                if (b.category === 'serif' && t.category === 'sans-serif') {
                    harmonyScore = 1.0;
                    reasons.push("✅ Classic Pairing: A Serif headline and Sans-Serif body offer elegant contrast.");
                }
                break;
            case 'modern':
                if (b.category === 'sans-serif' && t.category === 'sans-serif') {
                    harmonyScore = 0.95;
                    reasons.push("✅ Modern Pairing: Two distinct Sans-Serif fonts create a clean feel.");
                }
                break;
            case 'expressive':
                if (b.category === 'display' && t.category !== 'display') {
                    harmonyScore = 1.0;
                    reasons.push("✅ Expressive Pairing: A bold Display headline makes a strong statement.");
                }
                break;
            default: break;
        }
    }

    const complexityDiff = Math.abs(b.complexity - t.complexity);
    if (complexityDiff > 4) {
        harmonyScore += 0.1;
        reasons.push("✅ Good Personality: The headline's complexity is distinct from the body font.");
    } else if (complexityDiff < 2 && !isSuperfamily) {
        harmonyScore -= 0.15;
        reasons.push("⚠️ Caution: These fonts have very similar visual complexity.");
    }
    
    const finalScore = roleSuitabilityScore * harmonyScore * 100;

    return {
        score: Math.max(10, Math.min(99, Math.round(finalScore))),
        reasons: Array.from(new Set(reasons))
    };
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