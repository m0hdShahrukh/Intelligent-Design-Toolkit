import React, { useState, useEffect, useMemo } from 'react';
import { fetchGoogleFonts, calculateCompatibility, loadGoogleFont } from './utils/fontUtils';
import { generatePalettes } from './utils/colorUtils';

import FontAutocomplete from './components/FontAutocomplete';
import FontPairingCard from './components/FontPairingCard';
import ColorInput from './components/ColorInput';
import PaletteDisplay from './components/PaletteDisplay';

// Define our curated lists of popular fonts by name
const POPULAR_HEADING_FONTS = ['Playfair Display', 'Montserrat', 'Oswald', 'Merriweather', 'Raleway', 'Lora', 'Poppins'];
const POPULAR_BODY_FONTS = ['Roboto', 'Open Sans', 'Lato', 'Noto Sans', 'Source Sans Pro', 'Inter', 'Karla'];


const App = () => {
  // --- PASTE YOUR API KEY HERE ---
  const GOOGLE_FONTS_API_KEY = 'AIzaSyCbBMk3c-Pp_nl5R2kk7n-YqHBBKB4yKhM';

  // Font State
  const [allFonts, setAllFonts] = useState([]);
  const [fontsLoading, setFontsLoading] = useState(true);
  const [baseFont, setBaseFont] = useState(null);
  const [bodyFont, setBodyFont] = useState(null);
  const [fontPairings, setFontPairings] = useState([]);

  // Color State
  const [baseColor, setBaseColor] = useState('#4f46e5');
  const [palettes, setPalettes] = useState(null);

  // --- DATA FETCHING & INITIALIZATION ---
  useEffect(() => {
    const loadFonts = async () => {
      if (!GOOGLE_FONTS_API_KEY || GOOGLE_FONTS_API_KEY === 'YOUR_API_KEY_HERE') {
        console.error("API Key for Google Fonts is missing. Please add it in App.js");
        setFontsLoading(false);
        return;
      }
      setFontsLoading(true);
      const fonts = await fetchGoogleFonts(GOOGLE_FONTS_API_KEY);
      setAllFonts(fonts);
      setFontsLoading(false);
    };
    loadFonts();
  }, []);

  // Create the default suggestion lists once all fonts are loaded
  const [suggestedHeadingFonts, suggestedBodyFonts] = useMemo(() => {
    if (allFonts.length === 0) return [[], []];

    const headingFonts = allFonts.filter(font => POPULAR_HEADING_FONTS.includes(font.family));
    const bodyFonts = allFonts.filter(font => POPULAR_BODY_FONTS.includes(font.family));

    return [headingFonts, bodyFonts];
  }, [allFonts]);

  useEffect(() => {
    setPalettes(generatePalettes(baseColor));
  }, [baseColor]);


  // --- FONT PAIRING LOGIC ---
  useEffect(() => {
    if (baseFont && allFonts.length > 0) {
      loadGoogleFont(baseFont.family);
      const pairings = allFonts
        .map(font => ({
          font,
          score: calculateCompatibility(baseFont, font)
        }))
        .filter(p => p.score > 40)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setFontPairings(pairings);
      pairings.forEach(p => loadGoogleFont(p.font.family));
    }
  }, [baseFont, allFonts]);

  useEffect(() => {
    if (bodyFont) {
      loadGoogleFont(bodyFont.family);
    }
  }, [bodyFont]);

  const handleDemoRedirect = () => {
    if (!baseFont || !bodyFont || !palettes) {
      alert("Please select a heading font, a body font, and generate a color palette.");
      return;
    }
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
      assignments: { ...initialColors }
    };
    localStorage.setItem('designTheme', JSON.stringify(theme));
    window.open('demo.html', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <a
        href="./documentation.html"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 left-5 z-50 bg-gray-800 text-white font-semibold py-3 px-5 rounded-lg shadow-lg hover:bg-gray-900 transition-all transform hover:scale-105 flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 16c1.255 0 2.443-.29 3.5-.804V4.804zM14.5 4c1.255 0 2.443.29 3.5.804v10A7.969 7.969 0 0114.5 16c-1.255 0-2.443-.29-3.5-.804V4.804A7.968 7.968 0 0114.5 4z" />
        </svg>
        Documentation
      </a>
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Intelligent Design Toolkit</h1>
          <p className="text-lg text-gray-600 mt-2">Create beautiful and cohesive designs with AI-powered suggestions.</p>
          <h3 className="font-bold text-gray-800">Developed by Mohd Shahrukh</h3>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FONT MATCHER */}
          <section className="p-6 bg-white rounded-xl shadow-lg space-y-6">
            <h2 className="text-2xl font-bold mb-2">Select Your Font Family</h2>
            {fontsLoading && <div className="text-center p-10 text-gray-500">Loading font library...</div>}
            {!fontsLoading && !allFonts.length && <div className="text-center p-10 text-red-500 font-semibold">Failed to load fonts. Check API key.</div>}

            {!fontsLoading && allFonts.length > 0 && (
              <div className="space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
                <FontAutocomplete
                  fonts={allFonts}
                  onSelect={setBaseFont}
                  placeholder="Select a Heading Font"
                  defaultSuggestions={suggestedHeadingFonts}
                />
                <FontAutocomplete
                  fonts={allFonts}
                  onSelect={setBodyFont}
                  placeholder="Select a Body Font"
                  defaultSuggestions={suggestedBodyFonts}
                />
              </div>
            )}

            {baseFont && bodyFont && (
              <div className="mt-4">
                <h3 className="font-bold text-xl mb-2">Your Custom Pairing Result</h3>
                <FontPairingCard baseFont={baseFont} matchedFont={bodyFont} score={calculateCompatibility(baseFont, bodyFont)} />
              </div>
            )}

            <div className="space-y-4">
              {baseFont && <h3 className="font-bold text-xl">Top 5 Matches for {baseFont.family}</h3>}
              {fontPairings.map(({ font, score }) => (
                <FontPairingCard key={font.family} baseFont={baseFont} matchedFont={font} score={score} />
              ))}
            </div>
          </section>

          {/* COLOR GENERATOR */}
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
          <button
            onClick={handleDemoRedirect}
            disabled={!baseFont || !bodyFont}
            className="bg-indigo-600 text-white font-bold py-4 px-10 rounded-lg shadow-md hover:bg-indigo-700 transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
          >
            Preview Full Design on Demo Website
          </button>
        </footer>
      </div>
    </div>
  );
};

export default App;