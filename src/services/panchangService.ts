import { format } from 'date-fns';
import type { PanchangField, PanchangLocation, PanchangRequest, PanchangResult } from '../types';

const ENDPOINT = '/.netlify/functions/get-panchang';

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

type PanchangFunctionResponse = {
  configured?: boolean;
  message?: string;
  error?: string;
  provider?: string;
  panchang?: unknown;
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
  rawSummary?: string;
};

export function getTodayLocalInfo(now = new Date()): LocalPanchangInfo {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time zone';
  return {
    date: format(now, 'PPP'),
    time: format(now, 'p'),
    timezone,
    isoDate: format(now, 'yyyy-MM-dd'),
  };
}

export async function fetchPanchang(request: PanchangRequest): Promise<PanchangFetchState> {
  if (!request.date || !request.timezone || !Number.isFinite(request.lat) || !Number.isFinite(request.lng)) {
    return {
      status: 'notConfigured',
      result: null,
      message: 'Panchang calculation source is not configured yet.',
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
    if (response.status === 404) {
      return {
        status: 'notConfigured',
        result: null,
        message: 'Panchang calculation source is not configured yet.',
      };
    }

    const payload = (await response.json().catch(() => null)) as PanchangFunctionResponse | null;
    if (!response.ok) {
      if (response.status === 503 || payload?.configured === false || /not configured/i.test(payload?.message || payload?.error || '')) {
        return {
          status: 'notConfigured',
          result: null,
          message: payload?.message || payload?.error || 'Panchang calculation source is not configured yet.',
        };
      }
      return {
        status: 'error',
        result: null,
        message: payload?.message || payload?.error || 'Unable to load Panchang right now.',
      };
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
      return {
        status: 'error',
        result: null,
        message: payload.message || 'Provider response did not include Panchang values.',
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

function normalizePanchangResult(payload: PanchangFunctionResponse, request: PanchangRequest): PanchangResult {
  const source = getSourceObject(payload);
  const location = normalizeLocation(source.location ?? payload.location, request);
  return {
    configured: payload.configured !== false,
    provider: payload.provider,
    date: payload.date || request.date,
    location,
    sunrise: normalizeField(source.sunrise ?? source.sunRise ?? source.suryaUday ?? payload.sunrise),
    sunset: normalizeField(source.sunset ?? source.sunSet ?? source.suryaAsta ?? payload.sunset),
    tithi: normalizeField(source.tithi ?? payload.tithi),
    nakshatra: normalizeField(source.nakshatra ?? payload.nakshatra),
    yoga: normalizeField(source.yoga ?? payload.yoga),
    karana: normalizeField(source.karana ?? payload.karana),
    paksha: normalizeField(source.paksha ?? payload.paksha),
    lunarMonth: normalizeField(source.lunarMonth ?? source.maasa ?? source.month ?? payload.lunarMonth),
    rahuKaal: normalizeField(source.rahuKaal ?? source.rahu_kal ?? source.rahuKala ?? payload.rahuKaal),
    rawSummary: extractSummary(payload, source),
    message: asString(payload.message || source.message || ''),
  };
}

function getSourceObject(payload: PanchangFunctionResponse): Record<string, unknown> {
  const candidate = payload.panchang ?? (payload as Record<string, unknown>);
  return candidate && typeof candidate === 'object' ? (candidate as Record<string, unknown>) : {};
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
  if (Array.isArray(value)) {
    return normalizeField(value[0]);
  }
  if (typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const name = asString(source.name ?? source.title ?? source.value ?? source.text ?? source.label ?? source.display);
    const start = asString(source.start ?? source.startTime ?? source.from ?? source.begin);
    const end = asString(source.end ?? source.endTime ?? source.to ?? source.finish);
    if (!name && !start && !end) return null;
    return {
      name: name || start || end || '',
      ...(start ? { start } : {}),
      ...(end ? { end } : {}),
    };
  }
  return null;
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
    result.rahuKaal?.name
  );
}

function extractSummary(payload: PanchangFunctionResponse, source: Record<string, unknown>): string {
  return asString(
    source.summary ||
    source.notes ||
    source.description ||
    payload.rawSummary ||
    payload.message ||
    payload.error ||
    ''
  );
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
