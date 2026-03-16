export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY not configured' });
  }

  const { input, locationBias } = req.body;

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify({
        input,
        includedPrimaryTypes: [
          "bar",
          "night_club",
          "cocktail_bar",
          "wine_bar",
          "sports_bar"
        ],
        ...(locationBias && { locationBias }),
      }),
    });

    const data = await response.json();
    if (!response.ok) console.error('[places/autocomplete] Error:', JSON.stringify(data));
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[places/autocomplete] Fetch error:', error.message);
    return res.status(500).json({ error: 'Failed to reach Google Places API' });
  }
}
