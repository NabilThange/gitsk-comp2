export default async function handler(req, res) {
  const username = req.query.user;
  if (!username) {
    return res.status(400).send('Missing ?user=username');
  }

  try {
    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    const userData = await userResponse.json();

    // Fetch recent commits/events for activity data
    const eventsResponse = await fetch(`https://api.github.com/users/${username}/events?per_page=100`);
    const events = await eventsResponse.json();
    
    // Filter push events and count by month
    const pushEvents = events.filter(event => event.type === 'PushEvent');
    const commitCounts = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize months
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    months.forEach(month => commitCounts[month] = 0);
    
    // Count commits by month (from recent events)
    pushEvents.forEach(event => {
      const date = new Date(event.created_at);
      if (date.getFullYear() === currentYear) {
        const month = months[date.getMonth()];
        const commits = event.payload.commits ? event.payload.commits.length : 1;
        commitCounts[month] += commits;
      }
    });

    // Calculate max for scaling
    const maxCommits = Math.max(...Object.values(commitCounts));
    const totalCommits = Object.values(commitCounts).reduce((sum, count) => sum + count, 0);

    // Generate path for area chart
    const chartWidth = 800;
    const chartHeight = 300;
    const padding = 60;
    const graphWidth = chartWidth - (padding * 2);
    const graphHeight = chartHeight - (padding * 2);
    
    // Create points for the area chart
    const points = months.map((month, index) => {
      const x = padding + (index * (graphWidth / (months.length - 1)));
      const y = padding + graphHeight - ((commitCounts[month] / Math.max(maxCommits, 1)) * graphHeight);
      return { x, y, commits: commitCounts[month], month };
    });

    // Create SVG path for area
    const pathData = points.map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      return `L ${point.x} ${point.y}`;
    }).join(' ');
    
    // Close the area path
    const areaPath = `${pathData} L ${points[points.length - 1].x} ${padding + graphHeight} L ${points[0].x} ${padding + graphHeight} Z`;

    // Generate dots for each point
    const dots = points.map(point => 
      `<circle cx="${point.x}" cy="${point.y}" r="6" fill="#000" stroke="#fff" stroke-width="2"/>`
    ).join('');

    // Generate month labels
    const monthLabels = points.map((point, index) => 
      `<text x="${point.x}" y="${chartHeight - 20}" fill="#000" font-size="12" font-weight="bold" text-anchor="middle">${point.month}</text>`
    ).join('');

    // Generate commit count labels
    const commitLabels = points.map(point => 
      `<text x="${point.x}" y="${point.y - 10}" fill="#000" font-size="10" font-weight="bold" text-anchor="middle">${point.commits}</text>`
    ).join('');

    // Generate Y-axis labels
    const yAxisLabels = [0, 1, 2, 3, 4].map(i => {
      const value = Math.round((maxCommits / 4) * i);
      const y = padding + graphHeight - (i * (graphHeight / 4));
      return `<text x="${padding - 10}" y="${y + 4}" fill="#000" font-size="11" font-weight="bold" text-anchor="end">${value}</text>`;
    }).join('');

    const svg = `
    <svg width="900" height="600" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; }
        .title { font-size: 28px; text-transform: uppercase; letter-spacing: 2px; }
        .subtitle { font-size: 16px; text-transform: uppercase; letter-spacing: 1px; }
        .username { font-size: 20px; text-transform: uppercase; }
        .footer { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
      </style>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="#fde047"/>
      
      <!-- Main container -->
      <rect x="20" y="20" width="860" height="560" fill="#ffffff" stroke="#000" stroke-width="8"/>
      
      <!-- Title Block -->
      <rect x="50" y="50" width="400" height="60" fill="#000" stroke="#000" stroke-width="4"/>
      <circle cx="80" cy="80" r="15" fill="#fde047" stroke="#000" stroke-width="2"/>
      <rect x="75" y="75" width="10" height="10" fill="#000"/>
      <text x="110" y="88" fill="#fff" class="title">COMMIT GRAPH</text>
      
      <!-- Username -->
      <rect x="480" y="50" width="350" height="60" fill="#ff6b9d" stroke="#000" stroke-width="4"/>
      <text x="500" y="88" fill="#000" class="username">${userData.login}</text>
      
      <!-- Chart Container -->
      <rect x="50" y="140" width="800" height="360" fill="#f1f5f9" stroke="#000" stroke-width="4"/>
      
      <!-- Chart Background -->
      <rect x="70" y="160" width="760" height="300" fill="#ffffff" stroke="#000" stroke-width="2"/>
      
      <!-- Grid lines -->
      ${[1, 2, 3, 4].map(i => {
        const y = padding + 160 + (i * (graphHeight / 4));
        return `<line x1="70" y1="${y}" x2="830" y2="${y}" stroke="#e2e8f0" stroke-width="1"/>`;
      }).join('')}
      
      <!-- Y-axis -->
      <line x1="130" y1="180" x2="130" y2="440" stroke="#000" stroke-width="3"/>
      
      <!-- X-axis -->
      <line x1="130" y1="440" x2="830" y2="440" stroke="#000" stroke-width="3"/>
      
      <!-- Y-axis labels -->
      ${yAxisLabels}
      
      <!-- Area fill -->
      <path d="${areaPath.replace(/(\d+)/g, (match, num) => (parseInt(num) + 70).toString()).replace(/M (\d+) (\d+)/, 'M $1 ' + (parseInt(pathData.match(/M (\d+) (\d+)/)[2]) + 160))}" fill="#ff6b9d" opacity="0.8" stroke="none"/>
      
      <!-- Area stroke -->
      <path d="${pathData.replace(/(\d+)/g, (match, num, offset, str) => {
        const prevChar = str[offset - 1];
        if (prevChar === ' ' || prevChar === 'M' || prevChar === 'L') {
          return (parseInt(num) + 70).toString();
        }
        return (parseInt(num) + 160).toString();
      })}" fill="none" stroke="#000" stroke-width="4"/>
      
      <!-- Data points -->
      ${dots.replace(/cx="(\d+)"/g, (match, num) => `cx="${parseInt(num) + 70}"`).replace(/cy="(\d+)"/g, (match, num) => `cy="${parseInt(num) + 160}"`)}
      
      <!-- Month labels -->
      ${monthLabels.replace(/x="(\d+)"/g, (match, num) => `x="${parseInt(num) + 70}"`).replace(/y="(\d+)"/g, (match, num) => `y="${parseInt(num) + 160}"`)}
      
      <!-- Commit count labels -->
      ${commitLabels.replace(/x="(\d+)"/g, (match, num) => `x="${parseInt(num) + 70}"`).replace(/y="(\d+)"/g, (match, num) => `y="${parseInt(num) + 160}"`)}
      
      <!-- Stats Box -->
      <rect x="50" y="520" width="300" height="50" fill="#4ade80" stroke="#000" stroke-width="4"/>
      <text x="70" y="540" fill="#000" class="subtitle">TOTAL: ${totalCommits} COMMITS</text>
      <text x="70" y="555" fill="#000" class="subtitle">PEAK: ${maxCommits} IN ONE MONTH</text>
      
      <!-- Footer -->
      <rect x="400" y="520" width="430" height="50" fill="#000" stroke="#000" stroke-width="4"/>
      <text x="615" y="548" fill="#fff" class="footer" text-anchor="middle">VISUALIZE YOUR IMPACT</text>
    </svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=1800');
    res.status(200).send(svg);

  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    
    // Fallback SVG with error message
    const errorSvg = `
    <svg width="900" height="400" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; }
      </style>
      <rect width="100%" height="100%" fill="#fde047"/>
      <rect x="20" y="20" width="860" height="360" fill="#ffffff" stroke="#000" stroke-width="8"/>
      <rect x="50" y="50" width="800" height="80" fill="#ef4444" stroke="#000" stroke-width="4"/>
      <text x="450" y="100" fill="#fff" font-size="32" text-anchor="middle">ERROR LOADING COMMIT GRAPH</text>
      <text x="450" y="200" fill="#000" font-size="20" text-anchor="middle">User: ${username}</text>
      <text x="450" y="240" fill="#000" font-size="18" text-anchor="middle">Check username or try again later</text>
      <rect x="300" y="280" width="300" height="40" fill="#000" stroke="#000" stroke-width="2"/>
      <text x="450" y="305" fill="#fff" font-size="16" text-anchor="middle">GITHUB API ERROR</text>
    </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(errorSvg);
  }
}