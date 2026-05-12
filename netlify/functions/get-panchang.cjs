exports.handler = async function (event) {
  const debugRequested = event.queryStringParameters?.debug === '1';
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return json(405, { configured: true, panchang: null, error: 'Method not allowed.' });
  }

  const apiKey = (process.env.PANCHANG_API_KEY || '').trim();
  if (!apiKey) {
    const debug = makeDebug({
      ok: false,
      configured: false,
      providerStatus: null,
      providerKeys: [],
      normalizedKeys: [],
      message: 'PANCHANG_API_KEY not configured in Netlify env vars.',
    });
    return json(503, {
      configured: false,
      panchang: null,
      error: 'PANCHANG_API_KEY not configured in Netlify env vars.',
      ...(debugRequested ? { debug } : {}),
    });
  }

  let request;
  try {
    const p = event.httpMethod === 'POST'
      ? JSON.parse(event.body || '{}')
      : (event.queryStringParameters || {});
    const date = p.date ? new Date(`${p.date}T06:00:00`) : new Date();
    if (Number.isNaN(date.getTime())) throw new Error('Invalid date.');
    const timezone = String(p.timezone ?? p.tzone ?? 'Asia/Kathmandu');
    const lat = parseFloat(p.lat ?? '27.7172');
    const lng = parseFloat(p.lng ?? p.lon ?? '85.3240');
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Invalid coordinates.');
    request = {
      lat,
      lng,
      timezone,
      tzone: numericTimezone(timezone, date),
      language: String(p.language || 'en'),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      date: date.toISOString().slice(0, 10),
    };
  } catch (error) {
    const message = error.message || 'Invalid parameters.';
    return json(400, {
      configured: true,
      panchang: null,
      error: message,
      ...(debugRequested ? { debug: makeDebug({ ok: false, configured: true, providerStatus: null, providerKeys: [], normalizedKeys: [], message }) } : {}),
    });
  }

  try {
    const res = await fetch('https://json.freeastrologyapi.com/complete-panchang', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({
        year: request.year,
        month: request.month,
        date: request.day,
        hours: 6,
        minutes: 0,
        seconds: 0,
        latitude: request.lat,
        longitude: request.lng,
        timezone: request.tzone,
        config: { observation_point: 'topocentric', ayanamsha: 'lahiri' },
      }),
    });

    const payload = await res.json().catch(() => null);
    const providerKeys = safeKeys(payload);
    console.log('Panchang provider response:', { status: res.status, providerKeys });
    if (!res.ok) {
      const message = safeProviderMessage(payload) || `Panchang API HTTP ${res.status}`;
      console.error('Panchang provider request failed:', { status: res.status, message });
      return json(502, {
        configured: true,
        panchang: null,
        error: message,
        ...(debugRequested ? { debug: makeDebug({ ok: false, configured: true, providerStatus: res.status, providerKeys, normalizedKeys: [], message }) } : {}),
      });
    }

    const normalized = normalizePanchang(payload, request);
    const normalizedKeys = filledKeys(normalized);
    console.log('Panchang normalized output:', { normalizedKeys });
    const hasCalculatedValues = normalizedKeys.some(key => !['date', 'location', 'weekday', 'weekdayLord'].includes(key));
    const mappingMessage = hasCalculatedValues
      ? ''
      : 'Panchang source responded, but values could not be mapped.';
    return json(200, {
      configured: true,
      provider: 'freeastrologyapi',
      panchang: normalized,
      message: mappingMessage,
      meta: {
        lat: request.lat,
        lng: request.lng,
        timezone: request.timezone,
        tzone: request.tzone,
        date: request.date,
        language: request.language,
      },
      ...(debugRequested ? {
        debug: makeDebug({
          ok: hasCalculatedValues,
          configured: true,
          providerStatus: res.status,
          providerKeys,
          normalizedKeys,
          message: mappingMessage || 'Panchang values mapped successfully.',
        }),
      } : {}),
    });
  } catch (error) {
    const message = `Panchang fetch failed: ${error.message}`;
    console.error('Panchang fetch failed:', { message: error.message });
    return json(502, {
      configured: true,
      panchang: null,
      error: message,
      ...(debugRequested ? { debug: makeDebug({ ok: false, configured: true, providerStatus: null, providerKeys: [], normalizedKeys: [], message }) } : {}),
    });
  }
};

function normalizePanchang(payload, request) {
  const source = sourceObject(payload);
  return {
    date: request.date,
    location: {
      latitude: request.lat,
      longitude: request.lng,
      timezone: request.timezone,
    },
    sunrise: field(getFirstValue(source, ['sunrise', 'sunRise', 'sun_rise', 'suryaUday'])),
    sunset: field(getFirstValue(source, ['sunset', 'sunSet', 'sun_set', 'suryaAsta'])),
    tithi: field(getFirstValue(source, ['tithi', 'tithi_name'])),
    nakshatra: field(getFirstValue(source, ['nakshatra', 'nakshatra_name'])),
    yoga: field(getFirstValue(source, ['yoga', 'yog', 'yoga_name'])),
    karana: field(getFirstValue(source, ['karana', 'karanas', 'karan', 'karana_name'])),
    paksha: field(getFirstValue(source, ['paksha'])),
    lunarMonth: field(getFirstValue(source, ['lunarMonth', 'lunar_month', 'maasa', 'masa', 'month'])),
    rahuKaal: field(getFirstValue(source, ['rahuKaal', 'rahu_kal', 'rahuKala', 'rahu_kaal', 'rahu_kalam', 'rahuKalam'])),
    abhijitMuhurat: field(getFirstValue(source, ['abhijitMuhurat', 'abhijit_muhurta', 'abhijit_muhurat'])),
    gulikaKaal: field(getFirstValue(source, ['gulikaKaal', 'gulika_kaal', 'gulika'])),
    yamaganda: field(getFirstValue(source, ['yamaganda', 'yamagandam', 'yamaGanda'])),
    weekday: field(getFirstValue(source, ['weekday', 'vedic_weekday', 'vara', 'day'])) || { name: weekdayName(request.date) },
    weekdayLord: text(getFirstValue(source, ['weekdayLord', 'weekday_lord', 'varaLord', 'vara_lord'])) || weekdayLord(request.date),
    festivals: stringList(getFirstValue(source, ['festivals', 'festival'])),
    specialOccasions: stringList(getFirstValue(source, ['specialOccasions', 'special_occasions', 'special_notes'])),
    rawSummary: text(getFirstValue(source, ['summary', 'description', 'notes'])),
  };
}

