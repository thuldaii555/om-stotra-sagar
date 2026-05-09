const DEFAULT_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
};

exports.handler = async function handler(event) {
  if (event.httpMethod && event.httpMethod !== 'GET') {
    return json(405, { configured: false, panchang: null, message: 'Method not allowed.' });
  }

  const provider = (process.env.PANCHANG_API_PROVIDER || '').trim() || 'generic';
  const apiKey = (process.env.PANCHANG_API_KEY || '').trim();
  const baseUrl = (process.env.PANCHANG_API_BASE_URL || '').trim();

  const query = event.queryStringParameters || {};
  const date = trim(query.date);
  const lat = trim(query.lat);
  const lng = trim(query.lng);
  const timezone = trim(query.timezone);
  const language = trim(query.language) || 'en';

  if (!date || !lat || !lng || !timezone) {
    return json(400, {
      configured: false,
      panchang: null,
      message: 'date, lat, lng, and timezone are required.',
    });
  }

  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return json(400, {
      configured: false,
      panchang: null,
      message: 'lat and lng must be valid numbers.',
    });
  }

  if (provider !== 'generic' || !baseUrl) {
    return json(200, {
      configured: false,
      panchang: null,
      message: 'Panchang API is not configured.',
    });
  }

  try {
    const apiResponse = await callProvider({
      baseUrl,
      apiKey,
      date,
      latitude,
      longitude,
      timezone,
      language,
    });
    const normalized = normalizePanchangResponse(apiResponse, { date, latitude, longitude, timezone, language, provider });

    return json(200, {
      configured: true,
      provider,
      panchang: normalized,
      message: normalized.message || 'Panchang data loaded.',
    });
  } catch (error) {
    const message = error && error.message ? error.message : 'Unable to load Panchang data.';
    return json(502, {
      configured: true,
      panchang: null,
      message,
    });
  }
};

async function callProvider({ baseUrl, apiKey, date, latitude, longitude, timezone, language }) {
  const url = new URL(baseUrl);
  url.searchParams.set('date', date);
  url.searchParams.set('lat', String(latitude));
  url.searchParams.set('lng', String(longitude));
  url.searchParams.set('timezone', timezone);
  url.searchParams.set('language', language);

  const headers = {
    Accept: 'application/json',
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
    headers['x-api-key'] = apiKey;
  }

  const response = await fetch(url.toString(), { headers });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (error) {
    throw new Error('Panchang API returned invalid JSON.');
  }

  if (!response.ok) {
    const errorMessage = payload && typeof payload === 'object' && payload.error
      ? payload.error
      : payload && typeof payload === 'object' && payload.message
        ? payload.message
        : `Panchang API request failed with status ${response.status}.`;
    throw new Error(errorMessage);
  }

  return payload;
}

function normalizePanchangResponse(payload, request) {
  const source = payload && typeof payload === 'object'
    ? (payload.panchang && typeof payload.panchang === 'object' ? payload.panchang : payload)
    : {};
  const location = normalizeLocation(source.location || payload.location, request);
  const result = {
    configured: true,
    provider: payload.provider || request.provider,
    date: payload.date || request.date,
    location,
    sunrise: normalizeField(source.sunrise || source.sunRise || source.suryaUday || payload.sunrise),
    sunset: normalizeField(source.sunset || source.sunSet || source.suryaAsta || payload.sunset),
    tithi: normalizeField(source.tithi || payload.tithi),
    nakshatra: normalizeField(source.nakshatra || payload.nakshatra),
    yoga: normalizeField(source.yoga || payload.yoga),
    karana: normalizeField(source.karana || payload.karana),
    paksha: normalizeField(source.paksha || payload.paksha),
    lunarMonth: normalizeField(source.lunarMonth || source.maasa || source.month || payload.lunarMonth),
    rahuKaal: normalizeField(source.rahuKaal || source.rahu_kal || source.rahuKala || payload.rahuKaal),
    rawSummary: asString(source.summary || source.notes || source.description || payload.rawSummary || payload.message || ''),
    message: asString(payload.message || source.message || ''),
  };

  if (!hasAnyCalculatedField(result)) {
    throw new Error('Provider response did not include Panchang values.');
  }

  return result;
}

function normalizeLocation(location, request) {
  const source = location && typeof location === 'object' ? location : {};
  return {
    city: asString(source.city || source.name || source.label),
    latitude: asNumber(source.latitude || source.lat || request.latitude),
    longitude: asNumber(source.longitude || source.lng || source.lon || request.longitude),
    timezone: asString(source.timezone || request.timezone),
  };
}

function normalizeField(value) {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const name = String(value).trim();
    return name ? { name } : null;
  }
  if (Array.isArray(value)) {
    return normalizeField(value[0]);
  }
  if (typeof value === 'object') {
    const source = value;
    const name = asString(source.name || source.title || source.value || source.text || source.label || source.display);
    const start = asString(source.start || source.startTime || source.from || source.begin);
    const end = asString(source.end || source.endTime || source.to || source.finish);
    if (!name && !start && !end) return null;
    return {
      name: name || start || end || '',
      ...(start ? { start } : {}),
      ...(end ? { end } : {}),
    };
  }
  return null;
}

function hasAnyCalculatedField(result) {
  return Boolean(
    result.sunrise?.name ||
    result.sunset?.name ||
    result.tithi?.name ||
    result.nakshatra?.name ||
    result.yoga?.name ||
    result.karana?.name ||
    result.paksha?.name ||
    result.lunarMonth?.name ||
    result.rahuKaal?.name
  );
}

function asString(value) {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function asNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function trim(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: DEFAULT_HEADERS,
    body: JSON.stringify(body),
  };
}
