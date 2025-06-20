export default async function handler(req, res) {
  const { user = 'YOUR_USERNAME', title = 'ENTHUSIASTIC DEVELOPER', theme = 'dark' } = req.query;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.setHeader('Content-Type', 'image/svg+xml');

  // Theme colors
  const themes = {
    dark: {
      bg: '#030712', // gray-950
      cardBg: '#000000',
      border: '#ffffff',
      text: '#ffffff',
      accent1: '#f43f5e', // rose-500
      accent2: '#22d3ee', // cyan-400
      accent3: '#a3e635', // lime-400
      accent4: '#8b5cf6', // violet-500
      accent5: '#facc15', // yellow-400
      shadow: '#facc15'
    },
    light: {
      bg: '#f8fafc',
      cardBg: '#ffffff',
      border: '#1e293b',
      text: '#1e293b',
      accent1: '#f43f5e',
      accent2: '#22d3ee',
      accent3: '#a3e635',
      accent4: '#8b5cf6',
      accent5: '#facc15',
      shadow: '#facc15'
    }
  };

  const colors = themes[theme] || themes.dark;

  // Generate SVG
  const svg = `
<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="800" height="400" fill="${colors.bg}"/>
  
  <!-- Main card shadow -->
  <rect x="132" y="132" width="536" height="200" fill="${colors.shadow}"/>
  
  <!-- Main card -->
  <rect x="100" y="100" width="536" height="200" fill="${colors.cardBg}" stroke="${colors.border}" stroke-width="8"/>
  
  <!-- Top-left accent block shadow -->
  <rect x="88" y="88" width="32" height="32" fill="${colors.accent2}"/>
  
  <!-- Top-left accent block -->
  <rect x="80" y="80" width="32" height="32" fill="${colors.accent1}" stroke="${colors.border}" stroke-width="4" class="rotate-accent"/>
  
  <!-- Bottom-right accent block shadow -->
  <rect x="628" y="308" width="32" height="32" fill="${colors.accent1}"/>
  
  <!-- Bottom-right accent block -->
  <rect x="620" y="300" width="32" height="32" fill="${colors.accent2}" stroke="${colors.border}" stroke-width="4" class="rotate-accent-reverse"/>
  
  <!-- GitHub icon container shadow -->
  <rect x="172" y="140" width="64" height="64" fill="${colors.accent4}"/>
  
  <!-- GitHub icon container -->
  <rect x="160" y="128" width="64" height="64" fill="${colors.accent3}" stroke="${colors.border}" stroke-width="4" class="float-slow glow" transform="rotate(-6 192 160)"/>
  
  <!-- GitHub icon (simplified) -->
  <g transform="translate(176,144) scale(0.8)">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 7.06 4.584 13.065 10.942 15.182.8.147 1.094-.347 1.094-.77 0-.38-.014-1.387-.022-2.722-4.451.968-5.391-2.144-5.391-2.144-.728-1.849-1.776-2.341-1.776-2.341-1.452-.993.110-.973.110-.973 1.606.113 2.452 1.649 2.452 1.649 1.427 2.446 3.743 1.739 4.656 1.33.146-1.034.558-1.74 1.016-2.14-3.554-.404-7.29-1.777-7.29-7.907 0-1.747.623-3.174 1.646-4.292-.165-.405-.714-2.03.157-4.234 0 0 1.343-.43 4.398 1.641a15.31 15.31 0 0 1 4.005-.539c1.359.006 2.729.184 4.008.539 3.054-2.071 4.395-1.641 4.395-1.641.872 2.204.323 3.829.159 4.234 1.023 1.118 1.644 2.545 1.644 4.292 0 6.146-3.743 7.498-7.306 7.893.574.495 1.087 1.47 1.087 2.963 0 2.141-.019 3.864-.019 4.391 0 .426.288.925 1.099.768C27.421 29.06 32 23.062 32 16 32 7.16 24.84 0 16 0z" fill="${colors.cardBg}"/>
  </g>
  
  <!-- Username text with typing animation -->
  <text x="400" y="240" font-family="Arial, sans-serif" font-size="42" font-weight="900" text-anchor="middle" fill="${colors.text}" style="text-shadow: 4px 4px 0px ${colors.accent1};">
    <animate attributeName="textLength" values="0;${user.length * 25};${user.length * 25};0;0" dur="6s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0;1;1;1;1;0;0" dur="6s" repeatCount="indefinite"/>
    ${user.toUpperCase()}
  </text>
  
  <!-- Typing cursor -->
  <rect x="420" y="220" width="4" height="24" fill="${colors.accent5}" class="typing-cursor"/>
  
  <!-- Subtitle container shadow -->
  <rect x="280" y="268" width="240" height="36" fill="${colors.accent1}"/>
  
  <!-- Subtitle container -->
  <rect x="272" y="260" width="240" height="36" fill="${colors.border}" stroke="${colors.accent3}" stroke-width="4" transform="rotate(3 392 278)"/>
  
  <!-- Subtitle text -->
  <text x="392" y="282" font-family="Arial, sans-serif" font-size="14" font-weight="900" text-anchor="middle" fill="${colors.cardBg}">
    ${title}
  </text>
  
  <!-- Decorative dots -->
  <circle cx="250" cy="150" r="4" fill="${colors.accent2}"/>
  <circle cx="550" cy="150" r="4" fill="${colors.accent1}"/>
  <circle cx="250" cy="250" r="4" fill="${colors.accent3}"/>
  <circle cx="550" cy="250" r="4" fill="${colors.accent4}"/>
  
  <!-- Animated elements (CSS animations) -->
  <style>
    <![CDATA[
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      
      @keyframes floatSlow {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-3px); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      
      @keyframes typingBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      
      @keyframes rotate {
        0% { transform: rotate(-12deg); }
        50% { transform: rotate(-8deg); }
        100% { transform: rotate(-12deg); }
      }
      
      @keyframes rotateReverse {
        0% { transform: rotate(12deg); }
        50% { transform: rotate(8deg); }
        100% { transform: rotate(12deg); }
      }
      
      @keyframes subtleGlow {
        0%, 100% { filter: drop-shadow(0 0 8px ${colors.accent5}); }
        50% { filter: drop-shadow(0 0 16px ${colors.accent5}); }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-2px); }
        75% { transform: translateX(2px); }
      }
      
      .float-1 { animation: float 4s ease-in-out infinite; }
      .float-2 { animation: float 4s ease-in-out infinite 2s; }
      .float-slow { animation: floatSlow 6s ease-in-out infinite; }
      .pulse { animation: pulse 3s ease-in-out infinite; }
      .typing-cursor { animation: typingBlink 1s step-end infinite; }
      .rotate-accent { animation: rotate 8s ease-in-out infinite; }
      .rotate-accent-reverse { animation: rotateReverse 8s ease-in-out infinite; }
      .glow { animation: subtleGlow 4s ease-in-out infinite; }
      .shake { animation: shake 0.5s ease-in-out infinite 10s; }
    ]]>
  </style>
  
  <!-- Apply animations to decorative elements -->
  <g class="float-1">
    <circle cx="150" cy="180" r="4" fill="${colors.accent5}" opacity="0.8"/>
  </g>
  
  <g class="float-2">
    <circle cx="650" cy="220" r="4" fill="${colors.accent5}" opacity="0.8"/>
  </g>
  
  <!-- Additional floating elements -->
  <g class="float-slow">
    <circle cx="200" cy="120" r="2" fill="${colors.accent2}" opacity="0.6"/>
  </g>
  
  <g class="pulse">
    <circle cx="600" cy="120" r="2" fill="${colors.accent3}" opacity="0.6"/>
  </g>
  
  <g class="float-1">
    <circle cx="120" cy="280" r="3" fill="${colors.accent4}" opacity="0.7"/>
  </g>
  
  <g class="float-2">
    <circle cx="680" cy="280" r="3" fill="${colors.accent1}" opacity="0.7"/>
  </g>
  
  <!-- Animated subtitle container -->
  <g class="shake">
    <rect x="272" y="260" width="240" height="36" fill="none" stroke="${colors.accent5}" stroke-width="2" opacity="0.5" transform="rotate(3 392 278)"/>
  </g>
</svg>`;

  res.send(svg);
}