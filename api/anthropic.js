export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('[anthropic] API key present:', !!apiKey);
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  try {
    console.log('[anthropic] Requesting model:', req.body?.model);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log('[anthropic] Response status:', response.status);
    if (!response.ok) console.error('[anthropic] Error body:', JSON.stringify(data));
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[anthropic] Fetch error:', error.message, error.stack);
    return res.status(500).json({ error: 'Failed to reach Anthropic API' });
  }
}
