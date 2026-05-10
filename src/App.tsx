import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import AppShell, { type AppView } from './components/layout/AppShell';
import HomePage from './components/home/HomePage';
import StotraReader, { type ReaderFontSize } from './components/stotra/StotraReader';
import ErrorBoundary from './components/common/ErrorBoundary';
import StateMessage from './components/common/StateMessage';
import { loadRemoteContent, publishContentToGitHub } from './services/contentBackendService';
import {
  addHistory,
  clearFavorites,
  clearHistory,
  getContentBundle,
  getContentSourceInfo,
  getFavoriteIds,
  getHistory,
  getReaderFontSize,
  normalizeCategoryInput,
  normalizeContentBundle,
  normalizeContentName,
  normalizeDeityInput,
  normalizePanchangContentInput,
  normalizePoojaBidhiInput,
  normalizeStoryInput,
  normalizeStotraInput,
  persistContentBundle,
  removeFavorite,
  seedRemoteContentIfNoLocal,
  setReaderFontSize as saveReaderFontSize,
  toggleFavorite,
  createUniqueId,
  type CategoryInput,
  type DeityInput,
  type HinduStoryInput,
  type PanchangContentInput,
  type PoojaBidhiInput,
  type StotraInput,
} from './services/localContentService';
import { DEFAULT_CONTENT, DEFAULT_PANCHANG_CONTENT } from './data/defaultContent';
import type { Category, ContentBundle, Deity, HistoryItem, PoojaBidhi, Stotra } from './types';
import { getLocalizedCategoryName, getLocalizedContentTitle, getLocalizedDeityName } from './utils/localization';

const StotrasPage = lazy(() => import('./components/stotra/StotrasPage'));
const FavoritesPage = lazy(() => import('./components/stotra/FavoritesPage'));
const Panchang = lazy(() => import('./components/Panchang'));
const GodsPage = lazy(() => import('./components/gods/GodsPage'));
const PoojaPage = lazy(() => import('./components/pooja/PoojaPage'));
const StoriesPage = lazy(() => import('./components/stories/StoriesPage'));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));

interface ContentStatus {
  kind: 'neutral' | 'error';
  text: string;
}

const normalizeSearch = (value: string): string => value.trim().toLowerCase();
const ADMIN_SESSION_KEY = 'om-stotra-sagar-admin-session';
const LANGUAGE_KEY = 'om-stotra-sagar-language';
const ADMIN_SESSION_DURATION_MS = 30 * 60 * 1000;
const THEME_KEY = 'om-stotra-sagar-theme';
const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE as string | undefined;
type Language = 'ne' | 'en';
type Theme = 'light' | 'dark' | 'system';

const translations = {
  en: {
    home: 'Home',
    library: 'Library',
    gods: 'Gods',
    pooja: 'Pooja Bidhi',
    stories: 'Stories',
    panchang: 'Panchang',
    favorites: 'Favorites',
    admin: 'Admin',
    search: 'Search',
    more: 'More',
  },
  ne: {
    stories: 'कथाहरू',
    home: 'गृह',
    library: 'पुस्तकालय',
    gods: 'देवता',
    pooja: 'पूजा विधि',
    panchang: 'पञ्चाङ्ग',
    favorites: 'मनपर्ने',
    admin: 'एडमिन',
    search: 'खोज्नुहोस्',
    more: 'थप',
  },
} as const;

const getSavedLanguage = (): Language => {
  if (typeof localStorage === 'undefined') return 'ne';
  return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'ne';
};

const getSavedTheme = (): Theme => {
  if (typeof localStorage === 'undefined') return 'system';
  const saved = localStorage.getItem(THEME_KEY);
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
};

