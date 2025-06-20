// api/most-used-languages.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=1800'); // 30 minutes cache

  // Extract query parameters
  const { 
    user = 'octocat',
    theme = 'dark',
    title = 'MOST USED LANGUAGES',
    width = '800',
    height = '600',
    limit = '12'
  } = req.query;

  if (!user || user === 'octocat') {
    return res.status(400).send(generateErrorSVG('Please provide a GitHub username: ?user=yourname'));
  }

  try {
    // Fetch user's repositories
    const reposResponse = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`, {
      headers: {
        'User-Agent': 'GitHub-Language-Stats-API',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!reposResponse.ok) {
      if (reposResponse.status === 404) {
        return res.status(404).send(generateErrorSVG(`User '${user}' not found`));
      }
      throw new Error(`GitHub API error: ${reposResponse.status}`);
    }

    const repos = await reposResponse.json();
    
    if (!Array.isArray(repos) || repos.length === 0) {
      return res.status(404).send(generateErrorSVG(`No repositories found for user '${user}'`));
    }

    // Fetch language data for each repository
    const languagePromises = repos
      .filter(repo => !repo.fork) // Exclude forked repos
      .slice(0, 50) // Limit to first 50 repos to avoid rate limits
      .map(async (repo) => {
        try {
          const langResponse = await fetch(`https://api.github.com/repos/${repo.owner.login}/${repo.name}/languages`, {
            headers: {
              'User-Agent': 'GitHub-Language-Stats-API',
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          
          if (langResponse.ok) {
            return await langResponse.json();
          }
          return {};
        } catch (error) {
          console.error(`Error fetching languages for ${repo.name}:`, error);
          return {};
        }
      });

    const languageResults = await Promise.all(languagePromises);

    // Aggregate language data
    const languageStats = {};
    languageResults.forEach(repoLanguages => {
      Object.entries(repoLanguages).forEach(([language, bytes]) => {
        languageStats[language] = (languageStats[language] || 0) + bytes;
      });
    });

    // Convert to array and sort by usage
    const sortedLanguages = Object.entries(languageStats)
      .map(([name, bytes]) => ({ name, bytes }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, parseInt(limit));

    if (sortedLanguages.length === 0) {
      return res.status(404).send(generateErrorSVG(`No language data found for user '${user}'`));
    }

    // Calculate percentages and prepare data
    const totalBytes = sortedLanguages.reduce((sum, lang) => sum + lang.bytes, 0);
    const languageData = sortedLanguages.map((lang, index) => ({
      name: lang.name,
      bytes: lang.bytes,
      percentage: (lang.bytes / totalBytes) * 100,
      color: getLanguageColor(lang.name),
      shadowColor: getLanguageShadowColor(lang.name)
    }));

    // Generate SVG
    const svg = generateLanguagesSVG(languageData, user, theme, title, parseInt(width), parseInt(height));
    res.send(svg);

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).send(generateErrorSVG('Unable to fetch language data'));
  }
}

function generateErrorSVG(message) {
  return `
    <svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#030712"/>
      <rect x="20" y="20" width="760" height="360" fill="#000" stroke="#fff" stroke-width="4"/>
      <text x="400" y="200" font-family="Arial, sans-serif" font-size="20" fill="#ef4444" text-anchor="middle">
        Error: ${message}
      </text>
    </svg>
  `.trim();
}

function getLanguageColor(language) {
  const colors = {
    'JavaScript': '#f7df1e',
    'TypeScript': '#3178c6',
    'Python': '#3776ab',
    'Java': '#ed8b00',
    'C++': '#00599c',
    'C#': '#239120',
    'PHP': '#777bb4',
    'Ruby': '#cc342d',
    'Go': '#00add8',
    'Rust': '#000000',
    'Swift': '#fa7343',
    'Kotlin': '#7f52ff',
    'Dart': '#0175c2',
    'C': '#a8b9cc',
    'HTML': '#e34f26',
    'CSS': '#1572b6',
    'Vue': '#4fc08d',
    'React': '#61dafb',
    'Angular': '#dd0031',
    'Svelte': '#ff3e00',
    'Shell': '#89e051',
    'PowerShell': '#012456',
    'Dockerfile': '#384d54',
    'YAML': '#cb171e',
    'JSON': '#000000',
    'Markdown': '#083fa1',
    'SQL': '#e38c00',
    'R': '#276dc3',
    'Scala': '#dc322f',
    'Clojure': '#5881d8',
    'Haskell': '#5e5086',
    'Lua': '#000080',
    'Perl': '#39457e',
    'Objective-C': '#438eff',
    'Assembly': '#6e4c13',
    'MATLAB': '#e16737',
    'Jupyter Notebook': '#da5b0b'
  };
  return colors[language] || '#6b7280';
}

