import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { fetchGoogleFonts, calculateCompatibility, loadGoogleFont } from './utils/fontUtils';
import { generatePalettes } from './utils/colorUtils';
import FontAutocomplete from './components/FontAutocomplete';
import FontPairingCard from './components/FontPairingCard';
import ColorInput from './components/ColorInput';
import PaletteDisplay from './components/PaletteDisplay';

const POPULAR_HEADING_FONTS = ['Playfair Display', 'Montserrat', 'Oswald', 'Merriweather', 'Raleway', 'Lora', 'Poppins'];
const POPULAR_BODY_FONTS = ['Roboto', 'Open Sans', 'Lato', 'Noto Sans', 'Source Sans Pro', 'Inter', 'Karla'];

const App = () => {
    const GOOGLE_FONTS_API_KEY = 'AIzaSyCbBMk3c-Pp_nl5R2kk7n-YqHBBKB4yKhM';

    // State Management
    const [allFonts, setAllFonts] = useState([]);
    const [fontsLoading, setFontsLoading] = useState(true);
    const [baseFont, setBaseFont] = useState(null);
    const [bodyFont, setBodyFont] = useState(null);
    const [fontPairings, setFontPairings] = useState([]);
    const [customPairingResult, setCustomPairingResult] = useState(null);
    const [pairingIntent, setPairingIntent] = useState('classic');

    const [baseColor, setBaseColor] = useState('#4f46e5');
    const [palettes, setPalettes] = useState(null);

    const pairingPools = useRef({ perfect: [], excellent: [], creative: [] });

    // Fetch fonts on load
    useEffect(() => {
        const loadFonts = async () => {
            if (!GOOGLE_FONTS_API_KEY || GOOGLE_FONTS_API_KEY === 'YOUR_API_KEY_HERE') {
                console.error("API Key for Google Fonts is missing.");
                return setFontsLoading(false);
            }
            setFontsLoading(true);
            const fonts = await fetchGoogleFonts(GOOGLE_FONTS_API_KEY);
            setAllFonts(fonts);
            setFontsLoading(false);
        };
        loadFonts();
    }, []);

    const [suggestedHeadingFonts, suggestedBodyFonts] = useMemo(() => {
        if (!allFonts.length) return [[], []];
        return [
            allFonts.filter(font => POPULAR_HEADING_FONTS.includes(font.family)),
            allFonts.filter(font => POPULAR_BODY_FONTS.includes(font.family))
        ];
    }, [allFonts]);

    useEffect(() => { setPalettes(generatePalettes(baseColor)); }, [baseColor]);

    // NEW: Effect to intelligently set the default pairing intent when a base font is chosen
    useEffect(() => {
        if (baseFont) {
            let defaultIntent = 'modern'; // Default for sans-serif
            if (baseFont.category === 'serif') {
                defaultIntent = 'classic';
            } else if (baseFont.category === 'display' || baseFont.category === 'handwriting') {
                defaultIntent = 'expressive';
            }
            setPairingIntent(defaultIntent);
        }
    }, [baseFont]);

    // This function intelligently assembles the list of 5 suggestions from the pools
    const generateDisplayList = useCallback(() => {
        const { perfect, excellent, creative } = pairingPools.current;
        const displayList = [];
        displayList.push(...perfect.slice(0, 2));
        const combinedPool = [...excellent, ...creative];
        const shuffledPool = combinedPool.sort(() => 0.5 - Math.random());
        const remainingSpots = 5 - displayList.length;
        displayList.push(...shuffledPool.slice(0, remainingSpots));
        
        setFontPairings(displayList);
        displayList.forEach(p => loadGoogleFont(p.font.family));
    }, []);

    // Main effect to calculate the pools of matches
    useEffect(() => {
        if (baseFont && allFonts.length > 0) {
            loadGoogleFont(baseFont.family);
            const allPairings = allFonts
                .map(font => ({ font, ...calculateCompatibility(baseFont, font, pairingIntent) }))
                .filter(p => p.font.family !== baseFont.family)
                .sort((a, b) => b.score - a.score);
            pairingPools.current = {
                perfect: allPairings.filter(p => p.score >= 90),
                excellent: allPairings.filter(p => p.score >= 75 && p.score < 90),
                creative: allPairings.filter(p => p.score >= 65 && p.score < 75),
            };
            generateDisplayList();
        } else {
            setFontPairings([]); // Clear suggestions if no base font
        }
    }, [baseFont, allFonts, pairingIntent, generateDisplayList]);

    // Effect to calculate the user's custom pairing score
    useEffect(() => {
        if (baseFont && bodyFont) {
            loadGoogleFont(bodyFont.family);
            setCustomPairingResult(calculateCompatibility(baseFont, bodyFont, pairingIntent));
        } else {
            setCustomPairingResult(null);
        }
    }, [baseFont, bodyFont, pairingIntent]);

const handleDemoRedirect = () => {
    if (!baseFont || !bodyFont || !palettes) {
      alert("Please select a heading font and a body font first.");
      return;
    }
    
    // This object structure is what the demo.html page expects
    const initialColors = {
      '--color-primary': palettes.complementary[0],
      '--color-secondary': palettes.complementary[2],
      '--color-accent': palettes.analogous[1],
      '--color-background': palettes.complementary[3],
      '--color-text': palettes.complementary[4],
      '--color-muted': palettes.shadesAndTints[1],
      '--color-footer-bg': palettes.complementary[4],
      '--color-footer-text': palettes.complementary[3]
    };

    const theme = {
      fonts: { heading: baseFont.family, body: bodyFont.family },
      palettes: palettes,
      initialColors: initialColors,
      assignments: { ...initialColors } // Pass a copy for the Undo history
    };

    localStorage.setItem('designTheme', JSON.stringify(theme));
    window.open('demo.html', '_blank');
  };
    
    const IntentButton = ({ intent, label }) => (
        <button 
            onClick={() => setPairingIntent(intent)}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${pairingIntent === intent ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}
        >{label}</button>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <a href="./documentation.html" target="_blank" rel="noopener noreferrer" className="fixed bottom-5 left-5 z-50 bg-gray-800 text-white font-semibold py-3 px-5 rounded-lg shadow-lg hover:bg-gray-900 flex items-center gap-2"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c-1.255 0-2.443-.29-3.5-.804V4.804zM14.5 4c1.255 0 2.443.29 3.5.804v10A7.969 7.969 0 0114.5 16c-1.255 0-2.443-.29-3.5-.804V4.804A7.968 7.968 0 0114.5 4z" /></svg>Documentation</a>
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Intelligent Design Toolkit</h1>
                    <p className="text-lg text-gray-600 mt-2">Create beautiful and cohesive designs with AI-powered suggestions.</p>
                    <h3 className="font-bold text-gray-800 mt-2">Developed by Mohd Shahrukh</h3>
                </header>
                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <section className="p-6 bg-white rounded-xl shadow-lg space-y-6">
                        <h2 className="text-2xl font-bold mb-2">The Intelligent Font Matcher</h2>
                        {!fontsLoading && allFonts.length > 0 && (
                            <div className="sm:flex sm:space-y-0 sm:space-x-4">
                                <FontAutocomplete fonts={allFonts} onSelect={setBaseFont} placeholder="Select a Heading Font" defaultSuggestions={suggestedHeadingFonts} />
                                <FontAutocomplete fonts={allFonts} onSelect={setBodyFont} placeholder="Select a Body Font" defaultSuggestions={suggestedBodyFonts} />
                            </div>
                        )}
                        {customPairingResult && baseFont && bodyFont && (
                            <div className="mt-4">
                               <h3 className="font-bold text-xl mb-2">Your Custom Pairing Result</h3>
                               <FontPairingCard baseFont={baseFont} matchedFont={bodyFont} score={customPairingResult.score} reasons={customPairingResult.reasons} />
                            </div>
                        )}
                        {baseFont && (
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-xl">Top 5 Matches for {baseFont.family}</h3>
                                    <button onClick={generateDisplayList} className="p-2 rounded-full hover:bg-gray-200" title="Get new suggestions">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M20 4h-5v5M4 20h5v-5" />
                                        </svg>
                                    </button>
                                </div>
                                <div>
                                    <div className="flex flex-wrap gap-3 p-2 bg-gray-100 rounded-full">
                                        <IntentButton intent="classic" label="Classic & Elegant"/>
                                        <IntentButton intent="modern" label="Modern & Clean"/>
                                        <IntentButton intent="expressive" label="Bold & Expressive"/>
                                    </div>
                                </div>
                                {fontPairings.length > 0 ? (
                                    fontPairings.map(pairing => (
                                        <FontPairingCard key={`${pairingIntent}-${pairing.font.family}`} baseFont={baseFont} matchedFont={pairing.font} score={pairing.score} reasons={pairing.reasons} />
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-gray-500">
                                        <p>No high-scoring matches found for this category.</p>
                                        <p className="text-sm">Try selecting another pairing personality.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                    <section className="p-6 bg-white rounded-xl shadow-lg space-y-6">
                        <h2 className="text-2xl font-bold mb-2">Advanced Color Palette Generator</h2>
                        <ColorInput baseColor={baseColor} onColorChange={setBaseColor} />
                        {palettes && (
                            <div className="space-y-6">
                                <PaletteDisplay title="Shades & Tints" colors={palettes.shadesAndTints} />
                                <PaletteDisplay title="Professional Complementary" colors={palettes.complementary} />
                                <PaletteDisplay title="Vibrant Analogous" colors={palettes.analogous} />
                                <PaletteDisplay title="Corporate Triadic" colors={palettes.triadic} />
                            </div>
                        )}
                    </section>
                </main>
                <footer className="mt-10 text-center">
                    <button onClick={handleDemoRedirect} disabled={!baseFont || !bodyFont} className="bg-indigo-600 text-white font-bold py-4 px-10 rounded-lg shadow-md hover:bg-indigo-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed">Preview Full Design</button>
                </footer>
            </div>
        </div>
    );
};
export default App;