import type { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-stotra', name: 'Stotra', description: 'Classical praise hymns addressed to a deity or divine principle.' },
  { id: 'cat-kavacham', name: 'Kavacham', description: 'Protective devotional compositions and prayers.' },
  { id: 'cat-aarti', name: 'Aarti', description: 'Lamp-offering hymns sung during or at the close of worship.' },
  { id: 'cat-ashtakam', name: 'Ashtakam', description: 'Eight-verse devotional compositions.' },
  { id: 'cat-chalisa', name: 'Chalisa', description: 'Forty-verse devotional hymns for focused prayer and remembrance.' },
  { id: 'cat-mantra', name: 'Mantra', description: 'Sacred chants for repetition, meditation, or daily remembrance.' },
  { id: 'cat-pooja-bidhi', name: 'Pooja Bidhi', description: 'Practical home worship guides and ritual outlines.' },
  { id: 'cat-vrat-katha', name: 'Vrat Katha', description: 'Stories connected with vows, observances, and festival traditions.' },
  { id: 'cat-story', name: 'Story', description: 'Devotional stories and sacred narratives for family reading.' },
  { id: 'cat-other', name: 'Other', description: 'Special devotional content that does not fit the standard categories.' },
];
