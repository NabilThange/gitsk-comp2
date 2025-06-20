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

    // Generate mini chart data (simplified bars)
    const chartBars = months.map((month, index) => {
      const height = Math.max(2, (commitCounts[month] / Math.max(maxCommits, 1)) * 40);
      return `<rect x="${20 + index * 35}" y="${120 - height}" width="25" height="${height}" fill="#ff6b9d" stroke="#000" stroke-width="2"/>`;
    }).join('');

    const svg = `
    <svg width="500" height="350" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; }
        .title { font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
        .stat-number { font-size: 32px; }
        .stat-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .month-label { font-size: 10px; font-weight: bold; }
      </style>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="#fde047"/>
      
      <!-- Main container with thick border -->
      <rect x="10" y="10" width="480" height="330" fill="#ffffff" stroke="#000" stroke-width="6"/>
      
      <!-- Header section -->
      <rect x="25" y="25" width="200" height="40" fill="#ec4899" stroke="#000" stroke-width="4"/>
      <text x="35" y="48" fill="#000" class="title">GITHUB STATS</text>
      
      <!-- Username -->
      <rect x="250" y="25" width="220" height="40" fill="#000" stroke="#000" stroke-width="4"/>
      <text x="260" y="48" fill="#fff" class="title">${userData.login}</text>
      
      <!-- Stats Cards -->
      <!-- Total Commits Card -->
      <rect x="25" y="85" width="140" height="90" fill="#06b6d4" stroke="#000" stroke-width="4" transform="rotate(1 95 130)"/>
      <text x="95" y="115" fill="#000" class="stat-number" text-anchor="middle">${totalCommits}</text>
      <text x="95" y="135" fill="#000" class="stat-label" text-anchor="middle">TOTAL</text>
      <text x="95" y="150" fill="#000" class="stat-label" text-anchor="middle">COMMITS</text>
      
      <!-- Avg Commits Card -->
      <rect x="180" y="85" width="140" height="90" fill="#f472b6" stroke="#000" stroke-width="4" transform="rotate(-1 250 130)"/>
      <text x="250" y="115" fill="#000" class="stat-number" text-anchor="middle">${avgCommits}</text>
      <text x="250" y="135" fill="#000" class="stat-label" text-anchor="middle">AVG PER</text>
      <text x="250" y="150" fill="#000" class="stat-label" text-anchor="middle">MONTH</text>
      
      <!-- Max Commits Card -->
      <rect x="335" y="85" width="140" height="90" fill="#4ade80" stroke="#000" stroke-width="4" transform="rotate(1 405 130)"/>
      <text x="405" y="115" fill="#000" class="stat-number" text-anchor="middle">${maxCommits}</text>
      <text x="405" y="135" fill="#000" class="stat-label" text-anchor="middle">PEAK</text>
      <text x="405" y="150" fill="#000" class="stat-label" text-anchor="middle">MONTH</text>
      
      <!-- Chart Section -->
      <rect x="25" y="190" width="450" height="130" fill="#f3f4f6" stroke="#000" stroke-width="4"/>
      
      <!-- Chart Title -->
      <rect x="35" y="200" width="160" height="25" fill="#000" stroke="#000" stroke-width="2"/>
      <text x="115" y="218" fill="#fff" class="stat-label" text-anchor="middle">COMMIT TIMELINE</text>
      
      <!-- Chart bars -->
      ${chartBars}
      
      <!-- Month labels -->
      ${months.map((month, index) => 
        `<text x="${32 + index * 35}" y="140" fill="#000" class="month-label" text-anchor="middle">${month}</text>`
      ).join('')}
      
      <!-- Followers/Following -->
      <text x="35" y="270" fill="#000" class="stat-label">👥 FOLLOWERS: ${userData.followers}</text>
      <text x="35" y="290" fill="#000" class="stat-label">📦 REPOS: ${userData.public_repos}</text>
      
      <!-- Footer -->
      <rect x="200" y="300" width="200" height="25" fill="#000" stroke="#000" stroke-width="2" transform="rotate(-1 300 312)"/>
      <text x="300" y="318" fill="#fff" class="stat-label" text-anchor="middle">KEEP CODING • STAY BRUTAL</text>
    </svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 's-maxage=1800');
    res.status(200).send(svg);

  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    
    // Fallback SVG with error message
    const errorSvg = `
    <svg width="500" height="200" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font-family: 'Arial Black', Arial, sans-serif; font-weight: 900; }
      </style>
      <rect width="100%" height="100%" fill="#fde047"/>
      <rect x="10" y="10" width="480" height="180" fill="#ffffff" stroke="#000" stroke-width="6"/>
      <rect x="25" y="25" width="450" height="50" fill="#ef4444" stroke="#000" stroke-width="4"/>
      <text x="250" y="55" fill="#fff" font-size="20" text-anchor="middle">ERROR LOADING STATS</text>
      <text x="250" y="120" fill="#000" font-size="16" text-anchor="middle">User: ${username}</text>
      <text x="250" y="145" fill="#000" font-size="14" text-anchor="middle">Check username or try again later</text>
    </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(errorSvg);
  }
}