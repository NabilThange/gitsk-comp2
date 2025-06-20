export default async function handler(req, res) {
  const { user = 'CJ_DEVC', theme = 'dark' } = req.query;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.setHeader('Content-Type', 'image/svg+xml');

  // Theme colors
  const themes = {
    dark: {
      bg: '#111827', // gray-900
      cardBg: '#030712', // gray-950
      border: '#facc15', // yellow-400
      text: '#facc15', // yellow-400
      subtitle: '#ffffff',
      accent1: '#f43f5e', // rose-500
      accent2: '#22d3ee', // cyan-400
      accent3: '#8b5cf6', // violet-500
      accent4: '#a3e635', // lime-400
      accent5: '#ef4444', // red-500
      accent6: '#3b82f6', // blue-500
      shadow: '#f43f5e'
    },
    light: {
      bg: '#f8fafc',
      cardBg: '#ffffff',
      border: '#1e293b',
      text: '#1e293b',
      subtitle: '#475569',
      accent1: '#f43f5e',
      accent2: '#22d3ee',
      accent3: '#8b5cf6',
      accent4: '#a3e635',
      accent5: '#ef4444',
      accent6: '#3b82f6',
      shadow: '#f43f5e'
    }
  };

  const colors = themes[theme] || themes.dark;

  // Typing phrases
  const phrases = [
    `WANTED: ${user}`,
    'VICE CITY',
    'MISSION: DEVELOPMENT',
    'GRAND THEFT CODE',
    'WELCOME TO THE PLAYGROUND'
  ];

  // Generate SVG
  const svg = `
<svg width="1000" height="500" viewBox="0 0 1000 500" xmlns="http://www.w3.org/2000/svg">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#111827;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </linearGradient>
    
    <!-- Glitch filter -->
    <filter id="glitch" x="-50%" y="-50%" width="200%" height="200%">
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
      <feOffset in="SourceGraphic" dx="2" dy="0" result="r"/>
      <feOffset in="SourceGraphic" dx="-2" dy="0" result="b"/>
      <feBlend mode="screen" in="r" in2="SourceGraphic" result="rb"/>
      <feBlend mode="screen" in="rb" in2="b"/>
    </filter>
    
    <!-- Flicker filter -->
    <filter id="flicker">
      <feFlood flood-color="#facc15" flood-opacity="0.8"/>
      <feComposite in="SourceGraphic" operator="multiply"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1000" height="500" fill="url(#bgGradient)"/>
  
  <!-- Scanline overlay -->
  <rect width="1000" height="500" fill="url(#scanlines)" opacity="0.1"/>
  
  <!-- Main card shadow -->
  <rect x="124" y="124" width="752" height="252" fill="${colors.shadow}"/>
  
  <!-- Main card -->
  <rect x="100" y="100" width="752" height="252" fill="${colors.cardBg}" stroke="${colors.border}" stroke-width="8"/>
  
  <!-- Top-right wanted stars -->
  <g transform="translate(750, 80)">
    <rect x="0" y="0" width="20" height="20" fill="#374151" stroke="#000000" stroke-width="2" transform="rotate(30)" class="star-1"/>
    <rect x="25" y="0" width="20" height="20" fill="#374151" stroke="#000000" stroke-width="2" transform="rotate(30)" class="star-2"/>
    <rect x="50" y="0" width="20" height="20" fill="${colors.accent5}" stroke="#000000" stroke-width="2" transform="rotate(30)" class="star-3"/>
    <rect x="75" y="0" width="20" height="20" fill="${colors.accent5}" stroke="#000000" stroke-width="2" transform="rotate(30)" class="star-4"/>
    <rect x="100" y="0" width="20" height="20" fill="${colors.accent5}" stroke="#000000" stroke-width="2" transform="rotate(30)" class="star-5"/>
  </g>
  
  <!-- Inner content container shadow -->
  <rect x="156" y="156" width="688" height="168" fill="${colors.accent3}"/>
  
  <!-- Inner content container -->
  <rect x="140" y="140" width="688" height="168" fill="${colors.cardBg}" stroke="${colors.accent6}" stroke-width="4" opacity="0.9"/>
  
  <!-- Username text with glitch effect -->
  <text x="484" y="210" font-family="Arial, monospace" font-size="48" font-weight="900" text-anchor="middle" fill="${colors.text}" class="glitch-text flicker">
    ${user.toUpperCase()}
  </text>
  
  <!-- Typing subtitle with cursor -->
  <text x="484" y="260" font-family="Arial, monospace" font-size="24" font-weight="700" text-anchor="middle" fill="${colors.subtitle}" class="typing-text">
    <animate attributeName="opacity" values="0;1;1;0" dur="8s" repeatCount="indefinite"/>
    WANTED: ${user.toUpperCase()}
  </text>
  
  <!-- Typing cursor -->
  <rect x="620" y="242" width="4" height="20" fill="${colors.accent4}" class="typing-cursor"/>
  
  <!-- Icon strip -->
  <!-- Car icon container -->
  <g transform="translate(350, 280)">
    <rect x="8" y="8" width="48" height="48" fill="${colors.accent4}"/>
    <rect x="0" y="0" width="48" height="48" fill="${colors.accent4}" stroke="#000000" stroke-width="4" class="icon-tilt-1"/>
    <!-- Simplified car icon -->
    <rect x="12" y="20" width="24" height="12" fill="#000000" rx="2"/>
    <circle cx="18" cy="35" r="3" fill="#000000"/>
    <circle cx="30" cy="35" r="3" fill="#000000"/>
  </g>
  
  <!-- Dollar icon container -->
  <g transform="translate(450, 280)">
    <rect x="8" y="8" width="48" height="48" fill="${colors.accent2}"/>
    <rect x="0" y="0" width="48" height="48" fill="${colors.accent5}" stroke="#000000" stroke-width="4" class="icon-tilt-2"/>
    <!-- Dollar sign -->
    <text x="24" y="32" font-family="Arial, sans-serif" font-size="24" font-weight="900" text-anchor="middle" fill="#000000">$</text>
  </g>
  
  <!-- Bolt icon container -->
  <g transform="translate(550, 280)">
    <rect x="8" y="8" width="48" height="48" fill="${colors.accent3}"/>
    <rect x="0" y="0" width="48" height="48" fill="${colors.accent6}" stroke="#000000" stroke-width="4" class="icon-tilt-3"/>
    <!-- Bolt icon -->
    <path d="M20 12 L32 12 L26 24 L36 24 L24 36 L18 24 L28 24 Z" fill="#000000"/>
  </g>
  
  <!-- Decorative glitch elements -->
  <rect x="120" y="120" width="2" height="40" fill="${colors.accent1}" opacity="0.7" class="glitch-bar-1"/>
  <rect x="850" y="300" width="2" height="30" fill="${colors.accent2}" opacity="0.7" class="glitch-bar-2"/>
  <rect x="140" y="350" width="30" height="2" fill="${colors.accent4}" opacity="0.7" class="glitch-bar-3"/>
  <rect x="800" y="130" width="25" height="2" fill="${colors.accent5}" opacity="0.7" class="glitch-bar-4"/>
  
  <!-- Floating particles -->
  <circle cx="200" cy="150" r="2" fill="${colors.accent1}" opacity="0.6" class="float-1"/>
  <circle cx="800" cy="180" r="3" fill="${colors.accent2}" opacity="0.6" class="float-2"/>
  <circle cx="180" cy="320" r="2" fill="${colors.accent3}" opacity="0.6" class="float-3"/>
  <circle cx="820" cy="320" r="2" fill="${colors.accent4}" opacity="0.6" class="float-4"/>
  
  <!-- Scanline effect -->
  <rect x="0" y="0" width="1000" height="2" fill="${colors.accent1}" opacity="0.3" class="scanline"/>
  
  <!-- CSS Animations -->
  <style>
    <![CDATA[
      @keyframes flicker {
        0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; }
        20%, 24%, 55% { opacity: 0.5; }
      }
      
      @keyframes glitchShift {
        0%, 100% { transform: translate(0, 0); }
        20% { transform: translate(-2px, 0); }
        40% { transform: translate(2px, 0); }
        60% { transform: translate(-1px, 0); }
        80% { transform: translate(1px, 0); }
      }
      
      @keyframes typingBlink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes tiltRotate {
        0%, 100% { transform: rotate(-6deg); }
        50% { transform: rotate(6deg); }
      }
      
      @keyframes scanlineMove {
        0% { transform: translateY(0); }
        100% { transform: translateY(500px); }
      }
      
      @keyframes pulseGlow {
        0%, 100% { filter: drop-shadow(0 0 5px ${colors.accent1}); }
        50% { filter: drop-shadow(0 0 15px ${colors.accent1}); }
      }
      
      @keyframes slideGlitch {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-3px); }
        75% { transform: translateX(3px); }
      }
      
      .flicker { animation: flicker 4s linear infinite; }
      .glitch-text { animation: glitchShift 0.3s ease-in-out infinite; }
      .typing-cursor { animation: typingBlink 1s step-end infinite; }
      .typing-text { animation: flicker 6s linear infinite; }
      
      .float-1 { animation: float 3s ease-in-out infinite; }
      .float-2 { animation: float 3s ease-in-out infinite 1s; }
      .float-3 { animation: float 3s ease-in-out infinite 2s; }
      .float-4 { animation: float 3s ease-in-out infinite 1.5s; }
      
      .icon-tilt-1 { animation: tiltRotate 4s ease-in-out infinite; }
      .icon-tilt-2 { animation: tiltRotate 4s ease-in-out infinite 1.3s; }
      .icon-tilt-3 { animation: tiltRotate 4s ease-in-out infinite 2.6s; }
      
      .scanline { animation: scanlineMove 3s linear infinite; }
      
      .star-1, .star-2, .star-3, .star-4, .star-5 { animation: pulseGlow 2s ease-in-out infinite; }
      .star-3 { animation-delay: 0.4s; }
      .star-4 { animation-delay: 0.8s; }
      .star-5 { animation-delay: 1.2s; }
      
      .glitch-bar-1 { animation: slideGlitch 0.5s ease-in-out infinite; }
      .glitch-bar-2 { animation: slideGlitch 0.5s ease-in-out infinite 0.1s; }
      .glitch-bar-3 { animation: slideGlitch 0.5s ease-in-out infinite 0.2s; }
      .glitch-bar-4 { animation: slideGlitch 0.5s ease-in-out infinite 0.3s; }
    ]]>
  </style>
</svg>`;

  res.send(svg);
}