export default function handler(req, res) {
  // Set CORS headers for GitHub README embedding
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

  // Extract query parameters
  const { user = 'USER', title = 'COMMIT GRAPH', year = '2024' } = req.query;

  // Sample commit data (in a real implementation, you'd fetch from GitHub API)
  const commitData = [
    { date: "JAN", commits: 12 },
    { date: "FEB", commits: 19 },
    { date: "MAR", commits: 8 },
    { date: "APR", commits: 25 },
    { date: "MAY", commits: 15 },
    { date: "JUN", commits: 32 },
    { date: "JUL", commits: 28 },
    { date: "AUG", commits: 18 },
    { date: "SEP", commits: 22 },
    { date: "OCT", commits: 35 },
    { date: "NOV", commits: 29 },
    { date: "DEC", commits: 41 },
  ];

  // Chart dimensions and positioning
  const svgWidth = 800;
  const svgHeight = 600;
  const chartWidth = 600;
  const chartHeight = 300;
  const chartX = 100;
  const chartY = 200;
  const maxCommits = Math.max(...commitData.map(d => d.commits));

  // Generate area chart path
  function generateAreaPath(data) {
    const stepX = chartWidth / (data.length - 1);
    let pathData = '';
    
    // Start from bottom-left of chart area
    pathData += `M ${chartX} ${chartY + chartHeight} `;
    
    // Draw line to first data point
    const firstY = chartY + chartHeight - (data[0].commits / maxCommits) * chartHeight;
    pathData += `L ${chartX} ${firstY} `;
    
    // Draw area path through all data points
    data.forEach((point, index) => {
      const x = chartX + (index * stepX);
      const y = chartY + chartHeight - (point.commits / maxCommits) * chartHeight;
      pathData += `L ${x} ${y} `;
    });
    
    // Close the area by going to bottom-right and back to start
    pathData += `L ${chartX + chartWidth} ${chartY + chartHeight} `;
    pathData += `L ${chartX} ${chartY + chartHeight} Z`;
    
    return pathData;
  }

  // Generate line path for the stroke
  function generateLinePath(data) {
    const stepX = chartWidth / (data.length - 1);
    let pathData = '';
    
    data.forEach((point, index) => {
      const x = chartX + (index * stepX);
      const y = chartY + chartHeight - (point.commits / maxCommits) * chartHeight;
      
      if (index === 0) {
        pathData += `M ${x} ${y} `;
      } else {
        pathData += `L ${x} ${y} `;
      }
    });
    
    return pathData;
  }

  // Generate data points
  function generateDataPoints(data) {
    const stepX = chartWidth / (data.length - 1);
    return data.map((point, index) => {
      const x = chartX + (index * stepX);
      const y = chartY + chartHeight - (point.commits / maxCommits) * chartHeight;
      return { x, y, commits: point.commits };
    });
  }

  // Generate Y-axis labels
  function generateYAxisLabels() {
    const steps = 5;
    const labels = [];
    for (let i = 0; i <= steps; i++) {
      const value = Math.round((maxCommits / steps) * i);
      const y = chartY + chartHeight - (i / steps) * chartHeight;
      labels.push({ value, y });
    }
    return labels;
  }

  const areaPath = generateAreaPath(commitData);
  const linePath = generateLinePath(commitData);
  const dataPoints = generateDataPoints(commitData);
  const yAxisLabels = generateYAxisLabels();

  const svg = `
    <svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Drop shadow filter -->
        <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="8" dy="8" stdDeviation="0" flood-color="#000" flood-opacity="1"/>
        </filter>
        
        <!-- Title shadow filter -->
        <filter id="titleShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="8" dy="8" stdDeviation="0" flood-color="#ff6b9d" flood-opacity="1"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="#fef08a"/>
      
      <!-- Main container with shadow -->
      <rect x="50" y="50" width="700" height="500" 
            fill="white" 
            stroke="#000" 
            stroke-width="8" 
            filter="url(#dropShadow)"/>
      
      <!-- Title block -->
      <rect x="80" y="80" width="400" height="80" 
            fill="#000" 
            stroke="#000" 
            stroke-width="4" 
            filter="url(#titleShadow)"/>
      
      <!-- Git commit icon (simplified) -->
      <circle cx="110" cy="120" r="12" fill="#fef08a" stroke="#fef08a" stroke-width="2"/>
      <line x1="98" y1="120" x2="122" y2="120" stroke="#fef08a" stroke-width="3"/>
      <line x1="110" y1="108" x2="110" y2="132" stroke="#fef08a" stroke-width="3"/>
      
      <!-- Title text -->
      <text x="140" y="135" 
            font-family="Arial, sans-serif" 
            font-size="32" 
            font-weight="900" 
            fill="white" 
            text-transform="uppercase">
        ${title}
      </text>
      
      <!-- Chart container -->
      <rect x="${chartX - 20}" y="${chartY - 20}" width="${chartWidth + 40}" height="${chartHeight + 40}" 
            fill="#f3f4f6" 
            stroke="#000" 
            stroke-width="4" 
            filter="url(#dropShadow)"/>
      
      <!-- Y-axis -->
      <line x1="${chartX}" y1="${chartY}" x2="${chartX}" y2="${chartY + chartHeight}" 
            stroke="#000" stroke-width="3"/>
      
      <!-- X-axis -->
      <line x1="${chartX}" y1="${chartY + chartHeight}" x2="${chartX + chartWidth}" y2="${chartY + chartHeight}" 
            stroke="#000" stroke-width="3"/>
      
      <!-- Y-axis labels -->
      ${yAxisLabels.map(label => `
        <text x="${chartX - 15}" y="${label.y + 5}" 
              font-family="Arial, sans-serif" 
              font-size="14" 
              font-weight="bold" 
              fill="#000" 
              text-anchor="end">
          ${label.value}
        </text>
        <line x1="${chartX - 5}" y1="${label.y}" x2="${chartX}" y2="${label.y}" 
              stroke="#000" stroke-width="2"/>
      `).join('')}
      
      <!-- X-axis labels -->
      ${commitData.map((point, index) => {
        const stepX = chartWidth / (commitData.length - 1);
        const x = chartX + (index * stepX);
        return `
          <text x="${x}" y="${chartY + chartHeight + 25}" 
                font-family="Arial, sans-serif" 
                font-size="14" 
                font-weight="bold" 
                fill="#000" 
                text-anchor="middle">
            ${point.date}
          </text>
          <line x1="${x}" y1="${chartY + chartHeight}" x2="${x}" y2="${chartY + chartHeight + 5}" 
                stroke="#000" stroke-width="2"/>
        `;
      }).join('')}
      
      <!-- Area fill -->
      <path d="${areaPath}" 
            fill="#ff6b9d" 
            opacity="0.8"/>
      
      <!-- Line stroke -->
      <path d="${linePath}" 
            fill="none" 
            stroke="#000" 
            stroke-width="4"/>
      
      <!-- Data points -->
      ${dataPoints.map(point => `
        <circle cx="${point.x}" cy="${point.y}" r="6" 
                fill="#000" 
                stroke="#fff" 
                stroke-width="3"/>
      `).join('')}
      
      <!-- Footer -->
      <rect x="250" y="520" width="300" height="50" 
            fill="#000" 
            stroke="#000" 
            stroke-width="4" 
            filter="url(#dropShadow)"/>
      
      <text x="400" y="550" 
            font-family="Arial, sans-serif" 
            font-size="18" 
            font-weight="900" 
            fill="white" 
            text-anchor="middle" 
            text-transform="uppercase">
        ${user.toUpperCase()} - ${year}
      </text>
    </svg>
  `;

  res.send(svg);
}