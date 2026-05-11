exports.handler = async function (event) {
  if (!['GET', 'POST'].includes(event.httpMethod))
    return json(405, { error: 'Method not allowed.' });

  const apiKey = process.env.PANCHANG_API_KEY;
  if (!apiKey) return json(503, { error: 'PANCHANG_API_KEY not configured in Netlify env vars.' });

  let lat, lon, tzone, year, month, day;
  try {
    const p = event.httpMethod === 'POST'
      ? JSON.parse(event.body || '{}')
      : (event.queryStringParameters || {});
    lat   = parseFloat(p.lat   ?? '27.7172');
    lon   = parseFloat(p.lon   ?? '85.3240');
    tzone = parseFloat(p.tzone ?? '5.75');
    const d = p.date ? new Date(p.date) : new Date();
    year = d.getFullYear(); month = d.getMonth() + 1; day = d.getDate();
  } catch { return json(400, { error: 'Invalid parameters.' }); }

  try {
    const res = await fetch('https://json.freeastrologyapi.com/complete-panchang', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        year, month, date: day,
        hours: 6, minutes: 0, seconds: 0,
        latitude: lat, longitude: lon, timezone: tzone,
        config: { observation_point: 'topocentric', ayanamsha: 'lahiri' },
      }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      return json(502, { error: `Panchang API HTTP ${res.status}: ${e.message || ''}` });
    }
    return json(200, { panchang: await res.json(), meta: { lat, lon, tzone, year, month, day } });
  } catch (e) {
    return json(502, { error: `Panchang fetch failed: ${e.message}` });
  }
};

function json(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(body) };
}
