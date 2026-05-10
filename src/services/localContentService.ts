import { DEFAULT_CONTENT } from '../data/defaultContent';
import type { Category, ContentBundle, Deity, HinduStory, HistoryItem, PanchangContent, PanchangTerm, PoojaBidhi, Stotra } from '../types';

export type StotraInput = Omit<Stotra, 'id'> & { id?: string };
export type DeityInput = Omit<Deity, 'id'> & { id?: string };
export type PoojaBidhiInput = Omit<PoojaBidhi, 'id'> & { id?: string };
export type HinduStoryInput = Omit<HinduStory, 'id'> & { id?: string };
export type CategoryInput = Pick<Category, 'name' | 'nameNe' | 'description' | 'descriptionNe'> & { id?: string };
export type PanchangContentInput = Partial<PanchangContent>;

const CONTENT_KEY = 'om-stotra-sagar-content';
const CONTENT_META_KEY = 'om-stotra-sagar-content-meta';
const FAVORITES_KEY = 'om-stotra-sagar-favorites';
const HISTORY_KEY = 'om-stotra-sagar-history';
const READER_FONT_SIZE_KEY = 'reader-font-size';
const MAX_HISTORY = 20;

type ContentSource = 'local' | 'remote';

interface ContentMetadata {
  source: ContentSource;
  updatedAt: string;
  lastPublishedAt?: string;
  sourceVersion?: string;
}

