export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check response for direct browser visits
  if (req.method === 'GET' && !req.query.path) {
    return res.status(200).json({ 
      status: 'Proxy is online', 
      message: 'Send POST requests through poll.js' 
    });
  }

  const endpoint = req.query.path || 'authentication/login_with_xbox';
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

    if (data.includes('The request is blocked') || data.includes('<!DOCTYPE html')) {
      return res.status(502).json({
        error: 'Azure WAF blocked the request. Ensure you are sending a valid POST payload.'
      });
    }

    res.status(response.status).setHeader('Content-Type', 'application/json').send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