const resolveTheme = (theme: Theme): 'light' | 'dark' => {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const getAdminSessionTimestamp = (): number => {
  if (typeof sessionStorage === 'undefined') return 0;
  const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

const isAdminSessionActive = (): boolean => {
  const timestamp = getAdminSessionTimestamp();
  return timestamp > 0 && Date.now() - timestamp < ADMIN_SESSION_DURATION_MS;
};

const replaceById = <T extends { id: string }>(items: T[], nextItem: T): T[] => {
  const index = items.findIndex((item) => item.id === nextItem.id);
  if (index === -1) return [...items, nextItem];
  const copy = [...items];
  copy[index] = nextItem;
  return copy;
};

const removeById = <T extends { id: string }>(items: T[], id: string): T[] => items.filter((item) => item.id !== id);

const upsertByName = <T extends { id: string; name: string }>(items: T[], nextItem: T): { items: T[]; savedItem: T } => {
  const index = items.findIndex((item) => normalizeContentName(item.name) === normalizeContentName(nextItem.name));
  if (index === -1) return { items: [...items, nextItem], savedItem: nextItem };

  const savedItem = { ...items[index], ...nextItem, id: items[index].id };
  const copy = [...items];
  copy[index] = savedItem;
  return { items: copy, savedItem };
};

export default function App() {
  const [content, setContent] = useState(() => getContentBundle());
  const [activeView, setActiveView] = useState<AppView>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDeity, setActiveDeity] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedStotra, setSelectedStotra] = useState<Stotra | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getFavoriteIds());
  const [history, setHistory] = useState<HistoryItem[]>(() => getHistory());
  const [readerFontSize, setReaderFontSizeState] = useState<ReaderFontSize>(getReaderFontSize());
  const [selectedPoojaId, setSelectedPoojaId] = useState<string | null>(null);
  const [status, setStatus] = useState<ContentStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contentSourceInfo, setContentSourceInfo] = useState(() => getContentSourceInfo());
  const [adminUnlocked, setAdminUnlocked] = useState(() => isAdminSessionActive());
  const [language, setLanguage] = useState<Language>(() => getSavedLanguage());
  const [theme, setTheme] = useState<Theme>(() => getSavedTheme());

  const stotras = content.stotras;
  const categories = content.categories;
  const deities = content.deities;
  const poojaBidhi = content.poojaBidhi;
  const stories = content.stories;
  const panchang = content.panchang ?? DEFAULT_PANCHANG_CONTENT;

  const favoriteStotras = useMemo(
    () => favoriteIds.map((id) => stotras.find((stotra) => stotra.id === id)).filter((stotra): stotra is Stotra => Boolean(stotra)),
    [favoriteIds, stotras]
  );

  const filteredStotras = useMemo(() => {
    const queryText = normalizeSearch(searchQuery);

    return stotras.filter((stotra) => {
      const matchesSearch = !queryText ||
        stotra.title.toLowerCase().includes(queryText) ||
        getLocalizedContentTitle(stotra, 'ne').toLowerCase().includes(queryText) ||
        (stotra.titleNe?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.alternateTitle?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.alternateTitleNe?.toLowerCase().includes(queryText) ?? false) ||
        stotra.deity.toLowerCase().includes(queryText) ||
        getLocalizedDeityName(stotra.deityNe || stotra.deity, 'ne').toLowerCase().includes(queryText) ||
        (stotra.deityNe?.toLowerCase().includes(queryText) ?? false) ||
        stotra.category.toLowerCase().includes(queryText) ||
        getLocalizedCategoryName(stotra.categoryNe || stotra.category, 'ne').toLowerCase().includes(queryText) ||
        (stotra.categoryNe?.toLowerCase().includes(queryText) ?? false) ||
        stotra.content.toLowerCase().includes(queryText) ||
        (stotra.meaningNe?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.nepaliMeaning?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.meaning?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.wordMeaning?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.wordMeaningNe?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.benefits?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.benefitsNe?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.process?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.processNe?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.tags?.some((tag) => tag.toLowerCase().includes(queryText)) ?? false);
      const matchesDeity = !activeDeity || normalizeSearch(stotra.deity) === normalizeSearch(activeDeity);
      const matchesCategory = activeCategory === 'All' || normalizeSearch(stotra.category) === normalizeSearch(activeCategory);

      return matchesSearch && matchesDeity && matchesCategory;
    });
  }, [activeCategory, activeDeity, searchQuery, stotras]);

  useEffect(() => {
    saveReaderFontSize(readerFontSize);
  }, [readerFontSize]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LANGUAGE_KEY, language);
    }
  }, [language]);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_KEY, theme);
    }

    const applyTheme = () => {
      document.documentElement.dataset.theme = resolveTheme(theme);
    };
    applyTheme();

    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);

  useEffect(() => {
    if (!adminUnlocked || typeof sessionStorage === 'undefined') return;

    const expireSession = () => {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      setAdminUnlocked(false);
      setMessage(msg('Admin session expired after 30 minutes of inactivity.', 'एडमिन सत्र ३० मिनेट निष्क्रिय रहेपछि समाप्त भयो।'), 'error');
      handleViewChange('home');
    };
    const refreshSession = () => {
      if (!isAdminSessionActive()) {
        expireSession();
        return;
      }
      sessionStorage.setItem(ADMIN_SESSION_KEY, String(Date.now()));
    };
    const checkSession = () => {
      if (!isAdminSessionActive()) {
        expireSession();
      }
    };
    const events = ['click', 'keydown', 'mousemove', 'scroll'] as const;
    events.forEach((eventName) => window.addEventListener(eventName, refreshSession, { passive: true }));
    const timer = window.setInterval(checkSession, 30_000);

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, refreshSession));
      window.clearInterval(timer);
    };
  }, [adminUnlocked]);

  useEffect(() => {
    let isMounted = true;
    loadRemoteContent().then((remoteContent) => {
      if (!isMounted || !remoteContent) return;
      try {
        const seeded = seedRemoteContentIfNoLocal(remoteContent);
        if (seeded) {
          setContent(getContentBundle());
          setContentSourceInfo(getContentSourceInfo());
        }
      } catch (error) {
        console.warn('Remote content ignored.');
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const updateContent = (nextContentOrUpdater: ContentBundle | ((current: ContentBundle) => ContentBundle), source: 'local' | 'remote' = 'local'): ContentBundle => {
    const current = normalizeContentBundle(content);
    const rawNext = typeof nextContentOrUpdater === 'function' ? nextContentOrUpdater(current) : nextContentOrUpdater;
    const next = persistContentBundle(normalizeContentBundle(rawNext), source);
    setContent(next);
    setFavoriteIds(getFavoriteIds());
    setContentSourceInfo(getContentSourceInfo());
    return next;
  };

  const setMessage = (text: string, kind: ContentStatus['kind'] = 'neutral') => {
    setStatus({ text, kind });
  };

  const msg = (en: string, ne: string) => language === 'ne' ? ne : en;

  const clearMessage = () => setStatus(null);

  const handleViewChange = (view: AppView) => {
    setActiveView(view);
    setIsMenuOpen(false);
    if (view === 'home') {
      setActiveCategory('All');
      setActiveDeity(null);
      clearMessage();
    } else if (view !== 'pooja') {
      setSelectedPoojaId(null);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim() && activeView !== 'stotras') {
      setActiveView('stotras');
      setIsMenuOpen(false);
    }
  };

  const handleOpenStotra = (stotra: Stotra) => {
    setSelectedStotra(stotra);
    setHistory(addHistory(stotra));
  };

  const handleOpenPooja = (pooja: PoojaBidhi) => {
    setActiveDeity(pooja.deity);
    setSelectedPoojaId(pooja.id);
    handleViewChange('pooja');
  };

  const handleToggleFavorite = (stotra: Stotra) => {
    const next = toggleFavorite(stotra.id);
    setFavoriteIds(next);
  };

  const handlePrint = () => window.print();

  const handleShare = async (stotra: Stotra) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: stotra.title, text: stotra.content, url: window.location.href });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setMessage(msg('Page link copied to clipboard when available.', 'सम्भव भए पेजको लिंक क्लिपबोर्डमा कपी भयो।'));
    } catch (error) {
      console.error('Share failed:', error);
      setMessage(msg('Sharing is not available in this browser.', 'यो ब्राउजरमा सेयर सुविधा उपलब्ध छैन।'), 'error');
    }
  };

  const handleFontSizeChange = (fontSize: ReaderFontSize) => {
    setReaderFontSizeState(fontSize);
    saveReaderFontSize(fontSize);
  };

  const handleSaveStotra = (input: StotraInput, id?: string): boolean => {
    setIsSaving(true);
    try {
      const next = normalizeStotraInput({ ...input, id: id || input.id || createUniqueId('stotra') }, id);
      updateContent((bundle) => ({
        ...bundle,
        stotras: replaceById(bundle.stotras, next),
      }));
      setMessage(msg('Devotional content saved.', 'भक्तिपूर्ण सामग्री सेभ भयो।'));
      return true;
    } catch (error) {
      console.error('Save stotra failed:', error);
      setMessage(msg('Could not save devotional content.', 'भक्तिपूर्ण सामग्री सेभ गर्न सकिएन।'), 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStotra = (id: string) => {
    if (!confirm(msg('Delete this stotra from local content?', 'यो स्तोत्र स्थानीय सामग्रीबाट मेटाउने?'))) return;
    updateContent((bundle) => ({
      ...bundle,
      stotras: removeById(bundle.stotras, id),
    }));
    removeFavorite(id);
    setFavoriteIds(getFavoriteIds());
    setSelectedStotra((current) => (current?.id === id ? null : current));
    setMessage(msg('Devotional content deleted.', 'भक्तिपूर्ण सामग्री मेटियो।'));
  };

  const handleSaveCategory = (input: CategoryInput, id?: string): Category | null => {
    setIsSaving(true);
    try {
      const previous = id ? content.categories.find((category) => category.id === id) : undefined;
      const next = normalizeCategoryInput({ ...input, id: id || input.id || createUniqueId('category') }, id);
      let savedCategory = next;
      updateContent((bundle) => {
        const result = id
          ? { items: replaceById(bundle.categories, next), savedItem: next }
          : upsertByName(bundle.categories, next);
        savedCategory = result.savedItem;
        return {
          ...bundle,
          categories: result.items,
          stotras: previous && normalizeContentName(previous.name) !== normalizeContentName(savedCategory.name)
            ? bundle.stotras.map((stotra) => normalizeContentName(stotra.category) === normalizeContentName(previous.name) ? { ...stotra, category: savedCategory.name } : stotra)
            : bundle.stotras,
        };
      });
      setMessage(msg('Category saved.', 'श्रेणी सेभ भयो।'));
      return savedCategory;
    } catch (error) {
      console.error('Save category failed:', error);
      setMessage(msg('Could not save the category.', 'श्रेणी सेभ गर्न सकिएन।'), 'error');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    const category = content.categories.find((item) => item.id === id);
    if (category && content.stotras.some((stotra) => normalizeContentName(stotra.category) === normalizeContentName(category.name))) {
      setMessage(msg('Move or update devotional content using this category before deleting it.', 'यो श्रेणी प्रयोग भएको भक्तिपूर्ण सामग्री सार्नुहोस् वा अपडेट गर्नुहोस्।'), 'error');
      return;
    }
    if (!confirm(msg('Delete this category from local content?', 'यो श्रेणी स्थानीय सामग्रीबाट मेटाउने?'))) return;
    updateContent((bundle) => ({
      ...bundle,
      categories: removeById(bundle.categories, id),
    }));
    setMessage(msg('Category deleted.', 'श्रेणी मेटियो।'));
  };

  const handleSaveDeity = (input: DeityInput, id?: string): Deity | null => {
    setIsSaving(true);
    try {
      const previous = id ? content.deities.find((deity) => deity.id === id) : undefined;
      const next = normalizeDeityInput({ ...input, id: id || input.id || createUniqueId('deity') }, id);
      let savedDeity = next;
      updateContent((bundle) => {
        const result = id
          ? { items: replaceById(bundle.deities, next), savedItem: next }
          : upsertByName(bundle.deities, next);
        savedDeity = result.savedItem;
        const renamed = previous && normalizeContentName(previous.name) !== normalizeContentName(savedDeity.name);
        return {
          ...bundle,
          deities: result.items,
          stotras: renamed
            ? bundle.stotras.map((stotra) => normalizeContentName(stotra.deity) === normalizeContentName(previous.name) ? { ...stotra, deity: savedDeity.name } : stotra)
            : bundle.stotras,
          poojaBidhi: renamed
            ? bundle.poojaBidhi.map((item) => normalizeContentName(item.deity) === normalizeContentName(previous.name) ? { ...item, deity: savedDeity.name } : item)
            : bundle.poojaBidhi,
        };
      });
      setMessage(msg('Deity saved.', 'देवता सेभ भयो।'));
      return savedDeity;
    } catch (error) {
      console.error('Save deity failed:', error);
      setMessage(msg('Could not save the deity.', 'देवता सेभ गर्न सकिएन।'), 'error');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDeity = (id: string) => {
    const deity = content.deities.find((item) => item.id === id);
    if (deity && content.stotras.some((stotra) => normalizeContentName(stotra.deity) === normalizeContentName(deity.name))) {
      setMessage(msg('Move or update related content using this deity before deleting it.', 'यो देवता प्रयोग भएको सम्बन्धित सामग्री सार्नुहोस् वा अपडेट गर्नुहोस्।'), 'error');
      return;
    }
    if (!confirm(msg('Delete this deity from local content?', 'यो देवता स्थानीय सामग्रीबाट मेटाउने?'))) return;
    updateContent((bundle) => ({
      ...bundle,
      deities: removeById(bundle.deities, id),
    }));
    setMessage(msg('Deity deleted.', 'देवता मेटियो।'));
  };

  const handleSavePoojaBidhi = (input: PoojaBidhiInput, id?: string): boolean => {
    setIsSaving(true);
    try {
      const next = normalizePoojaBidhiInput({ ...input, id: id || input.id || createUniqueId('pooja') }, id);
      updateContent((bundle) => ({
        ...bundle,
        poojaBidhi: replaceById(bundle.poojaBidhi, next),
      }));
      setMessage(msg('Pooja guide saved.', 'पूजा विधि सेभ भयो।'));
      return true;
    } catch (error) {
      console.error('Save pooja failed:', error);
      setMessage(msg('Could not save the pooja guide.', 'पूजा विधि सेभ गर्न सकिएन।'), 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePoojaBidhi = (id: string) => {
    if (!confirm(msg('Delete this pooja guide from local content?', 'यो पूजा विधि स्थानीय सामग्रीबाट मेटाउने?'))) return;
    updateContent((bundle) => ({
      ...bundle,
      poojaBidhi: removeById(bundle.poojaBidhi, id),
    }));
    setMessage(msg('Pooja guide deleted.', 'पूजा विधि मेटियो।'));
  };

  const handleSaveStory = (input: HinduStoryInput, id?: string): boolean => {
    setIsSaving(true);
    try {
      const next = normalizeStoryInput({ ...input, id: id || input.id || createUniqueId('story') }, id);
      updateContent((bundle) => ({
        ...bundle,
        stories: replaceById(bundle.stories, next),
      }));
      setMessage(msg('Story saved locally.', 'कथा स्थानीय रूपमा सेभ भयो।'));
      return true;
    } catch (error) {
      console.error('Save story failed:', error);
      setMessage(msg('Could not save the story.', 'कथा सेभ गर्न सकिएन।'), 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePanchangContent = (input: PanchangContentInput): boolean => {
    setIsSaving(true);
    try {
      const next = normalizePanchangContentInput(input);
      updateContent((bundle) => ({
        ...bundle,
        panchang: next,
      }));
      setMessage(msg('Panchang guide saved locally.', 'पञ्चाङ्ग मार्गदर्शन स्थानीय रूपमा सेभ भयो।'));
      return true;
    } catch (error) {
      console.error('Save Panchang failed:', error);
      setMessage(msg('Could not save the Panchang guide.', 'पञ्चाङ्ग मार्गदर्शन सेभ गर्न सकिएन।'), 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStory = (id: string) => {
    if (!confirm(msg('Delete this story from local content?', 'यो कथा स्थानीय सामग्रीबाट मेटाउने?'))) return;
    updateContent((bundle) => ({
      ...bundle,
      stories: removeById(bundle.stories, id),
    }));
    setMessage(msg('Story deleted locally.', 'कथा स्थानीय रूपमा मेटियो।'));
  };

  const handleExportAllContent = () => JSON.stringify(normalizeContentBundle(content), null, 2);

  const handleImportAllContent = (json: string): boolean => {
    setIsSaving(true);
    try {
      const parsed = JSON.parse(json) as Partial<ContentBundle>;
      updateContent(normalizeContentBundle(parsed));
      setMessage(msg('Content imported successfully.', 'सामग्री सफलतापूर्वक आयात भयो।'));
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      setMessage(msg('Import failed. Please check the JSON format.', 'आयात असफल भयो। कृपया JSON ढाँचा जाँच्नुहोस्।'), 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaultContent = () => {
    setIsSaving(true);
    try {
      updateContent(normalizeContentBundle(DEFAULT_CONTENT));
      clearFavorites();
      clearHistory();
      setFavoriteIds(getFavoriteIds());
      setSelectedStotra(null);
      setActiveView('home');
      setActiveCategory('All');
      setActiveDeity(null);
      setMessage(msg('Local content reset to default starter content.', 'स्थानीय सामग्री सुरुको डिफल्ट सामग्रीमा फर्काइयो।'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdminUnlock = (passcode: string) => {
    if (!ADMIN_PASSCODE) {
      setMessage(msg('Admin passcode is not configured.', 'एडमिन पासकोड जडान गरिएको छैन।'), 'error');
      return false;
    }
    if (passcode !== ADMIN_PASSCODE) {
      setMessage(msg('Invalid admin passcode.', 'एडमिन पासकोड मिलेन।'), 'error');
      return false;
    }
    sessionStorage.setItem(ADMIN_SESSION_KEY, String(Date.now()));
    setAdminUnlocked(true);
    setMessage(msg('Admin unlocked for this browser session.', 'यो ब्राउजर सत्रका लागि एडमिन खुल्यो।'));
    return true;
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminUnlocked(false);
    setMessage(msg('Admin logged out.', 'एडमिन लगआउट भयो।'));
    handleViewChange('home');
  };

  const handlePublishContent = async (): Promise<boolean> => {
    const password = window.prompt('Enter backend admin password to publish content') || '';
    if (!password) {
      setMessage(msg('Backend admin password is required to publish.', 'प्रकाशित गर्न backend एडमिन पासवर्ड आवश्यक छ।'), 'error');
      return false;
    }
    setIsSaving(true);
    try {
      const result = await publishContentToGitHub(normalizeContentBundle(content), password);
      setMessage(result.message, result.ok ? 'neutral' : 'error');
      return result.ok;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNavigate = (view: 'stotras' | 'gods' | 'pooja' | 'panchang') => {
    handleViewChange(view);
  };

  const handleThemeChange = () => {
    setTheme((current) => resolveTheme(current) === 'dark' ? 'light' : 'dark');
  };

  return (
    <AppShell
      activeView={activeView}
      searchQuery={searchQuery}
      isMenuOpen={isMenuOpen}
      onSearchChange={handleSearchChange}
      onViewChange={handleViewChange}
      onToggleMenu={() => setIsMenuOpen((open) => !open)}
      language={language}
      labels={translations[language]}
      onLanguageChange={setLanguage}
      theme={resolveTheme(theme)}
      onThemeChange={handleThemeChange}
    >
      {status && activeView !== 'admin' && (
        <div className="page-container pt-6" role="status" aria-live="polite" aria-atomic="true">
          <StateMessage title={status.kind === 'error' ? msg('Notice', 'सूचना') : msg('Update', 'अपडेट')} message={status.text} tone={status.kind === 'error' ? 'error' : 'neutral'} />
        </div>
      )}

      <ErrorBoundary key={activeView} name={activeView}>
      <Suspense fallback={
        <div className="page-container page-shell" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          <div className="loading-spinner" aria-label="Loading..." />
        </div>
      }>
      <AnimatePresence mode="wait">
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
      {activeView === 'stotras' ? (
        <StotrasPage
          stotras={stotras}
          categories={categories}
          deities={deities}
          filteredStotras={filteredStotras}
          searchQuery={searchQuery}
          activeDeity={activeDeity}
          activeCategory={activeCategory}
          isLoading={false}
          favoriteStotraIds={favoriteIds}
          language={language}
          onSearchChange={handleSearchChange}
          onDeityChange={setActiveDeity}
          onCategoryChange={setActiveCategory}
          onOpenStotra={handleOpenStotra}
          onToggleFavorite={handleToggleFavorite}
        />
      ) : activeView === 'gods' ? (
        <GodsPage
          deities={deities}
          stotras={stotras}
          poojaBidhi={poojaBidhi}
          language={language}
          activeDeity={activeDeity}
          onOpenContent={handleOpenStotra}
          onOpenPooja={(deity) => {
            setActiveDeity(deity);
            handleViewChange('pooja');
          }}
          onOpenAdmin={() => handleViewChange('admin')}
        />
      ) : activeView === 'pooja' ? (
        <PoojaPage poojaBidhi={poojaBidhi} activeDeity={activeDeity} selectedPoojaId={selectedPoojaId} language={language} />
      ) : activeView === 'stories' ? (
        <StoriesPage stories={stories} />
      ) : activeView === 'panchang' ? (
        <Panchang content={panchang} language={language} />
      ) : activeView === 'favorites' ? (
        <FavoritesPage
          favoriteStotras={favoriteStotras}
          favoriteStotraIds={favoriteIds}
          language={language}
          onOpenStotra={handleOpenStotra}
          onToggleFavorite={handleToggleFavorite}
          onBrowseStotras={() => handleViewChange('stotras')}
        />
      ) : activeView === 'admin' ? (
        adminUnlocked ? (
          <AdminPanel
            isOpen
            stotras={stotras}
            categories={categories}
            deities={deities}
            poojaBidhi={poojaBidhi}
            stories={stories}
            panchang={panchang}
            isSaving={isSaving}
            message={status?.kind === 'neutral' ? status.text : null}
            errorMessage={status?.kind === 'error' ? status.text : null}
            localContentActive={contentSourceInfo.hasLocalContent}
            language={language}
            onClose={() => handleViewChange('home')}
            onLogoutAdmin={handleAdminLogout}
            onSaveStotra={handleSaveStotra}
            onDeleteStotra={handleDeleteStotra}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            onSaveDeity={handleSaveDeity}
            onDeleteDeity={handleDeleteDeity}
            onSavePoojaBidhi={handleSavePoojaBidhi}
            onDeletePoojaBidhi={handleDeletePoojaBidhi}
            onSaveStory={handleSaveStory}
            onDeleteStory={handleDeleteStory}
            onSavePanchangContent={handleSavePanchangContent}
            onExportAllContent={handleExportAllContent}
            onImportAllContent={handleImportAllContent}
            onResetToDefaultContent={handleResetToDefaultContent}
            onPublishContent={handlePublishContent}
          />
        ) : (
          <AdminAccessGate
            errorMessage={status?.kind === 'error' ? status.text : null}
            message={status?.kind === 'neutral' ? status.text : null}
            language={language}
            onSubmit={handleAdminUnlock}
            onCancel={() => handleViewChange('home')}
          />
        )
      ) : (
        <HomePage
          stotras={stotras}
          deities={deities}
          categories={categories}
          poojaBidhi={poojaBidhi}
          stories={stories}
          filteredStotras={filteredStotras}
          searchQuery={searchQuery}
          activeDeity={activeDeity}
          activeCategory={activeCategory}
          isLoading={false}
          favoriteStotraIds={favoriteIds}
          history={history}
          language={language}
          onSearchChange={handleSearchChange}
          onDeityChange={setActiveDeity}
          onOpenPooja={handleOpenPooja}
          onCategoryChange={setActiveCategory}
          onNavigate={handleNavigate}
          onOpenStotra={handleOpenStotra}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      </motion.div>
      </AnimatePresence>
      </Suspense>
      </ErrorBoundary>

      <StotraReader
        stotra={selectedStotra}
        fontSize={readerFontSize}
        isFavorite={selectedStotra ? favoriteIds.includes(selectedStotra.id) : false}
        language={language}
        onClose={() => setSelectedStotra(null)}
        onFontSizeChange={handleFontSizeChange}
        onPrint={handlePrint}
        onShare={handleShare}
        onToggleFavorite={handleToggleFavorite}
      />
    </AppShell>
  );
}

function AdminAccessGate({
  message,
  errorMessage,
  language,
  onSubmit,
  onCancel,
}: {
  message: string | null;
  errorMessage: string | null;
  language: Language;
  onSubmit: (passcode: string) => boolean;
  onCancel: () => void;
}) {
  const [passcode, setPasscode] = useState('');
  const copy = language === 'ne'
    ? {
        eyebrow: 'एडमिन पहुँच',
        title: 'स्थानीय सामग्री स्टुडियो खोल्नुहोस्',
        subtitle: 'यो ब्राउजर सत्रका लागि एडमिन पासकोड राख्नुहोस्। यो v1 सामग्री व्यवस्थापनका लागि सरल स्थानीय गेट हो।',
        admin: 'एडमिन',
        notice: 'एडमिन सूचना',
        passcode: 'एडमिन पासकोड',
        unlock: 'एडमिन खोल्नुहोस्',
        cancel: 'रद्द गर्नुहोस्',
      }
    : {
        eyebrow: 'Admin Access',
        title: 'Unlock local content studio',
        subtitle: 'Enter the admin passcode for this browser session. This is a simple v1 content gate, not production authentication.',
        admin: 'Admin',
        notice: 'Admin notice',
        passcode: 'Admin passcode',
        unlock: 'Unlock Admin',
        cancel: 'Cancel',
      };

  return (
    <main className="page-container page-shell">
      <section className="page-hero editorial-card admin-access-card">
        <p className="page-eyebrow">{copy.eyebrow}</p>
        <h1 className="page-title">{copy.title}</h1>
        <p className="page-subtitle">{copy.subtitle}</p>
        {message && <StateMessage title={copy.admin} message={message} />}
        {errorMessage && <StateMessage title={copy.notice} message={errorMessage} tone="error" />}
        <form
          className="form-stack admin-access-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (onSubmit(passcode)) setPasscode('');
          }}
        >
          <input
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder={copy.passcode}
            className="admin-input"
            autoComplete="current-password"
          />
          <div className="button-row">
            <button className="action-button" type="submit">
              {copy.unlock}
            </button>
            <button className="secondary-button" type="button" onClick={onCancel}>
              {copy.cancel}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
