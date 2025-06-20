export default async function handler(req, res) {
  const username = req.query.user;
  if (!username) {
    return res.status(400).send('Missing ?user=username');
  }

  const response = await fetch(`https://api.github.com/users/${username}`);
  const data = await response.json();

  const svg = `
    <svg width="400" height="120" xmlns="http://www.w3.org/2000/svg">
      <style>
        text { font-family: 'Segoe UI', sans-serif; }
      </style>
      <rect width="100%" height="100%" fill="#111827" />
      <text x="20" y="40" fill="#FFFFFF" font-size="18">👤 ${data.login}</text>
      <text x="20" y="70" fill="#93c5fd">📦 Public Repos: ${data.public_repos}</text>
      <text x="20" y="100" fill="#fcd34d">👥 Followers: ${data.followers}</text>
    </svg>
  `;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 's-maxage=1800');
  res.status(200).send(svg);
}