function sourceObject(payload) {
  const root = payload && typeof payload === 'object' ? payload : {};
  const candidate = root.output || root.data || root.result || root.panchang || root;
  return candidate && typeof candidate === 'object' ? candidate : {};
}

function field(value) {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const name = String(value).trim();
    return name ? { name } : null;
  }
  if (Array.isArray(value)) return field(value[0]);
  if (typeof value !== 'object') return null;

  const numericChild = firstObjectChild(value);
  if (numericChild) return field(numericChild);

  const details = value.details && typeof value.details === 'object' ? value.details : {};
  const endTime = value.end_time && typeof value.end_time === 'object' ? value.end_time : {};
  const timing = value.timing && typeof value.timing === 'object' ? value.timing : {};
  const name = text(
    value.name || value.title || value.value || value.text || value.label || value.display ||
    value.tithi_name || value.nakshatra_name || value.yoga_name || value.karana_name ||
    value.weekday_name || value.vedic_weekday_name || value.lunar_month_name || value.lunar_month_full_name ||
    details.name || details.tithi_name || details.nakshatra_name || details.yoga_name || details.karana_name
  );
  const start = text(value.start || value.startTime || value.from || value.begin || value.start_time || value.starts_at || timing.from || timing.start);
  const end = text(
    value.end || value.endTime || value.to || value.finish || value.end_time || value.ends_at ||
    value.completes_at || value.completion || value.completed_at || endTime.timings || timing.to || timing.end
  );
  if (!name && !start && !end) return null;
  return {
    name: name || start || end,
    ...(start ? { start } : {}),
    ...(end ? { end, endTime: end } : {}),
  };
}

function firstObjectChild(value) {
  const entries = Object.entries(value);
  const numericEntry = entries.find(([key, child]) => /^\d+$/.test(key) && child && typeof child === 'object');
  if (numericEntry) return numericEntry[1];
  const objectEntries = entries.filter(([, child]) => child && typeof child === 'object');
  return entries.length > 0 && objectEntries.length === entries.length ? objectEntries[0][1] : null;
}

function getFirstValue(response, possiblePaths) {
  for (const path of possiblePaths) {
    const direct = getByPath(response, path);
    if (direct != null) return direct;
  }
  const keys = possiblePaths.map(path => path.split('.').pop()).filter(Boolean);
  for (const key of keys) {
    if (response && response[key] != null) return response[key];
  }
  const stack = response && typeof response === 'object' ? Object.values(response) : [];
  const seen = new Set();
  while (stack.length) {
    const current = stack.shift();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);
    for (const key of keys) {
      if (current[key] != null) return current[key];
    }
    stack.push(...Object.values(current));
  }
  return undefined;
}

function getByPath(source, path) {
  if (!source || typeof source !== 'object') return undefined;
  return path.split('.').reduce((current, part) => (
    current && typeof current === 'object' ? current[part] : undefined
  ), source);
}

function stringList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(item => text(item && typeof item === 'object' ? item.name || item.title || item.text || item : item)).filter(Boolean);
  const valueText = text(value);
  return valueText ? [valueText] : [];
}

function numericTimezone(timezone, date) {
  const parsed = Number(timezone);
  if (Number.isFinite(parsed)) return parsed;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const zoneName = parts.find(part => part.type === 'timeZoneName')?.value || 'GMT+0';
    const match = zoneName.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/i);
    if (!match) return 5.75;
    const sign = match[1] === '-' ? -1 : 1;
    const hours = Number(match[2] || 0);
    const minutes = Number(match[3] || 0);
    return sign * (hours + minutes / 60);
  } catch {
    return 5.75;
  }
}

function weekdayName(date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(`${date}T12:00:00`));
}

function weekdayLord(date) {
  return ['Surya', 'Chandra', 'Mangala', 'Budha', 'Brihaspati', 'Shukra', 'Shani'][new Date(`${date}T12:00:00`).getDay()] || '';
}

function safeProviderMessage(payload) {
  return text(payload && typeof payload === 'object' ? payload.message || payload.error || payload.responseDetails : '');
}

function safeKeys(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value).slice(0, 40) : [];
}

function filledKeys(value) {
  return Object.entries(value || {})
    .filter(([, item]) => {
      if (item == null) return false;
      if (typeof item === 'string') return item.trim().length > 0;
      if (Array.isArray(item)) return item.length > 0;
      if (typeof item === 'object') return Object.values(item).some(child => child != null && String(child).trim() !== '');
      return true;
    })
    .map(([key]) => key);
}

function makeDebug(info) {
  return {
    ok: Boolean(info.ok),
    configured: Boolean(info.configured),
    providerStatus: info.providerStatus,
    providerKeys: Array.isArray(info.providerKeys) ? info.providerKeys : [],
    normalizedKeys: Array.isArray(info.normalizedKeys) ? info.normalizedKeys : [],
    message: text(info.message),
  };
}

function text(value) {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}
