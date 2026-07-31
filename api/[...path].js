export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Parse path segments from Vercel dynamic route
  let pathSegments = req.query.path || [];
  if (typeof pathSegments === 'string') pathSegments = [pathSegments];

  // Strip 'mc-proxy' if included in path
  if (pathSegments[0] === 'mc-proxy') {
    pathSegments = pathSegments.slice(1);
  }

  const endpoint = pathSegments.join('/');

  // Health check response
  if (req.method === 'GET' && !endpoint) {
    return res.status(200).json({ status: 'Proxy is online' });
  }

  const targetUrl = `https://api.minecraftservices.com/${endpoint}`;

  try {
    const requestBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': req.headers.authorization || '',
        'User-Agent': 'MinecraftLauncher/2.3.589 (Windows NT 10.0; Win64; x64)'
      },
      body: req.method === 'POST' ? requestBody : undefined,
    });

    const data = await response.text();
    res.status(response.status).setHeader('Content-Type', 'application/json').send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
