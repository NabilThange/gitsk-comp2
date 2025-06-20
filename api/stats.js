export default async function handler(req, res) {
  const username = req.query.user;
  if (!username) {
    return res.status(400).send('Missing ?user=username');
  }

  try {
    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    const userData = await userResponse.json();

    // Fetch recent commits (simplified - using events as proxy for activity)
    const eventsResponse = await fetch(`https://api.github.com/users/${username}/events?per_page=100`);
    const events = await eventsResponse.json();
    
    // Filter push events and count by month
    const pushEvents = events.filter(event => event.type === 'PushEvent');
    const commitCounts = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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

    // Calculate stats
    const monthlyCommits = Object.values(commitCounts);
    const totalCommits = monthlyCommits.reduce((sum, count) => sum + count, 0);
    const avgCommits = Math.round(totalCommits / 12);
    const maxCommits = Math.max(...monthlyCommits);

    // Generate mini chart data (proper bars with better scaling)
    const chartBars = months.map((month, index) => {
      const height = Math.max(5, (commitCounts[month] / Math.max(maxCommits, 1)) * 80);
      const x = 70 + index * 40;
      const y = 340 - height;
      return `<rect x="${x}" y="${y}" width="30" height="${height}" fill="#ff6b9d" stroke="#000" stroke-width="2"/>
              <text x="${x + 15}" y="${y - 5}" fill="#000" font-size="10" font-weight="bold" text-anchor="middle">${commitCounts[month]}</text>`;
    }).join('');

    const svg = `
    <svg width="600" height="500" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; }
        .title { font-size: 20px; text-transform: uppercase; letter-spacing: 1px; }
        .username { font-size: 18px; text-transform: uppercase; }
        .stat-number { font-size: 28px; }
        .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .chart-title { font-size: 14px; text-transform: uppercase; }
        .month-label { font-size: 9px; font-weight: bold; }
        .footer { font-size: 12px; text-transform: uppercase; }
      </style>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="#fde047"/>
      
      <!-- Main container with thick border -->
      <rect x="15" y="15" width="570" height="470" fill="#ffffff" stroke="#000" stroke-width="6"/>
      
      <!-- Header section -->
      <rect x="30" y="30" width="180" height="35" fill="#ec4899" stroke="#000" stroke-width="4"/>
      <text x="40" y="52" fill="#000" class="title">GITHUB STATS</text>
      
      <!-- Username -->
      <rect x="230" y="30" width="240" height="35" fill="#000" stroke="#000" stroke-width="4"/>
      <text x="240" y="52" fill="#fff" class="username">${userData.login}</text>
      
      <!-- Stats Cards Row -->
      <!-- Total Commits Card -->
      <rect x="30" y="90" width="160" height="80" fill="#06b6d4" stroke="#000" stroke-width="4"/>
      <text x="110" y="120" fill="#000" class="stat-number" text-anchor="middle">${totalCommits}</text>
      <text x="110" y="140" fill="#000" class="stat-label" text-anchor="middle">TOTAL COMMITS</text>
      <text x="110" y="155" fill="#000" class="stat-label" text-anchor="middle">THIS YEAR</text>
      
      <!-- Avg Commits Card -->
      <rect x="220" y="90" width="160" height="80" fill="#f472b6" stroke="#000" stroke-width="4"/>
      <text x="300" y="120" fill="#000" class="stat-number" text-anchor="middle">${avgCommits}</text>
      <text x="300" y="140" fill="#000" class="stat-label" text-anchor="middle">AVG PER</text>
      <text x="300" y="155" fill="#000" class="stat-label" text-anchor="middle">MONTH</text>
      
      <!-- Max Commits Card -->
      <rect x="410" y="90" width="160" height="80" fill="#4ade80" stroke="#000" stroke-width="4"/>
      <text x="490" y="120" fill="#000" class="stat-number" text-anchor="middle">${maxCommits}</text>
      <text x="490" y="140" fill="#000" class="stat-label" text-anchor="middle">PEAK</text>
      <text x="490" y="155" fill="#000" class="stat-label" text-anchor="middle">MONTH</text>
      
      <!-- Chart Section -->
      <rect x="30" y="200" width="540" height="180" fill="#f8fafc" stroke="#000" stroke-width="4"/>
      
      <!-- Chart Title -->
      <rect x="40" y="210" width="200" height="25" fill="#000" stroke="#000" stroke-width="2"/>
      <text x="50" y="228" fill="#fff" class="chart-title">MONTHLY COMMIT ACTIVITY</text>
      
      <!-- Chart Background -->
      <rect x="50" y="250" width="500" height="100" fill="#ffffff" stroke="#000" stroke-width="2"/>
      
      <!-- Chart bars -->
      ${chartBars}
      
      <!-- Month labels -->
      ${months.map((month, index) => 
        `<text x="${75 + index * 40}" y="370" fill="#000" class="month-label" text-anchor="middle">${month}</text>`
      ).join('')}
      
      <!-- Additional Stats -->
      <rect x="30" y="410" width="250" height="50" fill="#a78bfa" stroke="#000" stroke-width="4"/>
      <text x="40" y="430" fill="#000" class="stat-label">👥 FOLLOWERS: ${userData.followers}</text>
      <text x="40" y="445" fill="#000" class="stat-label">📦 PUBLIC REPOS: ${userData.public_repos}</text>
      
      <!-- Profile Stats -->
      <rect x="320" y="410" width="250" height="50" fill="#fbbf24" stroke="#000" stroke-width="4"/>
      <text x="330" y="430" fill="#000" class="stat-label">⭐ ACCOUNT SINCE: ${new Date(userData.created_at).getFullYear()}</text>
      <text x="330" y="445" fill="#000" class="stat-label">📍 LOCATION: ${userData.location || 'Not specified'}</text>
    </svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=1800');
    res.status(200).send(svg);

  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    
    // Fallback SVG with error message
    const errorSvg = `
    <svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; }
      </style>
      <rect width="100%" height="100%" fill="#fde047"/>
      <rect x="15" y="15" width="570" height="270" fill="#ffffff" stroke="#000" stroke-width="6"/>
      <rect x="30" y="30" width="540" height="60" fill="#ef4444" stroke="#000" stroke-width="4"/>
      <text x="300" y="65" fill="#fff" font-size="24" text-anchor="middle">ERROR LOADING STATS</text>
      <text x="300" y="150" fill="#000" font-size="18" text-anchor="middle">User: ${username}</text>
      <text x="300" y="180" fill="#000" font-size="16" text-anchor="middle">Check username or try again later</text>
      <rect x="150" y="220" width="300" height="30" fill="#000" stroke="#000" stroke-width="2"/>
      <text x="300" y="240" fill="#fff" font-size="14" text-anchor="middle">GITHUB API ERROR</text>
    </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(errorSvg);
  }
}