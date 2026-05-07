import { DEFAULT_CONTENT } from '../data/defaultContent';
import type { Category, Deity, HinduStory, HistoryItem, PanchangContent, PanchangTerm, PoojaBidhi, Stotra } from '../types';

type ContentBundle = {
  stotras: Stotra[];
  deities: Deity[];
  categories: Category[];
  poojaBidhi: PoojaBidhi[];
  stories: HinduStory[];
  panchang: PanchangContent;
};

export type StotraInput = Omit<Stotra, 'id'> & { id?: string };
export type DeityInput = Omit<Deity, 'id'> & { id?: string };
export type PoojaBidhiInput = Omit<PoojaBidhi, 'id'> & { id?: string };
export type HinduStoryInput = Omit<HinduStory, 'id'> & { id?: string };
export type CategoryInput = Pick<Category, 'name' | 'description'> & { id?: string };
export type PanchangContentInput = Partial<PanchangContent>;

const CONTENT_KEY = 'om-stotra-sagar-content';
const FAVORITES_KEY = 'om-stotra-sagar-favorites';
const HISTORY_KEY = 'om-stotra-sagar-history';
const READER_FONT_SIZE_KEY = 'reader-font-size';
const MAX_HISTORY = 20;

const createId = (prefix: string): string => {
  const randomId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${randomId}`;
};

const cleanText = (value?: string): string => value?.trim() || '';

const cleanOptionalText = (value?: string): string | undefined => {
  const trimmed = cleanText(value);
  return trimmed || undefined;
};

const cleanTags = (tags?: string[]): string[] =>
  (tags || []).map((tag) => tag.trim()).filter(Boolean);

const normalizeName = (value: string): string => cleanText(value).toLowerCase();

const ensureArray = <T,>(value: unknown): T[] => Array.isArray(value) ? value as T[] : [];

const safeParse = <T,>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof localStorage === 'undefined') return fallback;
  const parsed = safeParse<T>(localStorage.getItem(key));
  return parsed ?? fallback;
};

const writeStorage = <T,>(key: string, value: T): T => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
  return value;
};

const normalizeStotra = (stotra: Partial<Stotra> & { id?: string }, fallbackId?: string): Stotra => ({
  id: stotra.id || fallbackId || createId('stotra'),
  title: cleanText(stotra.title),
  alternateTitle: cleanOptionalText(stotra.alternateTitle),
  deity: cleanText(stotra.deity),
  category: cleanText(stotra.category),
  content: cleanText(stotra.content),
  nepaliMeaning: cleanOptionalText(stotra.nepaliMeaning),
  wordMeaning: cleanOptionalText(stotra.wordMeaning),
  benefits: cleanOptionalText(stotra.benefits),
  process: cleanOptionalText(stotra.process),
  source: cleanOptionalText(stotra.source),
  tags: cleanTags(stotra.tags),
  language: cleanOptionalText(stotra.language),
  script: cleanOptionalText(stotra.script),
  status: stotra.status,
});

const normalizeDeity = (deity: Partial<Deity> & { id?: string }, fallbackId?: string): Deity => ({
  id: deity.id || fallbackId || createId('deity'),
  name: cleanText(deity.name),
  sanskritName: cleanOptionalText(deity.sanskritName),
  description: cleanText(deity.description),
  significance: cleanText(deity.significance),
  mantra: cleanOptionalText(deity.mantra),
  imageUrl: cleanOptionalText(deity.imageUrl),
  tags: cleanTags(deity.tags),
  theme: cleanOptionalText(deity.theme),
});

const normalizeCategory = (category: Partial<Category> & { id?: string }, fallbackId?: string): Category => ({
  id: category.id || fallbackId || createId('category'),
  name: cleanText(category.name),
  description: cleanOptionalText(category.description),
});

const normalizePoojaBidhi = (item: Partial<PoojaBidhi> & { id?: string }, fallbackId?: string): PoojaBidhi => ({
  id: item.id || fallbackId || createId('pooja'),
  title: cleanText(item.title),
  deity: cleanText(item.deity),
  occasion: cleanText(item.occasion),
  overview: cleanText(item.overview),
  materials: ensureArray<string>(item.materials).map((value) => cleanText(value)).filter(Boolean),
  steps: ensureArray<string>(item.steps).map((value) => cleanText(value)).filter(Boolean),
  benefits: ensureArray<string>(item.benefits).map((value) => cleanText(value)).filter(Boolean),
  cautions: cleanOptionalText(item.cautions),
  source: cleanOptionalText(item.source),
  tags: cleanTags(item.tags),
});

const normalizeStory = (story: Partial<HinduStory> & { id?: string }, fallbackId?: string): HinduStory => ({
  id: story.id || fallbackId || createId('story'),
  title: cleanText(story.title),
  deity: cleanOptionalText(story.deity),
  summary: cleanText(story.summary),
  story: cleanText(story.story),
  lesson: cleanText(story.lesson),
  tags: cleanTags(story.tags),
});

const normalizePanchangTerm = (term: Partial<PanchangTerm>): PanchangTerm => ({
  title: cleanText(term.title),
  text: cleanText(term.text),
});

const normalizePanchangContent = (content: Partial<PanchangContent> | undefined): PanchangContent => {
  const fallback = DEFAULT_CONTENT.panchang;
  const next = content ?? {};
  const terms = ensureArray<Partial<PanchangTerm>>(next.terms).map(normalizePanchangTerm).filter((term) => term.title && term.text);
  const dailyNotes = ensureArray<Partial<PanchangTerm>>(next.dailyNotes).map(normalizePanchangTerm).filter((term) => term.title && term.text);

  return {
    introTitle: cleanText(next.introTitle) || fallback.introTitle,
    intro: cleanText(next.intro) || fallback.intro,
    terms: terms.length > 0 ? terms : fallback.terms,
    dailyNotes: dailyNotes.length > 0 ? dailyNotes : fallback.dailyNotes,
    disclaimer: cleanText(next.disclaimer) || fallback.disclaimer,
  };
};

const normalizeBundle = (bundle: Partial<ContentBundle> | null): ContentBundle => {
  const resolved = bundle ?? {};

  return {
    stotras: ensureArray<Partial<Stotra>>(resolved.stotras).map((item, index) => normalizeStotra(item, `stotra-${index + 1}`)).filter((item) => item.title && item.deity && item.category && item.content),
    deities: ensureArray<Partial<Deity>>(resolved.deities).map((item, index) => normalizeDeity(item, `deity-${index + 1}`)).filter((item) => item.name && item.description && item.significance),
    categories: ensureArray<Partial<Category>>(resolved.categories).map((item, index) => normalizeCategory(item, `category-${index + 1}`)).filter((item) => item.name),
    poojaBidhi: ensureArray<Partial<PoojaBidhi>>(resolved.poojaBidhi).map((item, index) => normalizePoojaBidhi(item, `pooja-${index + 1}`)).filter((item) => item.title && item.deity && item.occasion && item.overview),
    stories: ensureArray<Partial<HinduStory>>(resolved.stories).map((item, index) => normalizeStory(item, `story-${index + 1}`)).filter((item) => item.title && item.story && item.lesson),
    panchang: normalizePanchangContent(resolved.panchang),
  };
};

const readBundle = (): ContentBundle => {
  const stored = readStorage<Partial<ContentBundle> | null>(CONTENT_KEY, null);

  if (!stored) {
    return normalizeBundle(DEFAULT_CONTENT);
  }

  return normalizeBundle(stored);
};

const persistBundle = (bundle: ContentBundle): ContentBundle => writeStorage(CONTENT_KEY, bundle);

const updateBundle = (updater: (bundle: ContentBundle) => ContentBundle): ContentBundle => persistBundle(updater(readBundle()));

const replaceItem = <T extends { id: string }>(items: T[], nextItem: T): T[] => {
  const index = items.findIndex((item) => item.id === nextItem.id);
  if (index === -1) return [...items, nextItem];
  const copy = [...items];
  copy[index] = nextItem;
  return copy;
};

const removeItem = <T extends { id: string }>(items: T[], id: string): T[] => items.filter((item) => item.id !== id);

const upsertByCaseInsensitiveName = <T extends { id: string; name: string }>(items: T[], nextItem: T): { items: T[]; savedItem: T } => {
  const index = items.findIndex((item) => normalizeName(item.name) === normalizeName(nextItem.name));
  if (index === -1) {
    return { items: [...items, nextItem], savedItem: nextItem };
  }
  const savedItem = { ...items[index], ...nextItem, id: items[index].id };
  const copy = [...items];
  copy[index] = savedItem;
  return { items: copy, savedItem };
};

export function getContentBundle(): ContentBundle {
  return readBundle();
}

export function getStotras(): Stotra[] {
  return readBundle().stotras;
}

export function getCategories(): Category[] {
  return readBundle().categories;
}

export function getDeities(): Deity[] {
  return readBundle().deities;
}

export function getStories(): HinduStory[] {
  return readBundle().stories;
}

export function getPoojaBidhi(): PoojaBidhi[] {
  return readBundle().poojaBidhi;
}

export function getPanchangContent(): PanchangContent {
  return readBundle().panchang;
}

export function saveStotra(input: StotraInput): Stotra {
  const next = normalizeStotra(input);
  updateBundle((bundle) => ({
    ...bundle,
    stotras: replaceItem(bundle.stotras, next),
  }));
  return next;
}

export function updateStotra(id: string, input: StotraInput): Stotra {
  const next = normalizeStotra({ ...input, id }, id);
  updateBundle((bundle) => ({
    ...bundle,
    stotras: replaceItem(bundle.stotras, next),
  }));
  return next;
}

export function deleteStotra(id: string): void {
  updateBundle((bundle) => ({
    ...bundle,
    stotras: removeItem(bundle.stotras, id),
  }));
}

export function saveCategory(input: CategoryInput): Category {
  const next = normalizeCategory(input);
  let saved = next;
  updateBundle((bundle) => {
    const result = upsertByCaseInsensitiveName(bundle.categories, next);
    saved = result.savedItem;
    return {
      ...bundle,
      categories: result.items,
    };
  });
  return saved;
}

export function updateCategory(id: string, input: CategoryInput): Category {
  const next = normalizeCategory({ ...input, id }, id);
  updateBundle((bundle) => ({
    ...bundle,
    categories: replaceItem(bundle.categories, next),
  }));
  return next;
}

export function deleteCategory(id: string): void {
  updateBundle((bundle) => ({
    ...bundle,
    categories: removeItem(bundle.categories, id),
  }));
}

export function saveDeity(input: DeityInput): Deity {
  const next = normalizeDeity(input);
  let saved = next;
  updateBundle((bundle) => {
    const result = upsertByCaseInsensitiveName(bundle.deities, next);
    saved = result.savedItem;
    return {
      ...bundle,
      deities: result.items,
    };
  });
  return saved;
}

export function updateDeity(id: string, input: DeityInput): Deity {
  const next = normalizeDeity({ ...input, id }, id);
  updateBundle((bundle) => ({
    ...bundle,
    deities: replaceItem(bundle.deities, next),
  }));
  return next;
}

export function deleteDeity(id: string): void {
  updateBundle((bundle) => ({
    ...bundle,
    deities: removeItem(bundle.deities, id),
  }));
}

export function savePoojaBidhi(input: PoojaBidhiInput): PoojaBidhi {
  const next = normalizePoojaBidhi(input);
  updateBundle((bundle) => ({
    ...bundle,
    poojaBidhi: replaceItem(bundle.poojaBidhi, next),
  }));
  return next;
}

export function updatePoojaBidhi(id: string, input: PoojaBidhiInput): PoojaBidhi {
  const next = normalizePoojaBidhi({ ...input, id }, id);
  updateBundle((bundle) => ({
    ...bundle,
    poojaBidhi: replaceItem(bundle.poojaBidhi, next),
  }));
  return next;
}

export function deletePoojaBidhi(id: string): void {
  updateBundle((bundle) => ({
    ...bundle,
    poojaBidhi: removeItem(bundle.poojaBidhi, id),
  }));
}

export function saveStory(input: HinduStoryInput): HinduStory {
  const next = normalizeStory(input);
  updateBundle((bundle) => ({
    ...bundle,
    stories: replaceItem(bundle.stories, next),
  }));
  return next;
}

export function updateStory(id: string, input: HinduStoryInput): HinduStory {
  const next = normalizeStory({ ...input, id }, id);
  updateBundle((bundle) => ({
    ...bundle,
    stories: replaceItem(bundle.stories, next),
  }));
  return next;
}

export function deleteStory(id: string): void {
  updateBundle((bundle) => ({
    ...bundle,
    stories: removeItem(bundle.stories, id),
  }));
}

export function savePanchangContent(input: PanchangContentInput): PanchangContent {
  const next = normalizePanchangContent(input);
  updateBundle((bundle) => ({
    ...bundle,
    panchang: next,
  }));
  return next;
}

export function exportAllContent(): string {
  return JSON.stringify(readBundle(), null, 2);
}

export function importAllContent(json: string): ContentBundle {
  const parsed = JSON.parse(json) as Partial<ContentBundle>;
  const next = normalizeBundle(parsed);
  persistBundle(next);
  return next;
}

export function resetToDefaultContent(): ContentBundle {
  const next = normalizeBundle(DEFAULT_CONTENT);
  persistBundle(next);
  return next;
}

export function getFavoriteIds(): string[] {
  return readStorage<string[]>(FAVORITES_KEY, []);
}

export function addFavorite(stotraId: string): string[] {
  const favorites = getFavoriteIds();
  const next = favorites.includes(stotraId) ? favorites : [...favorites, stotraId];
  return writeStorage(FAVORITES_KEY, next);
}

export function removeFavorite(stotraId: string): string[] {
  const next = getFavoriteIds().filter((favoriteId) => favoriteId !== stotraId);
  return writeStorage(FAVORITES_KEY, next);
}

export function toggleFavorite(stotraId: string): string[] {
  return getFavoriteIds().includes(stotraId) ? removeFavorite(stotraId) : addFavorite(stotraId);
}

export function clearFavorites(): void {
  writeStorage(FAVORITES_KEY, []);
}

export function getHistory(): HistoryItem[] {
  return readStorage<HistoryItem[]>(HISTORY_KEY, []);
}

export function addHistory(stotra: Pick<Stotra, 'id' | 'title'>): HistoryItem[] {
  const history = getHistory();
  const nextItem: HistoryItem = {
    id: createId('history'),
    stotraId: stotra.id,
    stotraTitle: stotra.title,
    visitedAt: new Date().toISOString(),
  };
  const next = [nextItem, ...history.filter((item) => item.stotraId !== stotra.id)].slice(0, MAX_HISTORY);
  return writeStorage(HISTORY_KEY, next);
}

export function clearHistory(): void {
  writeStorage(HISTORY_KEY, []);
}

export function getReaderFontSize(): 'small' | 'medium' | 'large' {
  const saved = readStorage<string>(READER_FONT_SIZE_KEY, 'medium');
  return saved === 'small' || saved === 'large' ? saved : 'medium';
}

export function setReaderFontSize(size: 'small' | 'medium' | 'large'): void {
  writeStorage(READER_FONT_SIZE_KEY, size);
}

export function createUniqueId(prefix: string): string {
  return createId(prefix);
}
