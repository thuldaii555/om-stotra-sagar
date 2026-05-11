import { format } from 'date-fns';
import type { PanchangField, PanchangLocation, PanchangRequest, PanchangResult } from '../types';

const ENDPOINT = '/.netlify/functions/get-panchang';
export const PANCHANG_LOCATION_KEY = 'om-stotra-sagar-panchang-location';

export type PanchangFetchStatus = 'loading' | 'success' | 'notConfigured' | 'error';

export interface PanchangFetchState {
  status: PanchangFetchStatus;
  result: PanchangResult | null;
  message: string;
}

export interface LocalPanchangInfo {
  date: string;
  time: string;
  timezone: string;
  isoDate: string;
}

export interface SavedPanchangLocation {
  city: string;
  lat: number;
  lng: number;
  timezone: string;
}

type PanchangFunctionResponse = {
  configured?: boolean;
  message?: string;
  error?: string;
  provider?: string;
  panchang?: unknown;
  meta?: unknown;
  date?: string;
  location?: unknown;
  sunrise?: unknown;
  sunset?: unknown;
  tithi?: unknown;
  nakshatra?: unknown;
  yoga?: unknown;
  karana?: unknown;
  paksha?: unknown;
  lunarMonth?: unknown;
  rahuKaal?: unknown;
  abhijitMuhurat?: unknown;
  gulikaKaal?: unknown;
  yamaganda?: unknown;
  weekday?: unknown;
  weekdayLord?: string;
  festivals?: unknown;
  specialOccasions?: unknown;
  rawSummary?: string;
};

export const DEFAULT_PANCHANG_LOCATION: SavedPanchangLocation = {
  city: 'Kathmandu, Nepal',
  lat: 27.7172,
  lng: 85.3240,
  timezone: 'Asia/Kathmandu',
};

export function getTodayIsoDate(now = new Date()): string {
  return format(now, 'yyyy-MM-dd');
}

export function getTodayLocalInfo(now = new Date()): LocalPanchangInfo {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time zone';
  return {
    date: format(now, 'PPP'),
    time: format(now, 'p'),
    timezone,
    isoDate: getTodayIsoDate(now),
  };
}

export function readSavedPanchangLocation(): SavedPanchangLocation {
  if (typeof localStorage === 'undefined') return DEFAULT_PANCHANG_LOCATION;
  try {
    const saved = JSON.parse(localStorage.getItem(PANCHANG_LOCATION_KEY) || 'null') as Partial<SavedPanchangLocation> | null;
    const lat = Number(saved?.lat);
    const lng = Number(saved?.lng);
    return {
      city: saved?.city || DEFAULT_PANCHANG_LOCATION.city,
      lat: Number.isFinite(lat) ? lat : DEFAULT_PANCHANG_LOCATION.lat,
      lng: Number.isFinite(lng) ? lng : DEFAULT_PANCHANG_LOCATION.lng,
      timezone: saved?.timezone || DEFAULT_PANCHANG_LOCATION.timezone,
    };
  } catch {
    return DEFAULT_PANCHANG_LOCATION;
  }
}

export function savePanchangLocation(location: SavedPanchangLocation): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PANCHANG_LOCATION_KEY, JSON.stringify(location));
}

export async function fetchPanchang(request: PanchangRequest): Promise<PanchangFetchState> {
  if (!request.date || !request.timezone || !Number.isFinite(request.lat) || !Number.isFinite(request.lng)) {
    return {
      status: 'notConfigured',
      result: null,
      message: 'Panchang location or date is incomplete.',
    };
  }

  const params = new URLSearchParams({
    date: request.date,
    lat: String(request.lat),
    lng: String(request.lng),
    timezone: request.timezone,
  });
  if (request.language) params.set('language', request.language);

  try {
    const response = await fetch(`${ENDPOINT}?${params.toString()}`);
    const payload = (await response.json().catch(() => null)) as PanchangFunctionResponse | null;

    if (response.status === 404) {
      return {
        status: 'notConfigured',
        result: null,
        message: 'Panchang calculation source is not configured yet.',
      };
    }

    if (!response.ok) {
      const message = payload?.message || payload?.error || 'Unable to load Panchang right now.';
      if (response.status === 503 || payload?.configured === false || /not configured/i.test(message)) {
        return { status: 'notConfigured', result: null, message };
      }
      console.error('Panchang API request failed:', { status: response.status, message });
      return { status: 'error', result: null, message };
    }

    if (!payload || payload.configured === false || !payload.panchang) {
      return {
        status: 'notConfigured',
        result: null,
        message: payload?.message || 'Panchang calculation source is not configured yet.',
      };
    }

    const result = normalizePanchangResult(payload, request);
    if (!hasAnyCalculatedField(result)) {
      console.error('Panchang response missing expected fields:', Object.keys(getSourceObject(payload)));
      return {
        status: 'error',
        result: null,
        message: payload.message || 'Panchang details are temporarily unavailable.',
      };
    }

    return {
      status: 'success',
      result,
      message: payload.message || result.message || '',
    };
  } catch (error) {
    console.error('Panchang fetch failed:', error);
    return {
      status: 'error',
      result: null,
      message: 'Unable to load Panchang right now.',
    };
  }
}