function getLanguageShadowColor(language) {
  const shadowColors = {
    'JavaScript': '#facc15',
    'TypeScript': '#60a5fa',
    'Python': '#22d3ee',
    'Java': '#f87171',
    'C++': '#a78bfa',
    'C#': '#34d399',
    'PHP': '#818cf8',
    'Ruby': '#e879f9',
    'Go': '#a3e635',
    'Rust': '#f472b6',
    'Swift': '#fb923c',
    'Kotlin': '#c084fc',
    'HTML': '#fb923c',
    'CSS': '#c084fc'
  };
  return shadowColors[language] || '#9ca3af';
}

function estimateTextWidth(text, fontSize) {
  // Approximate text width calculation (characters * fontSize * ratio)
  return text.length * fontSize * 0.6;
}

function estimateTextHeight(fontSize) {
  return fontSize;
}

function checkCollision(rect1, rect2, padding = 5) {
  return !(rect1.right + padding < rect2.left || 
           rect2.right + padding < rect1.left || 
           rect1.bottom + padding < rect2.top || 
           rect2.bottom + padding < rect1.top);
}

function calculateWordCloudPositions(languages, containerWidth, containerHeight) {
  const positions = [];
  const placedRects = [];
  const padding = 20;
  const usableWidth = containerWidth - (padding * 2);
  const usableHeight = containerHeight - (padding * 2);
  
  // Calculate font sizes first
  const maxPercentage = Math.max(...languages.map(l => l.percentage));
  const minPercentage = Math.min(...languages.map(l => l.percentage));
  
  const getFontSize = (percentage) => {
    const minFontSize = 14;
    const maxFontSize = 36;
    if (maxPercentage === minPercentage) return minFontSize;
    return minFontSize + ((percentage - minPercentage) / (maxPercentage - minPercentage)) * (maxFontSize - minFontSize);
  };

  // Sort languages by percentage (largest first for better placement)
  const sortedLanguages = [...languages].sort((a, b) => b.percentage - a.percentage);

  sortedLanguages.forEach((lang, index) => {
    const fontSize = getFontSize(lang.percentage);
    const textWidth = estimateTextWidth(lang.name, fontSize);
    const textHeight = estimateTextHeight(fontSize);
    
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    // Try to place the text without collision
    while (!placed && attempts < maxAttempts) {
      let x, y;
      
      if (attempts < 50) {
        // First 50 attempts: try spiral pattern from center
        const angle = attempts * 0.5;
        const radius = attempts * 3;
        const centerX = usableWidth / 2;
        const centerY = usableHeight / 2;
        
        x = centerX + Math.cos(angle) * radius;
        y = centerY + Math.sin(angle) * radius;
      } else {
        // Random placement as fallback
        x = Math.random() * (usableWidth - textWidth);
        y = Math.random() * (usableHeight - textHeight);
      }
      
      // Ensure text stays within bounds
      x = Math.max(padding, Math.min(usableWidth - textWidth + padding, x));
      y = Math.max(padding + textHeight, Math.min(usableHeight - textHeight + padding, y));
      
      // Create rectangle for collision detection
      const rect = {
        left: x - textWidth / 2,
        right: x + textWidth / 2,
        top: y - textHeight / 2,
        bottom: y + textHeight / 2
      };
      
      // Check for collisions with already placed text
      let hasCollision = false;
      for (const placedRect of placedRects) {
        if (checkCollision(rect, placedRect, 8)) {
          hasCollision = true;
          break;
        }
      }
      
      if (!hasCollision) {
        // Position is good, save it
        positions.push({
          x: x,
          y: y,
          fontSize: fontSize
        });
        placedRects.push(rect);
        placed = true;
      }
      
      attempts++;
    }
    
    // If we couldn't place it without collision, place it anyway with fallback position
    if (!placed) {
      // Fallback: place in a grid pattern
      const cols = Math.ceil(Math.sqrt(sortedLanguages.length));
      const cellWidth = usableWidth / cols;
      const cellHeight = usableHeight / Math.ceil(sortedLanguages.length / cols);
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      const x = col * cellWidth + cellWidth / 2 + padding;
      const y = row * cellHeight + cellHeight / 2 + padding;
      
      positions.push({
        x: Math.min(x, usableWidth - textWidth / 2 + padding),
        y: Math.min(y, usableHeight - textHeight / 2 + padding),
        fontSize: Math.min(fontSize, 18) // Reduce font size for fallback
      });
    }
  });

  // Re-map positions back to original order
  const finalPositions = [];
  languages.forEach(lang => {
    const sortedIndex = sortedLanguages.findIndex(sortedLang => sortedLang.name === lang.name);
    finalPositions.push(positions[sortedIndex]);
  });

  return finalPositions;
}