const createId = (prefix: string): string => {
  const randomId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${randomId}`;
};

const cleanText = (value?: string): string => value?.trim() || '';
const cleanMultilineText = (value?: string): string => value?.replace(/\r\n?/g, '\n') || '';
const cleanDataUrl = (value?: string): string | undefined => {
  const text = cleanText(value);
  return /^data:image\/(png|jpe?g|webp);base64,/i.test(text) ? text : undefined;
};
const clampNumber = (value: unknown, fallback: number, min: number, max: number): number => {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, numeric));
};

const cleanOptionalText = (value?: string): string | undefined => {
  const trimmed = cleanText(value);
  return trimmed || undefined;
};

const cleanOptionalMultilineText = (value?: string): string | undefined => {
  const text = cleanMultilineText(value);
  return text.trim() ? text : undefined;
};

const cleanTags = (tags?: string[]): string[] =>
  (tags || []).map((tag) => tag.trim()).filter(Boolean);

export const normalizeContentName = (value: string): string => cleanText(value).toLowerCase();
const normalizeCategoryName = (value?: string): string => {
  const category = cleanText(value);
  const lower = category.toLowerCase();
  if (lower === 'stotram' || lower === 'stotra') return 'Stotra';
  if (lower === 'kavach' || lower === 'kavacham') return 'Kavacham';
  if (lower === 'pooja vidhi') return 'Pooja Bidhi';
  if (lower === 'katha') return 'Story';
  if (lower === 'prayer' || lower === 'vandana' || lower === 'sahasranama') return 'Other';
  if (['chalisa', 'aarti', 'ashtakam', 'mantra', 'vrat katha', 'story', 'other'].includes(lower)) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
  return category || 'Other';
};

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

export const normalizeStotraInput = (stotra: Partial<Stotra> & { id?: string }, fallbackId?: string): Stotra => ({
  id: stotra.id || fallbackId || createId('stotra'),
  title: cleanText(stotra.title),
  titleNe: cleanOptionalText(stotra.titleNe),
  alternateTitle: cleanOptionalText(stotra.alternateTitle),
  alternateTitleNe: cleanOptionalText(stotra.alternateTitleNe),
  deity: cleanText(stotra.deity),
  deityNe: cleanOptionalText(stotra.deityNe),
  category: normalizeCategoryName(stotra.category),
  categoryNe: cleanOptionalText(stotra.categoryNe),
  imageUrl: cleanOptionalText(stotra.imageUrl),
  content: cleanMultilineText(stotra.content),
  meaning: cleanOptionalMultilineText(stotra.meaning || stotra.nepaliMeaning),
  meaningNe: cleanOptionalMultilineText(stotra.meaningNe),
  nepaliMeaning: cleanOptionalMultilineText(stotra.meaning || stotra.nepaliMeaning),
  wordMeaning: cleanOptionalMultilineText(stotra.wordMeaning),
  wordMeaningNe: cleanOptionalMultilineText(stotra.wordMeaningNe),
  benefits: cleanOptionalMultilineText(stotra.benefits),
  benefitsNe: cleanOptionalMultilineText(stotra.benefitsNe),
  process: cleanOptionalMultilineText(stotra.process),
  processNe: cleanOptionalMultilineText(stotra.processNe),
  source: cleanOptionalText(stotra.source),
  sourceNe: cleanOptionalText(stotra.sourceNe),
  sourcePdfName: cleanOptionalText(stotra.sourcePdfName),
  sourcePdfDataUrl: cleanOptionalText(stotra.sourcePdfDataUrl),
  sourcePdfUrl: cleanOptionalText(stotra.sourcePdfUrl),
  tags: cleanTags(stotra.tags),
  language: cleanOptionalText(stotra.language),
  script: cleanOptionalText(stotra.script),
  status: stotra.status,
});

export const normalizeDeityInput = (deity: Partial<Deity> & { id?: string }, fallbackId?: string): Deity => ({
  id: deity.id || fallbackId || createId('deity'),
  name: cleanText(deity.name),
  nameNe: cleanOptionalText(deity.nameNe),
  type: deity.type === 'God' || deity.type === 'Goddess' || deity.type === 'Form' || deity.type === 'Other' ? deity.type : 'Other',
  typeNe: cleanOptionalText(deity.typeNe),
  sanskritName: cleanOptionalText(deity.sanskritName),
  introduction: cleanText(deity.introduction || deity.description),
  introductionNe: cleanOptionalText(deity.introductionNe),
  description: cleanText(deity.introduction || deity.description),
  significance: cleanText(deity.significance),
  significanceNe: cleanOptionalText(deity.significanceNe),
  mantra: cleanOptionalText(deity.mantra),
  imageUrl: cleanOptionalText(deity.imageUrl),
  imageDataUrl: cleanDataUrl(deity.imageDataUrl),
  imageSrc: cleanOptionalText(deity.imageUrl) || cleanDataUrl(deity.imageDataUrl) || cleanOptionalText(deity.imageSrc),
  imageCrop: deity.imageCrop ? {
    x: clampNumber(deity.imageCrop.x, 0, -100, 100),
    y: clampNumber(deity.imageCrop.y, 0, -100, 100),
    scale: clampNumber(deity.imageCrop.scale, 1, 0.5, 3),
  } : undefined,
  imageFit: cleanOptionalText(deity.imageFit),
  imagePositionX: deity.imagePositionX === undefined ? undefined : clampNumber(deity.imagePositionX, 50, 0, 100),
  imagePositionY: deity.imagePositionY === undefined ? undefined : clampNumber(deity.imagePositionY, 50, 0, 100),
  imageScale: deity.imageScale === undefined ? undefined : clampNumber(deity.imageScale, 1, 0.5, 3),
  tags: cleanTags(deity.tags),
  theme: cleanOptionalText(deity.theme),
});

export const normalizeCategoryInput = (category: Partial<Category> & { id?: string }, fallbackId?: string): Category => ({
  id: category.id || fallbackId || createId('category'),
  name: cleanText(category.name),
  nameNe: cleanOptionalText(category.nameNe),
  description: cleanOptionalText(category.description),
  descriptionNe: cleanOptionalText(category.descriptionNe),
});

export const normalizePoojaBidhiInput = (item: Partial<PoojaBidhi> & { id?: string }, fallbackId?: string): PoojaBidhi => ({
  id: item.id || fallbackId || createId('pooja'),
  title: cleanText(item.title),
  titleNe: cleanOptionalText(item.titleNe),
  deity: cleanText(item.deity),
  deityNe: cleanOptionalText(item.deityNe),
  occasion: cleanText(item.occasion),
  occasionNe: cleanOptionalText(item.occasionNe),
  overview: cleanText(item.overview),
  overviewNe: cleanOptionalText(item.overviewNe),
  materials: ensureArray<string>(item.materials).map((value) => cleanText(value)).filter(Boolean),
  materialsNe: ensureArray<string>(item.materialsNe).map((value) => cleanText(value)).filter(Boolean),
  steps: ensureArray<string>(item.steps).map((value) => cleanText(value)).filter(Boolean),
  stepsNe: ensureArray<string>(item.stepsNe).map((value) => cleanText(value)).filter(Boolean),
  benefits: ensureArray<string>(item.benefits).map((value) => cleanText(value)).filter(Boolean),
  benefitsNe: ensureArray<string>(item.benefitsNe).map((value) => cleanText(value)).filter(Boolean),
  cautions: cleanOptionalText(item.cautions),
  cautionsNe: cleanOptionalText(item.cautionsNe),
  source: cleanOptionalText(item.source),
  sourceNe: cleanOptionalText(item.sourceNe),
  tags: cleanTags(item.tags),
});

export const normalizeStoryInput = (story: Partial<HinduStory> & { id?: string }, fallbackId?: string): HinduStory => ({
  id: story.id || fallbackId || createId('story'),
  title: cleanText(story.title),
  deity: cleanOptionalText(story.deity),
  summary: cleanText(story.summary),
  story: cleanText(story.story),
  lesson: cleanText(story.lesson),
  source: cleanOptionalText(story.source),
  tags: cleanTags(story.tags),
});

const normalizePanchangTerm = (term: Partial<PanchangTerm>): PanchangTerm => {
  const name = cleanText(term.name || term.title);
  const description = cleanText(term.description || term.text);
  const practicalMeaning = cleanOptionalText(term.practicalMeaning);

  return {
    name,
    description,
    practicalMeaning,
    title: name,
    text: practicalMeaning ? `${description} Practical use: ${practicalMeaning}` : description,
  };
};

export const normalizePanchangContentInput = (content: Partial<PanchangContent> | undefined): PanchangContent => {
  const fallback = DEFAULT_CONTENT.panchang;
  const next = content ?? {};
  const terms = ensureArray<Partial<PanchangTerm>>(next.terms).map(normalizePanchangTerm).filter((term) => term.name && term.description);
  const dailyNotes = ensureArray<Partial<PanchangTerm>>(next.dailyNotes).map(normalizePanchangTerm).filter((term) => term.name && term.description);

  return {
    introTitle: cleanText(next.introTitle) || fallback.introTitle,
    intro: cleanText(next.intro) || fallback.intro,
    terms: terms.length > 0 ? terms : fallback.terms,
    dailyNotes: dailyNotes.length > 0 ? dailyNotes : fallback.dailyNotes,
    disclaimer: cleanText(next.disclaimer) || fallback.disclaimer,
  };
};

export const normalizeContentBundle = (bundle: Partial<ContentBundle> | null): ContentBundle => {
  const resolved = bundle ?? {};
  const devotionalItems = [...ensureArray<Partial<Stotra>>(resolved.stotras), ...ensureArray<Partial<Stotra>>(resolved.devotionalContent)];
  const seenDevotionalIds = new Set<string>();
  const stotras = devotionalItems
    .map((item, index) => normalizeStotraInput(item, `content-${index + 1}`))
    .filter((item) => item.title && item.deity && item.category && item.content.trim())
    .filter((item) => {
      if (seenDevotionalIds.has(item.id)) return false;
      seenDevotionalIds.add(item.id);
      return true;
    });

  const baseCategories = ensureArray<Partial<Category>>(resolved.categories)
    .map((item, index) => normalizeCategoryInput(item, `category-${index + 1}`))
    .filter((item) => item.name);
  const categories = stotras.reduce<Category[]>((items, item) => {
    if (items.some((category) => normalizeContentName(category.name) === normalizeContentName(item.category))) return items;
    return [...items, normalizeCategoryInput({ name: item.category, description: '' })];
  }, baseCategories);

  return {
    stotras,
    deities: ensureArray<Partial<Deity>>(resolved.deities).map((item, index) => normalizeDeityInput(item, `deity-${index + 1}`)).filter((item) => item.name),
    categories,
    poojaBidhi: ensureArray<Partial<PoojaBidhi>>(resolved.poojaBidhi).map((item, index) => normalizePoojaBidhiInput(item, `pooja-${index + 1}`)).filter((item) => item.title && item.deity && item.occasion && item.overview),
    stories: ensureArray<Partial<HinduStory>>(resolved.stories).map((item, index) => normalizeStoryInput(item, `story-${index + 1}`)).filter((item) => item.title && item.story && item.lesson),
    panchang: normalizePanchangContentInput(resolved.panchang),
    updatedAt: cleanOptionalText(resolved.updatedAt),
    lastPublishedAt: cleanOptionalText(resolved.lastPublishedAt),
    sourceVersion: cleanOptionalText(resolved.sourceVersion),
  };
};

const readBundle = (): ContentBundle => {
  const stored = readStorage<Partial<ContentBundle> | null>(CONTENT_KEY, null);

  if (!stored) {
    return normalizeContentBundle(DEFAULT_CONTENT);
  }

  return normalizeContentBundle(stored);
};

export const persistContentBundle = (bundle: ContentBundle, source: ContentSource = 'local', metadata: Partial<ContentMetadata> = {}): ContentBundle => {
  const timestamp = metadata.updatedAt || new Date().toISOString();
  const normalized = normalizeContentBundle({
    ...bundle,
    updatedAt: timestamp,
    lastPublishedAt: metadata.lastPublishedAt ?? bundle.lastPublishedAt,
    sourceVersion: metadata.sourceVersion ?? bundle.sourceVersion,
  });
  writeStorage(CONTENT_KEY, normalized);
  writeStorage<ContentMetadata>(CONTENT_META_KEY, {
    source,
    updatedAt: normalized.updatedAt || timestamp,
    lastPublishedAt: normalized.lastPublishedAt,
    sourceVersion: normalized.sourceVersion,
  });
  return normalized;
};

const updateBundle = (updater: (bundle: ContentBundle) => ContentBundle): ContentBundle => persistContentBundle(updater(readBundle()));

const replaceItem = <T extends { id: string }>(items: T[], nextItem: T): T[] => {
  const index = items.findIndex((item) => item.id === nextItem.id);
  if (index === -1) return [...items, nextItem];
  const copy = [...items];
  copy[index] = nextItem;
  return copy;
};

const removeItem = <T extends { id: string }>(items: T[], id: string): T[] => items.filter((item) => item.id !== id);

const upsertByCaseInsensitiveName = <T extends { id: string; name: string }>(items: T[], nextItem: T): { items: T[]; savedItem: T } => {
  const index = items.findIndex((item) => normalizeContentName(item.name) === normalizeContentName(nextItem.name));
  if (index === -1) {
    return { items: [...items, nextItem], savedItem: nextItem };
  }
  const savedItem = { ...items[index], ...nextItem, id: items[index].id };
  const copy = [...items];
  copy[index] = savedItem;
  return { items: copy, savedItem };
};

export function validateContentBundle(bundle: ContentBundle = readBundle()): string[] {
  const issues: string[] = [];
  const deityNames = new Set(bundle.deities.map((item) => item.name));
  const categoryNames = new Set(bundle.categories.map((item) => item.name));

  bundle.stotras.forEach((item) => {
    if (!item.title || !item.deity || !item.category || !item.content || !item.source || item.tags.length === 0) issues.push(`Stotra incomplete: ${item.id}`);
    if (!deityNames.has(item.deity)) issues.push(`Stotra deity mismatch: ${item.id} -> ${item.deity}`);
    if (!categoryNames.has(item.category)) issues.push(`Stotra category mismatch: ${item.id} -> ${item.category}`);
  });
  bundle.deities.forEach((item) => {
    if (!item.name || !item.description || !item.significance || item.tags.length === 0) issues.push(`Deity incomplete: ${item.id}`);
  });
  bundle.poojaBidhi.forEach((item) => {
    if (!item.title || !item.deity || !item.overview || item.materials.length === 0 || item.steps.length === 0 || item.benefits.length === 0 || !item.cautions) issues.push(`Pooja guide incomplete: ${item.id}`);
    if (item.deity !== 'Navagraha' && !deityNames.has(item.deity)) issues.push(`Pooja deity mismatch: ${item.id} -> ${item.deity}`);
  });
  bundle.stories.forEach((item) => {
    if (!item.title || !item.summary || !item.story || !item.lesson || !item.source || item.tags.length === 0) issues.push(`Story incomplete: ${item.id}`);
  });
  if (!bundle.panchang.intro || bundle.panchang.terms.length === 0 || !bundle.panchang.disclaimer) issues.push('Panchang content incomplete');
  bundle.panchang.terms.forEach((item, index) => {
    if (!item.name || !item.description || !item.practicalMeaning) issues.push(`Panchang term incomplete: ${item.name || item.title || index + 1}`);
  });

  return issues;
}

export function getContentBundle(): ContentBundle {
  return readBundle();
}

export function hasLocalContentBundle(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem(CONTENT_KEY) !== null;
}

export function getContentSourceInfo(): { hasLocalContent: boolean; source: ContentSource | 'default'; updatedAt?: string; lastPublishedAt?: string; sourceVersion?: string } {
  const metadata = readStorage<ContentMetadata | null>(CONTENT_META_KEY, null);
  if (hasLocalContentBundle()) {
    return {
      hasLocalContent: true,
      source: metadata?.source || 'local',
      updatedAt: metadata?.updatedAt,
      lastPublishedAt: metadata?.lastPublishedAt,
      sourceVersion: metadata?.sourceVersion,
    };
  }
  return { hasLocalContent: false, source: 'default' };
}

export function seedRemoteContentIfNoLocal(bundle: ContentBundle): boolean {
  if (hasLocalContentBundle()) return false;
  persistContentBundle(normalizeContentBundle(bundle), 'remote');
  return true;
}

export function getContentTimestamp(bundle: Partial<ContentBundle> | null | undefined): number {
  const value = bundle?.lastPublishedAt || bundle?.updatedAt;
  const timestamp = value ? Date.parse(value) : 0;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

export function applyRemoteContentIfNewer(remoteBundle: ContentBundle): 'remote-applied' | 'local-newer' | 'unchanged' {
  const remote = normalizeContentBundle(remoteBundle);
  if (!hasLocalContentBundle()) {
    persistContentBundle(remote, 'remote', {
      updatedAt: remote.updatedAt || remote.lastPublishedAt || new Date().toISOString(),
      lastPublishedAt: remote.lastPublishedAt,
      sourceVersion: remote.sourceVersion,
    });
    return 'remote-applied';
  }

  const local = readBundle();
  const localInfo = getContentSourceInfo();
  const localTimestamp = getContentTimestamp({
    ...local,
    updatedAt: localInfo.updatedAt || local.updatedAt,
    lastPublishedAt: localInfo.lastPublishedAt || local.lastPublishedAt,
  });
  const remoteTimestamp = getContentTimestamp(remote);

  if (remoteTimestamp === 0) {
    persistContentBundle(remote, 'remote', {
      updatedAt: new Date().toISOString(),
      lastPublishedAt: remote.lastPublishedAt,
      sourceVersion: remote.sourceVersion,
    });
    return 'remote-applied';
  }

  if (remoteTimestamp > localTimestamp) {
    persistContentBundle(remote, 'remote', {
      updatedAt: remote.updatedAt || remote.lastPublishedAt,
      lastPublishedAt: remote.lastPublishedAt,
      sourceVersion: remote.sourceVersion,
    });
    return 'remote-applied';
  }

  if (localInfo.source === 'local' && localTimestamp > remoteTimestamp) {
    return 'local-newer';
  }

  return 'unchanged';
}

export function markContentPublished(bundle: ContentBundle, publishedAt: string = new Date().toISOString()): ContentBundle {
  return persistContentBundle(
    {
      ...normalizeContentBundle(bundle),
      updatedAt: publishedAt,
      lastPublishedAt: publishedAt,
      sourceVersion: `github-${publishedAt}`,
    },
    'remote',
    {
      updatedAt: publishedAt,
      lastPublishedAt: publishedAt,
      sourceVersion: `github-${publishedAt}`,
    }
  );
}

export function getStotras(): Stotra[] {
  return readBundle().stotras;
}

export function getDevotionalContent(): Stotra[] {
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
  const next = normalizeStotraInput(input);
  updateBundle((bundle) => ({
    ...bundle,
    stotras: replaceItem(bundle.stotras, next),
  }));
  return next;
}

export const saveDevotionalContent = saveStotra;
export const updateDevotionalContent = updateStotra;
export const deleteDevotionalContent = deleteStotra;

export function updateStotra(id: string, input: StotraInput): Stotra {
  const next = normalizeStotraInput({ ...input, id }, id);
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
  const next = normalizeCategoryInput(input);
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
  const next = normalizeCategoryInput({ ...input, id }, id);
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
  const next = normalizeDeityInput(input);
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
  const next = normalizeDeityInput({ ...input, id }, id);
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
  const next = normalizePoojaBidhiInput(input);
  updateBundle((bundle) => ({
    ...bundle,
    poojaBidhi: replaceItem(bundle.poojaBidhi, next),
  }));
  return next;
}

export function updatePoojaBidhi(id: string, input: PoojaBidhiInput): PoojaBidhi {
  const next = normalizePoojaBidhiInput({ ...input, id }, id);
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
  const next = normalizeStoryInput(input);
  updateBundle((bundle) => ({
    ...bundle,
    stories: replaceItem(bundle.stories, next),
  }));
  return next;
}

export function updateStory(id: string, input: HinduStoryInput): HinduStory {
  const next = normalizeStoryInput({ ...input, id }, id);
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
  const next = normalizePanchangContentInput(input);
  updateBundle((bundle) => ({
    ...bundle,
    panchang: next,
  }));
  return next;
}

export function exportAllContent(): string {
  return JSON.stringify(readBundle(), null, 2);
}

export function importAllContent(json: string, source: ContentSource = 'local'): ContentBundle {
  const parsed = JSON.parse(json) as Partial<ContentBundle>;
  const next = normalizeContentBundle(parsed);
  persistContentBundle(next, source);
  return next;
}

export function resetToDefaultContent(): ContentBundle {
  const next = normalizeContentBundle(DEFAULT_CONTENT);
  persistContentBundle(next);
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
