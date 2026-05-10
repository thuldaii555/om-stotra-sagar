import type { Category, Deity, PoojaBidhi, Stotra } from '../types';

export type Language = 'ne' | 'en';

const DEVANAGARI_RE = /[\u0900-\u097F]/;

const DEITY_NAMES_NE: Record<string, string> = {
  ganesh: 'गणेश',
  ganesha: 'गणेश',
  shiva: 'शिव',
  vishnu: 'विष्णु',
  lakshmi: 'लक्ष्मी',
  saraswati: 'सरस्वती',
  hanuman: 'हनुमान',
  durga: 'दुर्गा',
  krishna: 'कृष्ण',
  rama: 'राम',
  ram: 'राम',
  surya: 'सूर्य',
  kali: 'काली',
  kalika: 'कालिका',
  narayana: 'नारायण',
  narayan: 'नारायण',
  bhairava: 'भैरव',
  indra: 'इन्द्र',
  parvati: 'पार्वती',
  kartikeya: 'कार्तिकेय',
  radha: 'राधा',
  navagraha: 'नवग्रह',
};

const DEITY_TYPE_NE: Record<string, string> = {
  God: 'देवता',
  Goddess: 'देवी',
  Form: 'स्वरूप',
  Other: 'अन्य',
};

const CATEGORY_NAMES_NE: Record<string, string> = {
  stotra: 'स्तोत्र',
  stotram: 'स्तोत्रम्',
  kavacham: 'कवच',
  kavach: 'कवच',
  kawach: 'कवच',
  aarti: 'आरती',
  ashtakam: 'अष्टकम्',
  chalisa: 'चालीसा',
  mantra: 'मन्त्र',
  'pooja bidhi': 'पूजा विधि',
  'vrat katha': 'व्रत कथा',
  story: 'कथा',
  other: 'अन्य',
  sadastakam: 'सदाष्टकम्',
  baad: 'बाण',
  baan: 'बाण',
  prayer: 'प्रार्थना',
  vandana: 'वन्दना',
  sahasranama: 'सहस्रनाम',
};

const STOTRA_TITLES_NE: Record<string, string> = {
  'Hanuman Chalisa': 'हनुमान चालीसा',
  'Shiva Tandava Stotram': 'शिव ताण्डव स्तोत्रम्',
  'Mahalakshmi Ashtakam': 'महालक्ष्मी अष्टकम्',
  'Saraswati Vandana': 'सरस्वती वन्दना',
  'Ganesh Stotra': 'गणेश स्तोत्र',
  'Vishnu Sahasranama Opening': 'विष्णु सहस्रनाम प्रारम्भ',
  'Gayatri Mantra': 'गायत्री मन्त्र',
  'Mahamrityunjaya Mantra': 'महामृत्युञ्जय मन्त्र',
  'Om Namah Shivaya': 'ॐ नमः शिवाय',
  'Shiva Aarti': 'शिव आरती',
  'Ganesh Aarti': 'गणेश आरती',
  'Lakshmi Aarti': 'लक्ष्मी आरती',
  'Hanuman Aarti': 'हनुमान आरती',
  'Durga Aarti': 'दुर्गा आरती',
  'Krishna Ashtakam': 'कृष्ण अष्टकम्',
  'Bajrang Baan': 'बजरंग बाण',
  'Kalika Kavacham': 'कालिका कवच',
  'Durga Kavach Opening': 'दुर्गा कवच प्रारम्भ',
  'Aditya Hridayam Opening': 'आदित्यहृदयम् प्रारम्भ',
  'Ram Raksha Stotra Opening': 'रामरक्षा स्तोत्रम् प्रारम्भ',
  'Vishnu Stuti': 'विष्णु स्तुति',
  'Durga Chalisa Excerpt': 'दुर्गा चालीसा अंश',
  'Kali Stuti': 'काली स्तुति',
  'Surya Ashtakam': 'सूर्याष्टकम्',
  'Narayana Kavach Opening': 'नारायण कवच प्रारम्भ',
  'Parvati Prayer': 'पार्वती प्रार्थना',
  'Kartikeya Stuti': 'कार्तिकेय स्तुति',
  'Radha Prayer': 'राधा प्रार्थना',
};

