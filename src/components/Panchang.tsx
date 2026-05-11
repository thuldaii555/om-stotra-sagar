import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import { AlertCircle, CalendarDays, ChevronDown, Clock, Loader2, LocateFixed, MapPin, RefreshCw, Sparkles, Sun } from 'lucide-react';
import type { Deity, PanchangContent, PanchangField, PanchangResult, PoojaBidhi, Stotra } from '../types';
import {
  DEFAULT_PANCHANG_LOCATION,
  fetchPanchang,
  getTodayIsoDate,
  readSavedPanchangLocation,
  savePanchangLocation,
  type SavedPanchangLocation,
} from '../services/panchangService';
import { getDailyRecommendations } from '../utils/dailyRecommendations';
import { getLocalizedContentTitle, getLocalizedDeityName, getLocalizedPoojaTitle } from '../utils/localization';

interface PanchangPageProps {
  content?: PanchangContent;
  language: 'ne' | 'en';
  stotras?: Stotra[];
  deities?: Deity[];
  poojaBidhi?: PoojaBidhi[];
  onOpenStotra?: (stotra: Stotra) => void;
  onOpenPooja?: (pooja: PoojaBidhi) => void;
  onOpenDeity?: (deity: string) => void;
}

const CITIES: SavedPanchangLocation[] = [
  DEFAULT_PANCHANG_LOCATION,
  { city: 'Pokhara, Nepal', lat: 28.2096, lng: 83.9856, timezone: 'Asia/Kathmandu' },
  { city: 'Birgunj, Nepal', lat: 27.0104, lng: 84.8777, timezone: 'Asia/Kathmandu' },
  { city: 'New Delhi, India', lat: 28.6139, lng: 77.2090, timezone: 'Asia/Kolkata' },
  { city: 'Mumbai, India', lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata' },
  { city: 'Varanasi, India', lat: 25.3176, lng: 82.9739, timezone: 'Asia/Kolkata' },
  { city: 'Kolkata, India', lat: 22.5726, lng: 88.3639, timezone: 'Asia/Kolkata' },
  { city: 'London, UK', lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  { city: 'New York, USA', lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
  { city: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
];

export default function PanchangPage({
  language,
  stotras = [],
  deities = [],
  poojaBidhi = [],
  onOpenStotra,
  onOpenPooja,
  onOpenDeity,
}: PanchangPageProps) {
  const [location, setLocation] = useState<SavedPanchangLocation>(() => readSavedPanchangLocation());
  const [date, setDate] = useState(getTodayIsoDate);
  const [data, setData] = useState<PanchangResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [showCities, setShowCities] = useState(false);
  const [now, setNow] = useState(() => new Date());

  const copy = language === 'ne'
    ? {
        eyebrow: 'पञ्चाङ्ग',
        title: 'दैनिक पञ्चाङ्ग',
        subtitle: 'तिथि, नक्षत्र, योग, करण, समय र आजको साधना केन्द्रित जानकारी।',
        currentLocation: 'मेरो हालको स्थान प्रयोग गर्नुहोस्',
        refresh: 'ताजा गर्नुहोस्',
        locationDenied: 'स्थान अनुमति अस्वीकार गरियो। कृपया स्थान हातैले छान्नुहोस्।',
        unavailable: 'उपलब्ध छैन',
        loading: 'पञ्चाङ्ग लोड हुँदैछ...',
        failed: 'पञ्चाङ्ग विवरण अहिले उपलब्ध छैन।',
        overview: 'आजको सारांश',
        values: 'पञ्चाङ्ग मानहरू',
        timings: 'महत्वपूर्ण समय',
        focus: 'आजको आध्यात्मिक केन्द्र',
        festivals: 'पर्व / विशेष नोट',
        noFestival: 'आजका लागि कुनै विशेष अवसर सूचीबद्ध छैन।',
        recommended: 'आजका सिफारिस गरिएका पाठ',
        presiding: 'आजका देवता',
        weekday: 'वार',
        date: 'मिति',
        location: 'स्थान',
        timezone: 'समय क्षेत्र',
        time: 'हालको समय',
        sunrise: 'सूर्योदय',
        sunset: 'सूर्यास्त',
        tithi: 'तिथि',
        nakshatra: 'नक्षत्र',
        yoga: 'योग',
        karana: 'करण',
        paksha: 'पक्ष',
        lunarMonth: 'चन्द्र मास',
        rahu: 'राहुकाल',
        abhijit: 'अभिजित मुहूर्त',
        gulika: 'गुलिक काल',
        yamaganda: 'यमगण्ड',
      }
    : {
        eyebrow: 'Panchang',
        title: 'Daily Panchang',
        subtitle: 'Tithi, nakshatra, yoga, karana, timings, and today’s spiritual focus.',
        currentLocation: 'Use my current location',
        refresh: 'Refresh',
        locationDenied: 'Location permission was denied. You can choose a location manually.',
        unavailable: 'Not available',
        loading: 'Loading Panchang...',
        failed: 'Panchang details are temporarily unavailable.',
        overview: 'Today Overview',
        values: 'Panchang Values',
        timings: 'Important Timings',
        focus: 'Today’s Spiritual Focus',
        festivals: 'Festivals / Special Notes',
        noFestival: 'No special occasion listed.',
        recommended: 'Today’s Recommended Prayers',
        presiding: 'Today’s Presiding Deities',
        weekday: 'Weekday',
        date: 'Date',
        location: 'Location',
        timezone: 'Timezone',
        time: 'Current Time',
        sunrise: 'Sunrise',
        sunset: 'Sunset',
        tithi: 'Tithi',
        nakshatra: 'Nakshatra',
        yoga: 'Yoga',
        karana: 'Karana',
        paksha: 'Paksha',
        lunarMonth: 'Lunar Month',
        rahu: 'Rahu Kaal',
        abhijit: 'Abhijit Muhurat',
        gulika: 'Gulika Kaal',
        yamaganda: 'Yamaganda',
      };

  const load = async (nextLocation = location, nextDate = date) => {
    setLoading(true);
    setError('');
    const result = await fetchPanchang({
      date: nextDate,
      lat: nextLocation.lat,
      lng: nextLocation.lng,
      timezone: nextLocation.timezone,
      language,
    });
    setData(result.result);
    setError(result.status === 'success' ? '' : result.message || copy.failed);
    setLoading(false);
  };

  useEffect(() => {
    load(readSavedPanchangLocation(), date);
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
    // Initial load only; explicit controls refresh after changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const localTime = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(language === 'ne' ? 'ne-NP' : 'en-US', {
        timeZone: location.timezone,
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(now);
    } catch {
      return now.toLocaleString();
    }
  }, [language, location.timezone, now]);

  const recommendations = useMemo(() => getDailyRecommendations({
    weekday: data?.weekday?.name,
    tithi: data?.tithi?.name,
    nakshatra: data?.nakshatra?.name,
    festivals: [...(data?.festivals || []), ...(data?.specialOccasions || [])],
    stotras,
    deities,
    poojaBidhi,
  }), [data, deities, poojaBidhi, stotras]);

  function selectLocation(next: SavedPanchangLocation) {
    setLocation(next);
    savePanchangLocation(next);
    setShowCities(false);
    setLocationMessage('');
    load(next, date);
  }

  function useCurrentLocation() {
    setShowCities(false);
    setLocationMessage('');
    if (!navigator.geolocation) {
      setLocationMessage(copy.locationDenied);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          city: language === 'ne' ? 'हालको स्थान' : 'Current location',
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_PANCHANG_LOCATION.timezone,
        };
        setLocation(next);
        savePanchangLocation(next);
        load(next, date);
      },
      () => setLocationMessage(copy.locationDenied),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  function onDateChange(event: ChangeEvent<HTMLInputElement>) {
    const nextDate = event.target.value;
    setDate(nextDate);
    load(location, nextDate);
  }

  const overview = [
    { label: copy.weekday, value: data?.weekday?.name || weekdayName(date, language) },
    { label: copy.date, value: date },
    { label: copy.location, value: location.city },
    { label: copy.timezone, value: location.timezone },
    { label: copy.time, value: localTime },
    { label: copy.sunrise, value: formatField(data?.sunrise, copy.unavailable) },
    { label: copy.sunset, value: formatField(data?.sunset, copy.unavailable) },
  ];
  const values = [
    { label: copy.tithi, value: formatField(data?.tithi, copy.unavailable) },
    { label: copy.nakshatra, value: formatField(data?.nakshatra, copy.unavailable) },
    { label: copy.yoga, value: formatField(data?.yoga, copy.unavailable) },
    { label: copy.karana, value: formatField(data?.karana, copy.unavailable) },
    { label: copy.paksha, value: formatField(data?.paksha, copy.unavailable) },
    { label: copy.lunarMonth, value: formatField(data?.lunarMonth, copy.unavailable) },
  ];
  const timings = [
    { label: copy.rahu, value: formatField(data?.rahuKaal, copy.unavailable) },
    { label: copy.abhijit, value: formatField(data?.abhijitMuhurat, copy.unavailable) },
    { label: copy.gulika, value: formatField(data?.gulikaKaal, copy.unavailable) },
    { label: copy.yamaganda, value: formatField(data?.yamaganda, copy.unavailable) },
  ];
  const festivals = [...(data?.festivals || []), ...(data?.specialOccasions || [])];

  return (
    <main className="page-container panchang-page panchang-dashboard-page">
      <section className="panchang-header panchang-dashboard-header">
        <p className="panchang-eyebrow">{copy.eyebrow}</p>
        <h1 className="page-title">{copy.title}</h1>
        <p className="page-subtitle">{copy.subtitle}</p>
      </section>

      <section className="panchang-controls panchang-control-panel">
        <div className="panch-location-control">
          <button className="panch-ctrl-btn" onClick={() => setShowCities(current => !current)}>
            <MapPin size={14} /> {location.city} <ChevronDown size={12} />
          </button>
          {showCities && (
            <div className="panch-city-dropdown">
              <button className="panch-city-detect" onClick={useCurrentLocation}>
                <LocateFixed size={12} /> {copy.currentLocation}
              </button>
              {CITIES.map(city => (
                <button key={city.city} className="panch-city-opt" onClick={() => selectLocation(city)}>
                  {city.city}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="panch-ctrl-btn" onClick={useCurrentLocation}>
          <LocateFixed size={14} /> {copy.currentLocation}
        </button>
        <input type="date" value={date} onChange={onDateChange} className="panch-date-input" />
        <button className="panch-ctrl-btn panch-refresh" onClick={() => load()} aria-label={copy.refresh}>
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} /> {copy.refresh}
        </button>
      </section>

      {locationMessage && <div className="panch-info-strip"><AlertCircle size={15} /> {locationMessage}</div>}
      {loading && (
        <div className="panch-state-center">
          <Loader2 size={30} className="spin-icon" />
          <p>{copy.loading}</p>
        </div>
      )}
      {error && !loading && (
        <div className="panch-error-box">
          <AlertCircle size={18} />
          <div>
            <p className="panch-error-title">{copy.failed}</p>
            <p className="panch-error-text">{error}</p>
          </div>
        </div>
      )}

      <PanchangSection title={copy.overview} items={overview} icon={<CalendarDays size={18} />} />
      <PanchangSection title={copy.values} items={values} />
      <PanchangSection title={copy.timings} items={timings} icon={<Clock size={18} />} />

      <section className="panch-section panch-focus-section">
        <h2 className="panch-section-title"><Sparkles size={17} /> {copy.focus}</h2>
        <div className="panch-focus-grid">
          <div className="panch-focus-card">
            <p className="pec-label">{copy.presiding}</p>
            <div className="panch-chip-list">
              {recommendations.deities.length > 0 ? recommendations.deities.map(deity => (
                <button key={deity.id} className="panch-focus-chip" onClick={() => onOpenDeity?.(deity.name)}>
                  {getLocalizedDeityName(deity, language)}
                </button>
              )) : recommendations.deityNames.map(name => <span key={name} className="panch-focus-chip">{name}</span>)}
            </div>
            <p className="panch-focus-note">{language === 'ne' ? 'वार स्वामी' : 'Weekday lord'}: {data?.weekdayLord || recommendations.weekdayLord}</p>
          </div>
          <div className="panch-focus-card">
            <p className="pec-label">{copy.recommended}</p>
            <div className="panch-rec-list">
              {recommendations.stotras.length > 0 ? recommendations.stotras.map(stotra => (
                <button key={stotra.id} className="panch-rec-item" onClick={() => onOpenStotra?.(stotra)}>
                  <Sun size={14} />
                  <span>{getLocalizedContentTitle(stotra, language)}</span>
                </button>
              )) : <p className="panch-muted">{copy.unavailable}</p>}
              {recommendations.pooja.map(pooja => (
                <button key={pooja.id} className="panch-rec-item" onClick={() => onOpenPooja?.(pooja)}>
                  <Sparkles size={14} />
                  <span>{getLocalizedPoojaTitle(pooja, language)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="panch-section">
        <h2 className="panch-section-title">{copy.festivals}</h2>
        {festivals.length > 0 ? (
          <div className="panch-chip-list">{festivals.map(item => <span key={item} className="panch-focus-chip">{item}</span>)}</div>
        ) : (
          <p className="panch-muted">{copy.noFestival}</p>
        )}
      </section>
    </main>
  );
}

function PanchangSection({ title, items, icon }: { title: string; items: Array<{ label: string; value: string }>; icon?: ReactNode }) {
  return (
    <section className="panch-section">
      <h2 className="panch-section-title">{icon}{title}</h2>
      <div className="panch-elements-grid">
        {items.map(item => (
          <div key={item.label} className="panch-elem-card">
            <span className="pec-label">{item.label}</span>
            <span className="pec-val">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatField(field: PanchangField | null | undefined, fallback: string): string {
  if (!field?.name) return fallback;
  const tail = field.endTime || field.end || field.start;
  return tail ? `${field.name} · ${tail}` : field.name;
}

function weekdayName(date: string, language: 'ne' | 'en'): string {
  return new Intl.DateTimeFormat(language === 'ne' ? 'ne-NP' : 'en-US', { weekday: 'long' }).format(new Date(`${date}T12:00:00`));
}
