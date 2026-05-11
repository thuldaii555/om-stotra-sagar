exports.handler = async function (event) {
  if (!['GET', 'POST'].includes(event.httpMethod)) {
    return json(405, { configured: true, panchang: null, error: 'Method not allowed.' });
  }

  const apiKey = (process.env.PANCHANG_API_KEY || '').trim();
  if (!apiKey) {
    return json(503, {
      configured: false,
      panchang: null,
      error: 'PANCHANG_API_KEY not configured in Netlify env vars.',
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
    return json(400, {
      configured: true,
      panchang: null,
      error: error.message || 'Invalid parameters.',
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
    if (!res.ok) {
      const message = safeProviderMessage(payload) || `Panchang API HTTP ${res.status}`;
      console.error('Panchang provider request failed:', { status: res.status, message });
      return json(502, { configured: true, panchang: null, error: message });
    }

    const normalized = normalizePanchang(payload, request);
    return json(200, {
      configured: true,
      provider: 'freeastrologyapi',
      panchang: normalized,
      meta: {
        lat: request.lat,
        lng: request.lng,
        timezone: request.timezone,
        tzone: request.tzone,
        date: request.date,
        language: request.language,
      },
    });
  } catch (error) {
    console.error('Panchang fetch failed:', { message: error.message });
    return json(502, {
      configured: true,
      panchang: null,
      error: `Panchang fetch failed: ${error.message}`,
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
    sunrise: field(findValue(source, ['sunrise', 'sunRise', 'sun_rise', 'suryaUday'])),
    sunset: field(findValue(source, ['sunset', 'sunSet', 'sun_set', 'suryaAsta'])),
    tithi: field(findValue(source, ['tithi', 'tithi_name'])),
    nakshatra: field(findValue(source, ['nakshatra', 'nakshatra_name'])),
    yoga: field(findValue(source, ['yoga', 'yog', 'yoga_name'])),
    karana: field(findValue(source, ['karana', 'karan', 'karana_name'])),
    paksha: field(findValue(source, ['paksha'])),
    lunarMonth: field(findValue(source, ['lunarMonth', 'lunar_month', 'maasa', 'masa', 'month'])),
    rahuKaal: field(findValue(source, ['rahuKaal', 'rahu_kal', 'rahuKala', 'rahu_kaal'])),
    abhijitMuhurat: field(findValue(source, ['abhijitMuhurat', 'abhijit_muhurta', 'abhijit_muhurat'])),
    gulikaKaal: field(findValue(source, ['gulikaKaal', 'gulika_kaal', 'gulika'])),
    yamaganda: field(findValue(source, ['yamaganda', 'yamagandam', 'yamaGanda'])),
    weekday: field(findValue(source, ['weekday', 'vedic_weekday', 'vara', 'day'])) || { name: weekdayName(request.date) },
    weekdayLord: text(findValue(source, ['weekdayLord', 'weekday_lord', 'varaLord', 'vara_lord'])) || weekdayLord(request.date),
    festivals: stringList(findValue(source, ['festivals', 'festival'])),
    specialOccasions: stringList(findValue(source, ['specialOccasions', 'special_occasions', 'special_notes'])),
    rawSummary: text(findValue(source, ['summary', 'description', 'notes'])),
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

  const details = value.details && typeof value.details === 'object' ? value.details : {};
  const endTime = value.end_time && typeof value.end_time === 'object' ? value.end_time : {};
  const name = text(
    value.name || value.title || value.value || value.text || value.label || value.display ||
    value.tithi_name || value.nakshatra_name || value.yoga_name || value.karana_name ||
    details.name || details.tithi_name || details.nakshatra_name || details.yoga_name || details.karana_name
  );
  const start = text(value.start || value.startTime || value.from || value.begin || value.start_time);
  const end = text(value.end || value.endTime || value.to || value.finish || endTime.timings || value.end_time);
  if (!name && !start && !end) return null;
  return {
    name: name || start || end,
    ...(start ? { start } : {}),
    ...(end ? { end, endTime: end } : {}),
  };
}

function findValue(source, keys) {
  for (const key of keys) {
    if (source && source[key] != null) return source[key];
  }
  const stack = source && typeof source === 'object' ? Object.values(source) : [];
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
