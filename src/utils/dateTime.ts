export type Language = 'ne' | 'en';

export interface ZonedDateTimeInfo {
  gregorianDate: string;
  time: string;
  timezone: string;
  city: string;
  isoDate: string;
  bikramSambat: string | null;
}

const NEPALI_DIGITS: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
};

const BS_MONTHS = {
  en: ['Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'],
  ne: ['बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'आश्विन', 'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फाल्गुन', 'चैत'],
} as const;

const toNepaliNumber = (value: number | string): string => String(value).replace(/\d/g, (digit) => NEPALI_DIGITS[digit] || digit);

const getZonedParts = (date: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type: string) => parts.find((part) => part.type === type)?.value || '';
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
  };
};

export function getZonedIsoDate(date: Date, timezone: string): string {
  const { year, month, day } = getZonedParts(date, timezone);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatZonedDateTime(date: Date, timezone: string, city: string, language: Language): ZonedDateTimeInfo {
  const locale = language === 'ne' ? 'ne-NP' : 'en-US';
  const isoDate = getZonedIsoDate(date, timezone);

  return {
    gregorianDate: new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date),
    time: new Intl.DateTimeFormat(locale, {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: language !== 'ne',
    }).format(date),
    timezone,
    city,
    isoDate,
    bikramSambat: formatBikramSambat(isoDate, language),
  };
}

export function formatBikramSambat(isoDate: string, language: Language): string | null {
  // Verified for the active 2083 Baisakh window: 2083-01-01 BS = 2026-04-14 AD, Baisakh has 31 days.
  const start = Date.UTC(2026, 3, 14);
  const end = Date.UTC(2026, 4, 14);
  const [year, month, day] = isoDate.split('-').map(Number);
  const current = Date.UTC(year, month - 1, day);

  if (current < start || current > end) return null;

  const bsDay = Math.floor((current - start) / 86400000) + 1;
  const bsYear = 2083;
  const bsMonth = BS_MONTHS[language][0];

  return language === 'ne'
    ? `वि.सं. ${toNepaliNumber(bsYear)} ${bsMonth} ${toNepaliNumber(bsDay)}`
    : `B.S. ${bsYear} ${bsMonth} ${bsDay}`;
}
