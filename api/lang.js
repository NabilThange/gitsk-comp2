// api/most-used-languages.js
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  // Extract query parameters
  const { 
    user = 'Developer',
    theme = 'dark',
    title = 'MOST USED LANGUAGES',
    width = '800',
    height = '600'
  } = req.query;

  // Sample data for most used languages with dynamic sizing
  const languageData = [
    { name: "JavaScript", value: 100, color: "#facc15", shadowColor: "#a3e635" }, // yellow-400, lime-400
    { name: "Python", value: 80, color: "#22d3ee", shadowColor: "#f43f5e" }, // cyan-400, rose-500
    { name: "TypeScript", value: 70, color: "#60a5fa", shadowColor: "#facc15" }, // blue-400, yellow-400
    { name: "HTML", value: 60, color: "#fb923c", shadowColor: "#8b5cf6" }, // orange-400, violet-500
    { name: "CSS", value: 55, color: "#c084fc", shadowColor: "#ec4899" }, // purple-400, pink-500
    { name: "Java", value: 45, color: "#f87171", shadowColor: "#22d3ee" }, // red-400, cyan-400
    { name: "Go", value: 35, color: "#a3e635", shadowColor: "#f87171" }, // lime-400, red-400
    { name: "C#", value: 30, color: "#34d399", shadowColor: "#fbbf24" }, // emerald-400, amber-400
    { name: "PHP", value: 25, color: "#818cf8", shadowColor: "#a78bfa" }, // indigo-400, violet-400
    { name: "Ruby", value: 20, color: "#e879f9", shadowColor: "#60a5fa" }, // fuchsia-400, blue-400
    { name: "Rust", value: 15, color: "#f472b6", shadowColor: "#f472b6" }, // pink-400
    { name: "Shell", value: 10, color: "#9ca3af", shadowColor: "#9ca3af" }, // gray-400
  ];

  // Calculate font sizes based on values
  const minVal = Math.min(...languageData.map(lang => lang.value));
  const maxVal = Math.max(...languageData.map(lang => lang.value));
  
  const getFontSize = (value) => {
    const minFontSize = 14;
    const maxFontSize = 48;
    if (maxVal === minVal) return minFontSize;
    return minFontSize + ((value - minVal) / (maxVal - minVal)) * (maxFontSize - minFontSize);
  };

  // Theme colors
  const themes = {
    dark: {
      bg: '#030712', // gray-950
      containerBg: '#000000',
      contentBg: '#111827', // gray-900
      border: '#ffffff',
      titleBg: '#a3e635', // lime-400
      titleText: '#000000',
      footerBg: '#ffffff',
      footerText: '#000000',
      containerShadow: '#a3e635',
      titleShadow: '#f43f5e',
      contentShadow: '#22d3ee',
      footerShadow: '#f43f5e'
    },
    light: {
      bg: '#f9fafb',
      containerBg: '#ffffff',
      contentBg: '#f3f4f6',
      border: '#000000',
      titleBg: '#a3e635',
      titleText: '#000000',
      footerBg: '#000000',
      footerText: '#ffffff',
      containerShadow: '#a3e635',
      titleShadow: '#f43f5e',
      contentShadow: '#22d3ee',
      footerShadow: '#a3e635'
    }
  };

  const currentTheme = themes[theme] || themes.dark;
  const svgWidth = parseInt(width);
  const svgHeight = parseInt(height);

  // Position languages in a word cloud layout
  const positions = [
    { x: 200, y: 180 }, // JavaScript (largest)
    { x: 350, y: 140 }, // Python
    { x: 480, y: 200 }, // TypeScript
    { x: 150, y: 240 }, // HTML
    { x: 580, y: 160 }, // CSS
    { x: 320, y: 280 }, // Java
    { x: 450, y: 260 }, // Go
    { x: 250, y: 320 }, // C#
    { x: 520, y: 300 }, // PHP
    { x: 180, y: 350 }, // Ruby
    { x: 400, y: 340 }, // Rust
    { x: 300, y: 200 }, // Shell
  ];

  // Generate SVG
  const svg = `
    <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Drop shadow filter -->
        <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="4" dy="4" stdDeviation="0" flood-color="currentColor" flood-opacity="1"/>
        </filter>
        
        <!-- Bold font style -->
        <style>
          .title { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
          .lang-text { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; text-transform: uppercase; cursor: pointer; }
          .footer-text { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; }
        </style>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="${currentTheme.bg}"/>
      
      <!-- Main container with shadow -->
      <rect x="20" y="20" width="${svgWidth - 64}" height="${svgHeight - 40}" 
            fill="${currentTheme.containerBg}" 
            stroke="${currentTheme.border}" 
            stroke-width="6"/>
      <rect x="32" y="32" width="${svgWidth - 64}" height="${svgHeight - 40}" 
            fill="${currentTheme.containerShadow}" 
            stroke="none"/>
      <rect x="20" y="20" width="${svgWidth - 64}" height="${svgHeight - 40}" 
            fill="${currentTheme.containerBg}" 
            stroke="${currentTheme.border}" 
            stroke-width="6"/>
      
      <!-- Title block with shadow -->
      <rect x="68" y="68" width="460" height="76" fill="${currentTheme.titleShadow}"/>
      <rect x="60" y="60" width="460" height="76" 
            fill="${currentTheme.titleBg}" 
            stroke="${currentTheme.border}" 
            stroke-width="3"/>
      
      <!-- Code icon (simplified) -->
      <rect x="80" y="80" width="8" height="36" fill="${currentTheme.titleText}"/>
      <rect x="92" y="80" width="20" height="8" fill="${currentTheme.titleText}"/>
      <rect x="92" y="94" width="16" height="8" fill="${currentTheme.titleText}"/>
      <rect x="92" y="108" width="20" height="8" fill="${currentTheme.titleText}"/>
      
      <!-- Title text -->
      <text x="130" y="108" class="title" fill="${currentTheme.titleText}" font-size="28">
        ${title}
      </text>
      
      <!-- Content area with shadow -->
      <rect x="72" y="172" width="${svgWidth - 168}" height="320" fill="${currentTheme.contentShadow}"/>
      <rect x="60" y="160" width="${svgWidth - 168}" height="320" 
            fill="${currentTheme.contentBg}" 
            stroke="${currentTheme.border}" 
            stroke-width="3"/>
      
      <!-- Language word cloud -->
      ${languageData.map((lang, index) => {
        const pos = positions[index] || { x: 100 + (index * 60) % 400, y: 200 + Math.floor(index / 6) * 60 };
        const fontSize = getFontSize(lang.value);
        
        return `
          <!-- Language shadow -->
          <text x="${pos.x + 3}" y="${pos.y + 3}" 
                class="lang-text" 
                font-size="${fontSize}" 
                fill="${lang.shadowColor}">
            ${lang.name}
          </text>
          <!-- Language text -->
          <text x="${pos.x}" y="${pos.y}" 
                class="lang-text" 
                font-size="${fontSize}" 
                fill="${lang.color}">
            ${lang.name}
          </text>
        `;
      }).join('')}
      
      <!-- Footer with shadow -->
      <rect x="292" y="524" width="316" height="56" fill="${currentTheme.footerShadow}"/>
      <rect x="280" y="512" width="316" height="56" 
            fill="${currentTheme.footerBg}" 
            stroke="${currentTheme.titleBg}" 
            stroke-width="3"/>
      
      <!-- Footer text -->
      <text x="438" y="545" class="footer-text" 
            fill="${currentTheme.footerText}" 
            font-size="18" 
            text-anchor="middle">
        CODE SPEAKS VOLUMES
      </text>
      
      <!-- User attribution (if provided) -->
      ${user !== 'Developer' ? `
        <text x="${svgWidth - 20}" y="${svgHeight - 10}" 
              font-family="Arial, sans-serif" 
              font-size="12" 
              fill="${currentTheme.border}" 
              text-anchor="end" 
              opacity="0.7">
          @${user}
        </text>
      ` : ''}
    </svg>
  `.trim();

  res.send(svg);
}