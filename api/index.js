export default async function handler(req, res) {
  // ── Enable CORS ─────────────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── Extract requested path directly from URL ───────────────────────────────
  // Handles incoming URLs like "/api/mc-proxy/authentication/login_with_xbox"
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let endpoint = url.pathname
    .replace(/^\/api\/mc-proxy\/?/, '')
    .replace(/^\/api\/?/, '');

  // ── Health Check for browser test ──────────────────────────────────────────
  if (req.method === 'GET' && (!endpoint || endpoint === 'index')) {
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