const POOJA_TITLES_NE: Record<string, string> = {
  'Ganesh Puja': 'गणेश पूजा',
  'Shiva Puja': 'शिव पूजा',
  'Lakshmi Puja': 'लक्ष्मी पूजा',
  'Saraswati Puja': 'सरस्वती पूजा',
  'Hanuman Puja': 'हनुमान पूजा',
  'Satyanarayan Puja': 'सत्यनारायण पूजा',
  'Durga Puja': 'दुर्गा पूजा',
  'Surya Puja': 'सूर्य पूजा',
  'Krishna Puja': 'कृष्ण पूजा',
  'Rama Puja': 'राम पूजा',
  'Kali Puja': 'काली पूजा',
  'Navagraha Puja Basic Guide': 'नवग्रह पूजा आधारभूत विधि',
};

export function getLocalizedText(language: Language, nepaliValue?: string | null, englishValue?: string | null): string {
  if (language === 'ne' && nepaliValue?.trim()) return nepaliValue.trim();
  return englishValue?.trim() || nepaliValue?.trim() || '';
}

export function getLocalizedList(language: Language, nepaliValue?: string[] | null, englishValue?: string[] | null): string[] {
  if (language === 'ne' && nepaliValue?.length) return nepaliValue.filter(Boolean);
  return englishValue?.filter(Boolean) || nepaliValue?.filter(Boolean) || [];
}

export function getLocalizedDeityName(deityOrName: Deity | string | undefined, language: Language): string {
  if (!deityOrName) return '';
  if (typeof deityOrName !== 'string') {
    const mapped = DEVANAGARI_RE.test(deityOrName.sanskritName || '') ? stripHonorific(deityOrName.sanskritName || '') : '';
    return getLocalizedText(language, deityOrName.nameNe || mapped || DEITY_NAMES_NE[deityOrName.name.toLowerCase()], deityOrName.name);
  }
  return getLocalizedText(language, DEITY_NAMES_NE[deityOrName.toLowerCase()], deityOrName);
}

export function getLocalizedDeityType(deity: Deity, language: Language): string {
  return getLocalizedText(language, deity.typeNe || DEITY_TYPE_NE[deity.type || 'Other'], deity.type || 'Other');
}

export function getLocalizedCategoryName(categoryOrName: Category | string | undefined, language: Language): string {
  if (!categoryOrName) return '';
  if (typeof categoryOrName !== 'string') {
    return getLocalizedText(language, categoryOrName.nameNe || CATEGORY_NAMES_NE[categoryOrName.name.toLowerCase()], categoryOrName.name);
  }
  return getLocalizedText(language, CATEGORY_NAMES_NE[categoryOrName.toLowerCase()], categoryOrName);
}

export function getLocalizedContentTitle(item: Stotra, language: Language): string {
  return getLocalizedText(language, item.titleNe || item.alternateTitleNe || STOTRA_TITLES_NE[item.title] || item.alternateTitle, item.title);
}

export function getLocalizedAlternateTitle(item: Stotra, language: Language): string {
  return getLocalizedText(language, item.alternateTitleNe, item.alternateTitle);
}

export function getLocalizedPoojaTitle(pooja: PoojaBidhi, language: Language): string {
  return getLocalizedText(language, pooja.titleNe || POOJA_TITLES_NE[pooja.title], pooja.title);
}

export function getPoojaField(
  pooja: PoojaBidhi,
  field: 'title' | 'deity' | 'occasion' | 'overview' | 'materials' | 'steps' | 'benefits' | 'cautions' | 'source',
  language: Language
): string | string[] {
  const data = pooja as unknown as Record<string, unknown>;
  const neValue = data[`${field}Ne`];
  const enValue = data[field];

  if (Array.isArray(neValue) || Array.isArray(enValue)) {
    return getLocalizedList(language, Array.isArray(neValue) ? (neValue as string[]) : undefined, Array.isArray(enValue) ? (enValue as string[]) : undefined);
  }

  return getLocalizedText(
    language,
    typeof neValue === 'string' ? neValue : undefined,
    typeof enValue === 'string' ? enValue : undefined
  );
}

export function includesLocalizedQuery(values: Array<string | string[] | undefined | null>, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) => {
    const parts = Array.isArray(value) ? value : [value];
    return parts.some((part) => part?.toLowerCase().includes(normalized));
  });
}

function stripHonorific(value: string): string {
  return value.replace(/^श्री\s+/, '').trim();
}
