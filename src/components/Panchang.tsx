import { useState, useEffect, useCallback, type ChangeEvent } from 'react';
import { MapPin, RefreshCw, Sun, Moon, Star, Clock, AlertCircle, Loader2, ChevronDown } from 'lucide-react';

interface PData {
  tithi?: { name: string; end_time?: string; lord?: string };
  nakshatra?: { name: string; end_time?: string; lord?: string };
  yoga?: { name: string; end_time?: string };
  karana?: { name: string };
  vedic_weekday?: string;
  lunar_month?: string;
  sunrise?: string; sunset?: string;
  moonrise?: string; moonset?: string;
  paksha?: string; ritu?: string;
}

const CITIES = [
  { name: 'Kathmandu', lat: 27.7172, lon: 85.3240, tz: 5.75 },
  { name: 'Pokhara', lat: 28.2096, lon: 83.9856, tz: 5.75 },
  { name: 'Birgunj', lat: 27.0104, lon: 84.8777, tz: 5.75 },
  { name: 'New Delhi', lat: 28.6139, lon: 77.2090, tz: 5.5 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, tz: 5.5 },
  { name: 'Varanasi', lat: 25.3176, lon: 82.9739, tz: 5.5 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { name: 'London', lat: 51.5074, lon: -0.1278, tz: 0 },
  { name: 'New York', lat: 40.7128, lon: -74.006, tz: -5 },
  { name: 'Sydney', lat: -33.869, lon: 151.209, tz: 10 },
];

export default function PanchangPage({ language = 'en' }: { language?: string; content?: unknown }) {
  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const [data, setData] = useState<PData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cityName, setCityName] = useState('Detecting...');
  const [lat, setLat] = useState(27.7172);
  const [lon, setLon] = useState(85.3240);
  const [tz, setTz] = useState(5.75);
  const [date, setDate] = useState(todayStr);
  const [showCities, setShowCities] = useState(false);

  const fetch_ = useCallback(async (la: number, lo: number, t: number, dt: string) => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`/.netlify/functions/get-panchang?lat=${la}&lon=${lo}&tzone=${t}&date=${dt}`);
      if (!r.ok) throw new Error((await r.json()).error || 'API error');
      setData((await r.json()).panchang);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'API error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        const t2 = -(new Date().getTimezoneOffset() / 60);
        const city = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.replace(/_/g, ' ') || 'Your Location';
        setLat(p.coords.latitude); setLon(p.coords.longitude); setTz(t2); setCityName(city);
        fetch_(p.coords.latitude, p.coords.longitude, t2, date);
      },
      () => { setCityName('Kathmandu'); fetch_(27.7172, 85.3240, 5.75, date); },
      { timeout: 5000 }
    );
  }, [date, fetch_]);

  function pickCity(c: typeof CITIES[0]) {
    setLat(c.lat); setLon(c.lon); setTz(c.tz); setCityName(c.name);
    setShowCities(false); fetch_(c.lat, c.lon, c.tz, date);
  }
  function onDateChange(e: ChangeEvent<HTMLInputElement>) {
    setDate(e.target.value); fetch_(lat, lon, tz, e.target.value);
  }

  const elements = data ? [
    { icon: '', label: language === 'ne' ? 'तिथि' : 'Tithi', val: data.tithi?.name, sub: data.tithi?.end_time },
    { icon: '⭐', label: language === 'ne' ? 'नक्षत्र' : 'Nakshatra', val: data.nakshatra?.name, sub: data.nakshatra?.end_time },
    { icon: '', label: language === 'ne' ? 'योग' : 'Yoga', val: data.yoga?.name, sub: data.yoga?.end_time },
    { icon: '⚡', label: language === 'ne' ? 'करण' : 'Karana', val: data.karana?.name, sub: undefined },
    { icon: '', label: language === 'ne' ? 'वार' : 'Vara', val: data.vedic_weekday, sub: undefined },
    { icon: '☽', label: language === 'ne' ? 'पक्ष' : 'Paksha', val: data.paksha, sub: undefined },
    { icon: '', label: language === 'ne' ? 'मास' : 'Lunar Month', val: data.lunar_month, sub: undefined },
    { icon: '', label: language === 'ne' ? 'ऋतु' : 'Ritu (Season)', val: data.ritu, sub: undefined },
  ].filter(e => e.val) : [];

  const timings = data ? [
    { icon: <Sun size={18} />, label: 'Sunrise', val: data.sunrise, accent: 'var(--saffron)' },
    { icon: <Moon size={18} />, label: 'Sunset', val: data.sunset, accent: 'var(--muted)' },
    { icon: <Star size={18} />, label: 'Moonrise', val: data.moonrise, accent: 'var(--gold-bright)' },
    { icon: <Clock size={18} />, label: 'Moonset', val: data.moonset, accent: 'var(--muted-light)' },
  ].filter(t => t.val) : [];

  return (
    <main className="page-container panchang-page">
      <div className="panchang-header">
        <p className="panchang-eyebrow">पञ्चाङ्ग</p>
        <h1 className="page-title" style={{ margin: 0 }}>
          {language === 'ne' ? 'दैनिक पञ्चाङ्ग' : 'Daily Panchang'}
        </h1>
        <p className="page-subtitle">
          {language === 'ne'
            ? 'तिथि, नक्षत्र, योग, करण र मुहूर्त'
            : 'Tithi · Nakshatra · Yoga · Karana · Timings'}
        </p>
      </div>

      <div className="panchang-controls">
        <div style={{ position: 'relative' }}>
          <button className="panch-ctrl-btn" onClick={() => setShowCities(s => !s)}>
            <MapPin size={14} /> {cityName} <ChevronDown size={12} />
          </button>
          {showCities && (
            <div className="panch-city-dropdown">
              <button className="panch-city-detect" onClick={() => {
                setShowCities(false);
                navigator.geolocation?.getCurrentPosition(
                  (p) => {
                    const t2 = -(new Date().getTimezoneOffset() / 60);
                    const city = Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop()?.replace(/_/g, ' ') || 'Auto';
                    setLat(p.coords.latitude); setLon(p.coords.longitude); setTz(t2); setCityName(city);
                    fetch_(p.coords.latitude, p.coords.longitude, t2, date);
                  },
                  () => {},
                  { timeout: 5000 }
                );
              }}>
                <MapPin size={12} /> Use my current location
              </button>
              {CITIES.map(c => (
                <button key={c.name} className="panch-city-opt" onClick={() => pickCity(c)}>{c.name}</button>
              ))}
            </div>
          )}
        </div>

        <input type="date" value={date} onChange={onDateChange} className="panch-date-input" />

        <button className="panch-ctrl-btn panch-refresh" onClick={() => fetch_(lat, lon, tz, date)} aria-label="Refresh">
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
        </button>
      </div>

      {loading && (
        <div className="panch-state-center">
          <Loader2 size={32} className="spin-icon" style={{ color: 'var(--saffron)' }} />
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Loading panchang for {cityName}...</p>
        </div>
      )}

      {error && !loading && (
        <div className="panch-error-box">
          <AlertCircle size={18} />
          <div>
            <p style={{ fontWeight: 600, margin: '0 0 4px', fontSize: '14px' }}>Could not load panchang</p>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>{error}</p>
            {error.includes('PANCHANG_API_KEY') && (
              <p style={{ margin: '6px 0 0', fontSize: '12px', opacity: 0.6 }}>
                Add PANCHANG_API_KEY to Netlify env vars. Get a free key at freeastrologyapi.com
              </p>
            )}
          </div>
        </div>
      )}

      {data && !loading && (
        <>
          <section className="panch-section">
            <h2 className="panch-section-title">
              {language === 'ne' ? 'पञ्च अंग' : 'Five Elements (Pañchāṅga)'}
            </h2>
            <div className="panch-elements-grid">
              {elements.map(el => (
                <div key={el.label} className="panch-elem-card">
                  <span className="pec-icon">{el.icon}</span>
                  <span className="pec-label">{el.label}</span>
                  <span className="pec-val">{el.val}</span>
                  {el.sub && <span className="pec-sub">until {el.sub}</span>}
                </div>
              ))}
            </div>
          </section>

          {timings.length > 0 && (
            <section className="panch-section">
              <h2 className="panch-section-title">
                {language === 'ne' ? 'समय तालिका' : 'Timings'}
              </h2>
              <div className="panch-timings-grid">
                {timings.map(t => (
                  <div key={t.label} className="panch-timing-card">
                    <span style={{ color: t.accent }}>{t.icon}</span>
                    <span className="ptc-label">{t.label}</span>
                    <span className="ptc-val">{t.val}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
