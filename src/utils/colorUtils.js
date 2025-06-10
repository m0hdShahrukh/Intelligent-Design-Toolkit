export const hexToHsl = (hex) => {
    let r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
            default: break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

export const hslToHex = (h, s, l) => {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { [r,g,b] = [c,x,0]; } 
    else if (60 <= h && h < 120) { [r,g,b] = [x,c,0]; } 
    else if (120 <= h && h < 180) { [r,g,b] = [0,c,x]; } 
    else if (180 <= h && h < 240) { [r,g,b] = [0,x,c]; } 
    else if (240 <= h && h < 300) { [r,g,b] = [x,0,c]; } 
    else if (300 <= h && h < 360) { [r,g,b] = [c,0,x]; }
    
    r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    b = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${r}${g}${b}`;
}

export const generatePalettes = (baseHex) => {
    const [h, s, l] = hexToHsl(baseHex);

    const shadesAndTints = [
        hslToHex(h, s, Math.min(100, l + 30)),
        hslToHex(h, s, Math.min(100, l + 15)),
        baseHex,
        hslToHex(h, s, Math.max(0, l - 15)),
        hslToHex(h, s, Math.max(0, l - 30)),
    ];

    const complementary = [
        baseHex,
        hslToHex((h + 180) % 360, s - 20, l + 10), // Adjusted Complementary
        hslToHex((h + 180) % 360, s, l), // Pure Complementary
        '#F3F4F6', // Light Gray
        '#1F2937', // Dark Gray
    ];

    const analogous = [
        baseHex,
        hslToHex((h + 30) % 360, s, l),
        hslToHex((h - 30 + 360) % 360, s, l),
        hslToHex(h, Math.max(0, s - 30), l),
        hslToHex(h, s, Math.max(0, l - 30))
    ];

    const triadic = [
        baseHex,
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 240) % 360, s, l),
        hslToHex((h + 120) % 360, s - 20, l),
        '#374151'
    ];

    return { shadesAndTints, complementary, analogous, triadic };
};