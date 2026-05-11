import type { Deity, PoojaBidhi, Stotra } from '../types';

export interface DailyRecommendationInput {
  weekday?: string;
  tithi?: string;
  nakshatra?: string;
  festivals?: string[];
  stotras: Stotra[];
  deities: Deity[];
  poojaBidhi?: PoojaBidhi[];
}

export interface DailyRecommendations {
  weekday: string;
  weekdayLord: string;
  deityNames: string[];
  deities: Deity[];
  stotras: Stotra[];
  pooja: PoojaBidhi[];
}

const WEEKDAY_RULES: Record<string, { lord: string; deities: string[]; titles: string[] }> = {
  sunday: {
    lord: 'Surya',
    deities: ['Surya', 'Vishnu'],
    titles: ['Surya Mantra', 'Aditya Hridayam', 'Aditya Hridayam Opening', 'Surya Ashtakam', 'Gayatri Mantra'],
  },
  monday: {
    lord: 'Chandra',
    deities: ['Shiva', 'Chandra'],
    titles: ['Om Namah Shivaya', 'Shiva Tandava Stotram', 'Mahamrityunjaya Mantra', 'Shiva Aarti'],
  },
  tuesday: {
    lord: 'Mangala',
    deities: ['Hanuman', 'Ganesh', 'Durga'],
    titles: ['Hanuman Chalisa', 'Bajrang Baan', 'Ganesh Stotra', 'Hanuman Aarti', 'Durga Aarti'],
  },
  wednesday: {
    lord: 'Budha',
    deities: ['Ganesh', 'Vishnu', 'Saraswati'],
    titles: ['Ganesh Stotra', 'Vishnu Sahasranama', 'Vishnu Sahasranama Opening', 'Saraswati Vandana', 'Saraswati Aarti'],
  },
  thursday: {
    lord: 'Brihaspati',
    deities: ['Vishnu', 'Narayana', 'Guru', 'Brihaspati'],
    titles: ['Vishnu Sahasranama', 'Vishnu Sahasranama Opening', 'Narayan Prayers', 'Vishnu Stuti', 'Om Jai Jagdish Hare'],
  },
  friday: {
    lord: 'Shukra',
    deities: ['Lakshmi', 'Durga', 'Santoshi'],
    titles: ['Lakshmi Aarti', 'Mahalakshmi Ashtakam', 'Durga Aarti'],
  },
  saturday: {
    lord: 'Shani',
    deities: ['Hanuman', 'Shani', 'Shiva'],
    titles: ['Hanuman Chalisa', 'Bajrang Baan', 'Mahamrityunjaya Mantra', 'Hanuman Aarti', 'Om Namah Shivaya'],
  },
};

export function getDailyRecommendations(input: DailyRecommendationInput): DailyRecommendations {
  const weekday = normalizeWeekday(input.weekday) || normalizeWeekday(new Date().toLocaleDateString('en-US', { weekday: 'long' })) || 'monday';
  const rule = WEEKDAY_RULES[weekday] || WEEKDAY_RULES.monday;
  const deityNames = rule.deities;
  const deityMatches = deityNames
    .map(name => findDeity(input.deities, name))
    .filter((deity): deity is Deity => Boolean(deity));
  const stotraMatches = uniqueById([
    ...rule.titles.map(title => findStotra(input.stotras, title)).filter((item): item is Stotra => Boolean(item)),
    ...input.stotras.filter(stotra => deityNames.some(name => includesTerm(stotra.deity, name) || stotra.tags?.some(tag => includesTerm(tag, name)))).slice(0, 5),
  ]).slice(0, 5);
  const poojaMatches = uniqueById((input.poojaBidhi || [])
    .filter(pooja => deityNames.some(name => includesTerm(pooja.deity, name) || includesTerm(pooja.title, name)))
    .slice(0, 3));

  return {
    weekday,
    weekdayLord: rule.lord,
    deityNames,
    deities: deityMatches,
    stotras: stotraMatches,
    pooja: poojaMatches,
  };
}

function normalizeWeekday(value?: string): string {
  const text = (value || '').toLowerCase();
  return Object.keys(WEEKDAY_RULES).find(day => text.includes(day)) || '';
}

function findDeity(deities: Deity[], name: string): Deity | undefined {
  return deities.find(deity => includesTerm(deity.name, name) || includesTerm(deity.nameNe, name) || deity.tags?.some(tag => includesTerm(tag, name)));
}

function findStotra(stotras: Stotra[], title: string): Stotra | undefined {
  return stotras.find(stotra => includesTerm(stotra.title, title) || includesTerm(stotra.alternateTitle, title) || stotra.tags?.some(tag => includesTerm(tag, title)));
}

function includesTerm(value: string | undefined, term: string): boolean {
  return (value || '').toLowerCase().includes(term.toLowerCase());
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
