import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { CalendarClock, LocateFixed, MapPin, MoonStar, SunMedium } from 'lucide-react';
import type { PanchangContent } from '../types';
import { fetchPanchang, type PanchangFetchState } from '../services/panchangService';
import { formatZonedDateTime } from '../utils/dateTime';
import { t } from '../utils/i18n';

const LOCATION_KEY = 'om-stotra-sagar-panchang-location';
const DEFAULT_LOCATION: PanchangLocationForm = {
  city: 'Kathmandu, Nepal',
  latitude: '27.7172',
  longitude: '85.3240',
  timezone: 'Asia/Kathmandu',
};

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

const getBrowserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kathmandu';

const getInitialLocation = (): PanchangLocationForm => {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_LOCATION;
  }

  try {
    const saved = JSON.parse(localStorage.getItem(LOCATION_KEY) || 'null') as Partial<PanchangLocationForm> | null;
    return {
      city: saved?.city || DEFAULT_LOCATION.city,
      latitude: saved?.latitude || DEFAULT_LOCATION.latitude,
      longitude: saved?.longitude || DEFAULT_LOCATION.longitude,
      timezone: saved?.timezone || DEFAULT_LOCATION.timezone,
    };
  } catch {
    return DEFAULT_LOCATION;
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

  const timezoneDisplay = location.timezone.trim() || DEFAULT_LOCATION.timezone;
  const selectedCity = location.city.trim() || DEFAULT_LOCATION.city;
  const selectedCityDisplay = language === 'ne' && selectedCity === 'Kathmandu, Nepal' ? 'à¤•à¤¾à¤ à¤®à¤¾à¤¡à¥Œà¤‚, à¤¨à¥‡à¤ªà¤¾à¤²' : selectedCity;
  const localInfo = useMemo(() => formatZonedDateTime(now, timezoneDisplay, selectedCity, language), [language, now, selectedCity, timezoneDisplay]);
  const dateKey = localInfo.isoDate;
  const statusLabel = state.status === 'success'
    ? (language === 'ne' ? 'à¤¸à¤«à¤²' : 'success')
    : state.status === 'loading'
      ? (language === 'ne' ? 'à¤²à¥‹à¤¡ à¤¹à¥à¤à¤¦à¥ˆà¤›' : 'loading')
      : state.status === 'notConfigured'
        ? (language === 'ne' ? 'à¤œà¤¡à¤¾à¤¨ à¤›à¥ˆà¤¨' : 'notConfigured')
        : (language === 'ne' ? 'à¤¤à¥à¤°à¥à¤Ÿà¤¿' : 'error');

  const copy = language === 'ne'
    ? {
        eyebrow: 'à¤ªà¤žà¥à¤šà¤¾à¤™à¥à¤—',
        title: t('dailyPanchang', language),
        subtitle: 'à¤¦à¤¿à¤¨, à¤¸à¤®à¤¯, à¤° à¤¸à¥à¤¥à¤¾à¤¨à¤•à¥‹ à¤†à¤§à¤¾à¤°à¤®à¤¾ à¤¦à¥ˆà¤¨à¤¿à¤• à¤¹à¤¿à¤¨à¥à¤¦à¥‚ à¤ªà¤¾à¤¤à¥à¤°à¥‹ à¤œà¤¾à¤¨à¤•à¤¾à¤°à¥€à¥¤',
        dateTitle: 'à¤®à¤¿à¤¤à¤¿ à¤° à¤¸à¤®à¤¯',
        locationTitle: 'à¤¸à¥à¤¥à¤¾à¤¨',
        resultTitle: 'à¤ªà¤žà¥à¤šà¤¾à¤™à¥à¤— à¤µà¤¿à¤µà¤°à¤£',
        sourceTitle: 'à¤¸à¥à¤°à¥‹à¤¤ à¤¸à¥à¤¥à¤¿à¤¤à¤¿',
        city: 'à¤¶à¤¹à¤°',
        latitude: 'à¤…à¤•à¥à¤·à¤¾à¤‚à¤¶',
        longitude: 'à¤¦à¥‡à¤¶à¤¾à¤¨à¥à¤¤à¤°',
        timezone: 'à¤¸à¤®à¤¯ à¤•à¥à¤·à¥‡à¤¤à¥à¤°',
        useLocation: 'à¤®à¥‡à¤°à¥‹ à¤¸à¥à¤¥à¤¾à¤¨ à¤ªà¥à¤°à¤¯à¥‹à¤— à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥',
        notConfigured: 'à¤ªà¤žà¥à¤šà¤¾à¤™à¥à¤— à¤—à¤£à¤¨à¤¾ à¤¸à¥à¤°à¥‹à¤¤ à¤…à¤à¥ˆ à¤œà¤¡à¤¾à¤¨ à¤—à¤°à¤¿à¤à¤•à¥‹ à¤›à¥ˆà¤¨à¥¤ à¤®à¤¿à¤¤à¤¿, à¤¸à¤®à¤¯ à¤° à¤¸à¥à¤¥à¤¾à¤¨ à¤¦à¥‡à¤–à¤¾à¤‡à¤à¤•à¥‹ à¤›à¥¤',
        error: 'à¤…à¤¹à¤¿à¤²à¥‡ à¤ªà¤žà¥à¤šà¤¾à¤™à¥à¤— à¤²à¥‹à¤¡ à¤—à¤°à¥à¤¨ à¤¸à¤•à¤¿à¤à¤¨à¥¤ à¤•à¥ƒà¤ªà¤¯à¤¾ à¤¸à¥à¤¥à¤¾à¤¨ à¤œà¤¾à¤à¤šà¥à¤¨à¥à¤¹à¥‹à¤¸à¥ à¤µà¤¾ à¤«à¥‡à¤°à¤¿ à¤ªà¥à¤°à¤¯à¤¾à¤¸ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤',
        loading: 'à¤ªà¤žà¥à¤šà¤¾à¤™à¥à¤— à¤²à¥‹à¤¡ à¤¹à¥à¤à¤¦à¥ˆà¤›...',
        exactNote: 'à¤ à¥à¤¯à¤¾à¤•à¥à¤•à¥ˆ à¤ªà¤žà¥à¤šà¤¾à¤™à¥à¤— à¤®à¤¾à¤¨à¤¹à¤°à¥‚ à¤¸à¥à¤¥à¤¾à¤¨, à¤¸à¤®à¤¯ à¤•à¥à¤·à¥‡à¤¤à¥à¤°, à¤° à¤—à¤£à¤¨à¤¾ à¤µà¤¿à¤§à¤¿à¤®à¤¾ à¤¨à¤¿à¤°à¥à¤­à¤° à¤¹à¥à¤¨à¥à¤›à¤¨à¥à¥¤',
        browserTime: 'à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤¸à¤®à¤¯',
        browserTimezone: 'à¤¸à¤®à¤¯ à¤•à¥à¤·à¥‡à¤¤à¥à¤°',
        gregorianDate: 'à¤®à¤¿à¤¤à¤¿',
        bikramSambat: 'à¤µà¤¿.à¤¸à¤‚. à¤®à¤¿à¤¤à¤¿',
        bikramSambatPending: 'à¤µà¤¿.à¤¸à¤‚. à¤®à¤¿à¤¤à¤¿ à¤œà¤¡à¤¾à¤¨ à¤¹à¥à¤à¤¦à¥ˆà¤›',
        selectedLocation: 'à¤šà¤¯à¤¨ à¤—à¤°à¤¿à¤à¤•à¥‹ à¤¸à¥à¤¥à¤¾à¤¨',
        manualHelp: 'à¤…à¤•à¥à¤·à¤¾à¤‚à¤¶/à¤¦à¥‡à¤¶à¤¾à¤¨à¥à¤¤à¤° à¤°à¤¾à¤–à¥‡à¤ªà¤›à¤¿ à¤ªà¤žà¥à¤šà¤¾à¤™à¥à¤— à¤¸à¥à¤°à¥‹à¤¤ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤­à¤à¤®à¤¾ à¤ªà¤°à¤¿à¤£à¤¾à¤® à¤¤à¥à¤°à¥à¤¨à¥à¤¤à¥ˆ à¤²à¥‹à¤¡ à¤¹à¥à¤¨à¥à¤›à¥¤',
        unavailable: 'à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤›à¥ˆà¤¨',
        sunrise: 'à¤¸à¥‚à¤°à¥à¤¯à¥‹à¤¦à¤¯',
        sunset: 'à¤¸à¥‚à¤°à¥à¤¯à¤¾à¤¸à¥à¤¤',
        tithi: 'à¤¤à¤¿à¤¥à¤¿',
        nakshatra: 'à¤¨à¤•à¥à¤·à¤¤à¥à¤°',
        yoga: 'à¤¯à¥‹à¤—',
        karana: 'à¤•à¤°à¤£',
        paksha: 'à¤ªà¤•à¥à¤·',
        lunarMonth: 'à¤šà¤¨à¥à¤¦à¥à¤° à¤®à¤¹à¤¿à¤¨à¤¾',
        rahuKaal: 'à¤°à¤¾à¤¹à¥à¤•à¤¾à¤²',
        configured: 'à¤¸à¥à¤°à¥‹à¤¤ à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤›',
        provider: 'à¤¸à¥‡à¤µà¤¾ à¤ªà¥à¤°à¤¦à¤¾à¤¯à¤•',
      }
    : {
        eyebrow: 'Panchang',
        title: 'Panchang',
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
        notConfigured: 'Panchang calculation source is not configured yet. Date, time, and location are shown.',
        error: 'Unable to load Panchang right now. Please check location or try again.',
        loading: 'Loading Panchang...',
        exactNote: 'Exact Panchang values depend on location, timezone, and calculation method.',
        browserTime: 'Local time',
        browserTimezone: 'Timezone',
        gregorianDate: 'Date',
        bikramSambat: 'Bikram Sambat',
        bikramSambatPending: 'Bikram Sambat coming soon',
        selectedLocation: 'Selected location',
        manualHelp: 'After entering latitude and longitude, the Panchang source will load as soon as it becomes available.',
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
              <h2 className="card-title">{localInfo.gregorianDate}</h2>
            </div>
            <div className="today-badge">
              <CalendarClock size={18} />
              <span>{copy.browserTime}</span>
            </div>
          </div>

          <div className="panchang-time-grid">
            <InfoCard icon={<CalendarClock size={16} />} label={copy.gregorianDate} value={localInfo.gregorianDate} />
            <InfoCard icon={<CalendarClock size={16} />} label={copy.bikramSambat} value={localInfo.bikramSambat || copy.bikramSambatPending} />
            <InfoCard icon={<SunMedium size={16} />} label={copy.browserTime} value={localInfo.time} />
            <InfoCard icon={<MapPin size={16} />} label={copy.browserTimezone} value={timezoneDisplay} />
          </div>
        </article>

        <article className="panchang-card panchang-dashboard visual-card">
          <div className="panchang-section-header">
            <div>
              <p className="section-kicker">{copy.locationTitle}</p>
              <h2 className="card-title">{selectedCityDisplay}</h2>
            </div>
            <button
              type="button"
              className="secondary-button"
              onClick={handleUseLocation(
                setLocation,
                setIsLocating,
                setState,
                language === 'ne' ? 'à¤¹à¤¾à¤²à¤•à¥‹ à¤¸à¥à¤¥à¤¾à¤¨' : 'Current location',
                copy.error
              )}
            >
              <LocateFixed size={16} /> {isLocating ? (language === 'ne' ? 'à¤¸à¥à¤¥à¤¾à¤¨ à¤²à¤¿à¤à¤¦à¥ˆ...' : 'Locating...') : copy.useLocation}
            </button>
          </div>

          <div className="panchang-form-grid">
            <Field
              label={copy.city}
              value={location.city}
              onChange={(value) => setLocation((current) => ({ ...current, city: value }))}
              placeholder={language === 'ne' ? 'à¤¶à¤¹à¤° à¤µà¤¾ à¤•à¥à¤·à¥‡à¤¤à¥à¤°' : 'City or region'}
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
              <span>{statusLabel}</span>
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
              <h2 className="card-title">{language === 'ne' ? t('panchangGuideTitle', language) : content.introTitle}</h2>
            </div>
          </div>
          <div className="soft-divider" />
          <p className="reader-paragraph">{language === 'ne' ? t('panchangDisclaimer', language) : (content.disclaimer || copy.exactNote)}</p>
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
  if (!field) return 'â€”';
  const parts = [field.name, field.start, field.end].filter(Boolean);
  return parts.length > 0 ? parts.join(' Â· ') : 'â€”';
}