export function normalizePanchangResult(payload: PanchangFunctionResponse, request: PanchangRequest): PanchangResult {
  const source = getSourceObject(payload);
  const location = normalizeLocation(source.location ?? payload.location ?? payload.meta, request);
  return {
    configured: payload.configured !== false,
    provider: payload.provider,
    date: asString(source.date ?? payload.date) || request.date,
    location,
    sunrise: normalizeField(findValue(source, ['sunrise', 'sunRise', 'suryaUday', 'sun_rise']) ?? payload.sunrise),
    sunset: normalizeField(findValue(source, ['sunset', 'sunSet', 'suryaAsta', 'sun_set']) ?? payload.sunset),
    tithi: normalizeField(findValue(source, ['tithi', 'tithi_name']) ?? payload.tithi),
    nakshatra: normalizeField(findValue(source, ['nakshatra', 'nakshatra_name']) ?? payload.nakshatra),
    yoga: normalizeField(findValue(source, ['yoga', 'yog']) ?? payload.yoga),
    karana: normalizeField(findValue(source, ['karana', 'karan']) ?? payload.karana),
    paksha: normalizeField(findValue(source, ['paksha']) ?? payload.paksha),
    lunarMonth: normalizeField(findValue(source, ['lunarMonth', 'lunar_month', 'maasa', 'masa', 'month']) ?? payload.lunarMonth),
    rahuKaal: normalizeField(findValue(source, ['rahuKaal', 'rahu_kal', 'rahuKala', 'rahu_kaal']) ?? payload.rahuKaal),
    abhijitMuhurat: normalizeField(findValue(source, ['abhijitMuhurat', 'abhijit_muhurta', 'abhijit_muhurat']) ?? payload.abhijitMuhurat),
    gulikaKaal: normalizeField(findValue(source, ['gulikaKaal', 'gulika_kaal', 'gulika']) ?? payload.gulikaKaal),
    yamaganda: normalizeField(findValue(source, ['yamaganda', 'yamagandam', 'yamaGanda', 'yamghanta']) ?? payload.yamaganda),
    weekday: normalizeField(findValue(source, ['weekday', 'vedic_weekday', 'vara', 'day']) ?? payload.weekday),
    weekdayLord: asString(findValue(source, ['weekdayLord', 'weekday_lord', 'varaLord', 'vara_lord']) ?? payload.weekdayLord),
    festivals: normalizeStringList(findValue(source, ['festivals', 'festival']) ?? payload.festivals),
    specialOccasions: normalizeStringList(findValue(source, ['specialOccasions', 'special_occasions', 'special_notes', 'notes']) ?? payload.specialOccasions),
    rawSummary: extractSummary(payload, source),
    message: asString(payload.message || source.message || ''),
  };
}

function getSourceObject(payload: PanchangFunctionResponse): Record<string, unknown> {
  const candidate = payload.panchang ?? (payload as Record<string, unknown>);
  if (!candidate || typeof candidate !== 'object') return {};
  const object = candidate as Record<string, unknown>;
  const nested = object.output ?? object.data ?? object.result;
  return nested && typeof nested === 'object' ? nested as Record<string, unknown> : object;
}

function normalizeLocation(location: unknown, request: PanchangRequest): PanchangLocation {
  const source = location && typeof location === 'object' ? location as Record<string, unknown> : {};
  return {
    city: asString(source.city ?? source.name ?? source.label),
    latitude: asNumber(source.latitude ?? source.lat ?? request.lat),
    longitude: asNumber(source.longitude ?? source.lng ?? source.lon ?? request.lng),
    timezone: asString(source.timezone ?? request.timezone) || request.timezone,
  };
}

function normalizeField(value: unknown): PanchangField | null {
  if (value == null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const name = String(value).trim();
    return name ? { name } : null;
  }
  if (Array.isArray(value)) return normalizeField(value[0]);
  if (typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const details = source.details && typeof source.details === 'object' ? source.details as Record<string, unknown> : {};
    const endTimeObject = source.end_time && typeof source.end_time === 'object' ? source.end_time as Record<string, unknown> : {};
    const name = asString(
      source.name ?? source.title ?? source.value ?? source.text ?? source.label ?? source.display ??
      source.tithi_name ?? source.nakshatra_name ?? source.yoga_name ?? source.karana_name ??
      details.name ?? details.tithi_name ?? details.nakshatra_name ?? details.yoga_name ?? details.karana_name
    );
    const start = asString(source.start ?? source.startTime ?? source.from ?? source.begin ?? source.start_time);
    const end = asString(source.end ?? source.endTime ?? source.to ?? source.finish ?? source.end ?? endTimeObject.timings ?? source.end_time);
    if (!name && !start && !end) return null;
    return {
      name: name || start || end || '',
      ...(start ? { start } : {}),
      ...(end ? { end, endTime: end } : {}),
    };
  }
  return null;
}

function findValue(source: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    const direct = source[key];
    if (direct != null) return direct;
  }
  const stack: unknown[] = Object.values(source);
  const seen = new Set<unknown>();
  while (stack.length) {
    const current = stack.shift();
    if (!current || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);
    const object = current as Record<string, unknown>;
    for (const key of keys) {
      if (object[key] != null) return object[key];
    }
    stack.push(...Object.values(object));
  }
  return undefined;
}

function hasAnyCalculatedField(result: PanchangResult): boolean {
  return Boolean(
    result.sunrise?.name ||
    result.sunset?.name ||
    result.tithi?.name ||
    result.nakshatra?.name ||
    result.yoga?.name ||
    result.karana?.name ||
    result.paksha?.name ||
    result.lunarMonth?.name ||
    result.rahuKaal?.name ||
    result.abhijitMuhurat?.name ||
    result.gulikaKaal?.name ||
    result.yamaganda?.name ||
    result.weekday?.name
  );
}

function extractSummary(payload: PanchangFunctionResponse, source: Record<string, unknown>): string {
  return asString(source.summary || source.description || payload.rawSummary || payload.message || payload.error || '');
}

function normalizeStringList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(item => asString(typeof item === 'object' && item ? (item as Record<string, unknown>).name ?? item : item)).filter(Boolean);
  const text = asString(value);
  return text ? [text] : [];
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}