function generateLanguagesSVG(languageData, user, theme, title, svgWidth, svgHeight) {
  // Theme colors
  const themes = {
    dark: {
      bg: '#030712',
      containerBg: '#000000',
      contentBg: '#111827',
      border: '#ffffff',
      titleBg: '#a3e635',
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
  
  // Calculate positions within the content area
  const contentAreaX = 60;
  const contentAreaY = 160;
  const contentAreaWidth = svgWidth - 168;
  const contentAreaHeight = 320;
  
  const positions = calculateWordCloudPositions(languageData, contentAreaWidth, contentAreaHeight);

  return `
    <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          .title { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
          .lang-text { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; text-transform: uppercase; cursor: pointer; }
          .footer-text { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; }
        </style>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="${currentTheme.bg}"/>
      
      <!-- Main container with shadow -->
      <rect x="32" y="32" width="${svgWidth - 64}" height="${svgHeight - 40}" fill="${currentTheme.containerShadow}"/>
      <rect x="20" y="20" width="${svgWidth - 64}" height="${svgHeight - 40}" fill="${currentTheme.containerBg}" stroke="${currentTheme.border}" stroke-width="6"/>
      
      <!-- Title block with shadow -->
      <rect x="68" y="68" width="460" height="76" fill="${currentTheme.titleShadow}"/>
      <rect x="60" y="60" width="460" height="76" fill="${currentTheme.titleBg}" stroke="${currentTheme.border}" stroke-width="3"/>
      
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
      <rect x="72" y="172" width="${contentAreaWidth}" height="${contentAreaHeight}" fill="${currentTheme.contentShadow}"/>
      <rect x="${contentAreaX}" y="${contentAreaY}" width="${contentAreaWidth}" height="${contentAreaHeight}" fill="${currentTheme.contentBg}" stroke="${currentTheme.border}" stroke-width="3"/>
      
      <!-- Language word cloud -->
      ${languageData.map((lang, index) => {
        const pos = positions[index];
        if (!pos) return '';
        
        const x = contentAreaX + pos.x;
        const y = contentAreaY + pos.y;
        
        return `
          <!-- Language shadow -->
          <text x="${x + 2}" y="${y + 2}" 
                class="lang-text" 
                font-size="${pos.fontSize}" 
                fill="${lang.shadowColor}"
                text-anchor="middle">
            ${lang.name}
          </text>
          <!-- Language text -->
          <text x="${x}" y="${y}" 
                class="lang-text" 
                font-size="${pos.fontSize}" 
                fill="${lang.color}"
                text-anchor="middle">
            ${lang.name}
          </text>
        `;
      }).join('')}
      
      <!-- Footer with shadow -->
      <rect x="292" y="524" width="316" height="56" fill="${currentTheme.footerShadow}"/>
      <rect x="280" y="512" width="316" height="56" fill="${currentTheme.footerBg}" stroke="${currentTheme.titleBg}" stroke-width="3"/>
      
      <!-- Footer text -->
      <text x="438" y="545" class="footer-text" fill="${currentTheme.footerText}" font-size="18" text-anchor="middle">
        CODE SPEAKS VOLUMES
      </text>
      
      <!-- User attribution -->
      <text x="${svgWidth - 20}" y="${svgHeight - 10}" 
            font-family="Arial, sans-serif" 
            font-size="12" 
            fill="${currentTheme.border}" 
            text-anchor="end" 
            opacity="0.7">
        @${user}
      </text>
    </svg>
  `.trim();
}