import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { CalendarClock, LocateFixed, MapPin, MoonStar, SunMedium } from 'lucide-react';
import type { PanchangContent } from '../types';
import { fetchPanchang, getTodayLocalInfo, type PanchangFetchState } from '../services/panchangService';

const LOCATION_KEY = 'om-stotra-sagar-panchang-location';

interface PanchangPageProps {
  content: PanchangContent;
  language: 'ne' | 'en';
}

interface PanchangLocationForm {
  city: string;
  latitude: string;
  longitude: string;
  timezone: string;
}

const getBrowserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time zone';

const getInitialLocation = (): PanchangLocationForm => {
  if (typeof localStorage === 'undefined') {
    return { city: '', latitude: '', longitude: '', timezone: getBrowserTimezone() };
  }

  try {
    const saved = JSON.parse(localStorage.getItem(LOCATION_KEY) || 'null') as Partial<PanchangLocationForm> | null;
    return {
      city: saved?.city || '',
      latitude: saved?.latitude || '',
      longitude: saved?.longitude || '',
      timezone: saved?.timezone || getBrowserTimezone(),
    };
  } catch {
    return { city: '', latitude: '', longitude: '', timezone: getBrowserTimezone() };
  }
};

export default function Panchang({ content, language }: PanchangPageProps) {
  const [now, setNow] = useState(() => new Date());
  const [location, setLocation] = useState<PanchangLocationForm>(() => getInitialLocation());
  const [state, setState] = useState<PanchangFetchState>({
    status: 'loading',
    result: null,
    message: '',
  });
  const [isLocating, setIsLocating] = useState(false);

  const localInfo = useMemo(() => getTodayLocalInfo(now), [now]);
  const dateKey = localInfo.isoDate;
  const timezoneDisplay = location.timezone.trim() || localInfo.timezone;

  const copy = language === 'ne'
    ? {
        eyebrow: 'पञ्चाङ्ग',
        title: 'पञ्चाङ्ग / Panchang',
        subtitle: 'दिन, समय, र स्थानको आधारमा दैनिक हिन्दू पात्रो जानकारी।',
        dateTitle: 'मिति र समय',
        locationTitle: 'स्थान',
        resultTitle: 'पञ्चाङ्ग विवरण',
        sourceTitle: 'स्रोत स्थिति',
        city: 'शहर',
        latitude: 'अक्षांश',
        longitude: 'देशान्तर',
        timezone: 'समय क्षेत्र',
        useLocation: 'मेरो स्थान प्रयोग गर्नुहोस्',
        notConfigured: 'पञ्चाङ्ग गणना स्रोत अहिले जडान गरिएको छैन। स्थानीय मिति र समय मात्र देखाइएका छन्।',
        error: 'अहिले पञ्चाङ्ग लोड गर्न सकिएन। कृपया स्थान जाँच्नुहोस् वा फेरि प्रयास गर्नुहोस्।',
        loading: 'पञ्चाङ्ग लोड हुँदैछ...',
        exactNote: 'ठ्याक्कै पञ्चाङ्ग मानहरू स्थान, समय क्षेत्र, र गणना विधिमा निर्भर हुन्छन्।',
        browserTime: 'स्थानीय समय',
        browserTimezone: 'समय क्षेत्र',
        selectedLocation: 'चयन गरिएको स्थान',
        manualHelp: 'अक्षांश/देशान्तर राखेपछि Panchang source उपलब्ध भएमा परिणाम तुरुन्तै लोड हुन्छ।',
        unavailable: 'उपलब्ध छैन',
        sunrise: 'सूर्योदय',
        sunset: 'सूर्यास्त',
        tithi: 'तिथि',
        nakshatra: 'नक्षत्र',
        yoga: 'योग',
        karana: 'करण',
        paksha: 'पक्ष',
        lunarMonth: 'चन्द्र महिना',
        rahuKaal: 'राहुकाल',
        configured: 'स्रोत उपलब्ध छ',
        provider: 'Provider',
      }
    : {
        eyebrow: 'Panchang',
        title: 'Panchang / पञ्चाङ्ग',
        subtitle: 'Daily Hindu almanac based on date, time, and location.',
        dateTitle: 'Date and time',
        locationTitle: 'Location',
        resultTitle: 'Panchang details',
        sourceTitle: 'Source status',
        city: 'City',
        latitude: 'Latitude',
        longitude: 'Longitude',
        timezone: 'Timezone',
        useLocation: 'Use my location',
        notConfigured: 'Panchang calculation source is not configured yet. Local date and time are shown.',
        error: 'Unable to load Panchang right now. Please check location or try again.',
        loading: 'Loading Panchang...',
        exactNote: 'Exact Panchang values depend on location, timezone, and calculation method.',
        browserTime: 'Local time',
        browserTimezone: 'Timezone',
        selectedLocation: 'Selected location',
        manualHelp: 'Enter latitude and longitude to load Panchang when a source is configured.',
        unavailable: 'Unavailable',
        sunrise: 'Sunrise',
        sunset: 'Sunset',
        tithi: 'Tithi',
        nakshatra: 'Nakshatra',
        yoga: 'Yoga',
        karana: 'Karana',
        paksha: 'Paksha',
        lunarMonth: 'Lunar month',
        rahuKaal: 'Rahu Kaal',
        configured: 'Source available',
        provider: 'Provider',
      };

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    const latitude = Number(location.latitude);
    const longitude = Number(location.longitude);
    const timezone = location.timezone.trim();

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !timezone) {
      setState({
        status: 'notConfigured',
        result: null,
        message: copy.notConfigured,
      });
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setState((current) => ({ ...current, status: 'loading', message: '' }));
      const next = await fetchPanchang({
        date: dateKey,
        lat: latitude,
        lng: longitude,
        timezone,
        language,
      });
      if (!cancelled) {
        setState(next);
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [copy.notConfigured, dateKey, language, location.latitude, location.longitude, location.timezone]);

  const resultFields = state.result ? [
    { key: 'sunrise', title: copy.sunrise, value: formatField(state.result.sunrise) },
    { key: 'sunset', title: copy.sunset, value: formatField(state.result.sunset) },
    { key: 'tithi', title: copy.tithi, value: formatField(state.result.tithi) },
    { key: 'nakshatra', title: copy.nakshatra, value: formatField(state.result.nakshatra) },
    { key: 'yoga', title: copy.yoga, value: formatField(state.result.yoga) },
    { key: 'karana', title: copy.karana, value: formatField(state.result.karana) },
    { key: 'paksha', title: copy.paksha, value: formatField(state.result.paksha) },
    { key: 'lunarMonth', title: copy.lunarMonth, value: formatField(state.result.lunarMonth) },
    { key: 'rahuKaal', title: copy.rahuKaal, value: formatField(state.result.rahuKaal) },
  ] : [];

  const selectedLocation = location.city || `${location.latitude || '—'}, ${location.longitude || '—'}`;

  return (
    <main className="page-container page-shell panchang-page">
      <section className="page-hero editorial-card premium-hero-card">
        <p className="page-eyebrow">{copy.eyebrow}</p>
        <h1 className="page-title">{copy.title}</h1>
        <p className="page-subtitle">{copy.subtitle}</p>
      </section>

      <section className="content-grid panchang-layout">
        <article className="panchang-card panchang-dashboard visual-card">
          <div className="panchang-section-header">
            <div>
              <p className="section-kicker">{copy.dateTitle}</p>
              <h2 className="card-title">{localInfo.date}</h2>
            </div>
            <div className="today-badge">
              <CalendarClock size={18} />
              <span>{copy.browserTime}</span>
            </div>
          </div>

          <div className="panchang-time-grid">
            <InfoCard icon={<SunMedium size={16} />} label={copy.browserTime} value={localInfo.time} />
            <InfoCard icon={<MapPin size={16} />} label={copy.browserTimezone} value={localInfo.timezone} />
          </div>
        </article>

        <article className="panchang-card panchang-dashboard visual-card">
          <div className="panchang-section-header">
            <div>
              <p className="section-kicker">{copy.locationTitle}</p>
              <h2 className="card-title">{selectedLocation}</h2>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={handleUseLocation(
                setLocation,
                setIsLocating,
                setState,
                language === 'ne' ? 'हालको स्थान' : 'Current location',
                copy.error
              )}
            >
              <LocateFixed size={16} /> {isLocating ? (language === 'ne' ? 'स्थान लिँदै...' : 'Locating...') : copy.useLocation}
            </button>
          </div>

          <div className="panchang-form-grid">
            <Field
              label={copy.city}
              value={location.city}
              onChange={(value) => setLocation((current) => ({ ...current, city: value }))}
              placeholder={language === 'ne' ? 'शहर वा क्षेत्र' : 'City or region'}
            />
            <Field
              label={copy.latitude}
              value={location.latitude}
              onChange={(value) => setLocation((current) => ({ ...current, latitude: value }))}
              placeholder="27.7172"
            />
            <Field
              label={copy.longitude}
              value={location.longitude}
              onChange={(value) => setLocation((current) => ({ ...current, longitude: value }))}
              placeholder="85.3240"
            />
            <Field
              label={copy.timezone}
              value={location.timezone}
              onChange={(value) => setLocation((current) => ({ ...current, timezone: value }))}
              placeholder={getBrowserTimezone()}
            />
          </div>

          <p className="panchang-help-text">{copy.manualHelp}</p>
          <div className="chip-row">
            <span className="tag-chip tag-chip-muted">{copy.selectedLocation}</span>
            <span className="tag-chip tag-chip-muted">{location.timezone || localInfo.timezone}</span>
          </div>
        </article>

        <article className="panchang-card panchang-dashboard visual-card">
          <div className="panchang-section-header">
            <div>
              <p className="section-kicker">{copy.resultTitle}</p>
              <h2 className="card-title">
                {state.status === 'success'
                  ? (state.result?.message || copy.configured)
                  : state.status === 'loading'
                    ? copy.loading
                    : copy.unavailable}
              </h2>
            </div>
            <div className="today-summary-pill today-summary-pill-soft">
              <MoonStar size={16} />
              <span>{state.status}</span>
            </div>
          </div>

          {state.status === 'success' && state.result ? (
            <>
              <div className="panchang-result-grid">
                {resultFields.map((field) => (
                  <div key={field.key} className="panchang-result-item">
                    <p className="panchang-result-label">{field.title}</p>
                    <p className="panchang-result-value">{field.value}</p>
                  </div>
                ))}
              </div>
              {state.result.rawSummary && <p className="panchang-summary">{state.result.rawSummary}</p>}
            </>
          ) : state.status === 'loading' ? (
            <div className="panchang-status-card">
              <p className="card-copy">{copy.loading}</p>
            </div>
          ) : (
            <div className="panchang-status-card">
              <p className="card-copy">{state.message || copy.notConfigured}</p>
            </div>
          )}
        </article>

        <article className="panchang-card panchang-dashboard visual-card">
          <div className="panchang-section-header">
            <div>
              <p className="section-kicker">{copy.sourceTitle}</p>
              <h2 className="card-title">{content.introTitle}</h2>
            </div>
          </div>
          <div className="soft-divider" />
          <p className="reader-paragraph">{content.disclaimer || copy.exactNote}</p>
          {state.result?.provider && (
            <div className="info-callout">
              <p className="page-eyebrow">{copy.provider}</p>
              <p className="reader-paragraph">{state.result.provider}</p>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="panchang-field">
      <span className="panchang-field-label">{label}</span>
      <input
        className="admin-input panchang-field-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="panchang-info-card">
      <div className="panchang-info-icon">{icon}</div>
      <div>
        <p className="panchang-result-label">{label}</p>
        <p className="panchang-result-value">{value}</p>
      </div>
    </div>
  );
}

function handleUseLocation(
  setLocation: Dispatch<SetStateAction<PanchangLocationForm>>,
  setIsLocating: Dispatch<SetStateAction<boolean>>,
  setState: Dispatch<SetStateAction<PanchangFetchState>>,
  fallbackCity: string,
  errorMessage: string
) {
  return () => {
    if (!navigator.geolocation) {
      setState({ status: 'error', result: null, message: errorMessage });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation((current) => ({
          ...current,
          city: current.city || fallbackCity,
          latitude: latitude.toFixed(4),
          longitude: longitude.toFixed(4),
          timezone: getBrowserTimezone(),
        }));
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        if (errorMessage) {
          setState({ status: 'error', result: null, message: errorMessage });
        }
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };
}

function formatField(field?: { name: string; start?: string; end?: string } | null) {
  if (!field) return '—';
  const parts = [field.name, field.start, field.end].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : '—';
}
