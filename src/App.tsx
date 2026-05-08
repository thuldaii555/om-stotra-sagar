import { useEffect, useMemo, useState } from 'react';
import AppShell, { type AppView } from './components/layout/AppShell';
import HomePage from './components/home/HomePage';
import StotraReader, { type ReaderFontSize } from './components/stotra/StotraReader';
import StotrasPage from './components/stotra/StotrasPage';
import FavoritesPage from './components/stotra/FavoritesPage';
import StateMessage from './components/common/StateMessage';
import Panchang from './components/Panchang';
import GodsPage from './components/gods/GodsPage';
import PoojaPage from './components/pooja/PoojaPage';
import StoriesPage from './components/stories/StoriesPage';
import AdminPanel from './components/admin/AdminPanel';
import { loadRemoteContent, publishContentToGitHub } from './services/contentBackendService';
import {
  addHistory,
  clearFavorites,
  clearHistory,
  exportAllContent,
  getContentBundle,
  getContentSourceInfo,
  getFavoriteIds,
  getReaderFontSize,
  importAllContent,
  removeFavorite,
  resetToDefaultContent,
  saveCategory,
  saveDeity,
  savePanchangContent,
  savePoojaBidhi,
  saveStory,
  saveStotra,
  seedRemoteContentIfNoLocal,
  setReaderFontSize as saveReaderFontSize,
  toggleFavorite,
  updateCategory,
  updateDeity,
  updatePoojaBidhi,
  updateStory,
  updateStotra,
  deleteCategory,
  deleteDeity,
  deletePoojaBidhi,
  deleteStory,
  deleteStotra,
  type CategoryInput,
  type DeityInput,
  type HinduStoryInput,
  type PanchangContentInput,
  type PoojaBidhiInput,
  type StotraInput,
} from './services/localContentService';
import { DEFAULT_CATEGORIES, DEFAULT_DEITIES, DEFAULT_PANCHANG_CONTENT, DEFAULT_POOJA_BIDHI, DEFAULT_STORIES, DEFAULT_STOTRAS } from './data/defaultContent';
import type { Category, Deity, Stotra } from './types';

interface ContentStatus {
  kind: 'neutral' | 'error';
  text: string;
}

const normalizeSearch = (value: string): string => value.trim().toLowerCase();
const ADMIN_SESSION_KEY = 'om-stotra-sagar-admin-session';
const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE as string | undefined;
// TODO: Add an English/Nepali language switcher in a future release.

export default function App() {
  const [content, setContent] = useState(() => getContentBundle());
  const [activeView, setActiveView] = useState<AppView>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDeity, setActiveDeity] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedStotra, setSelectedStotra] = useState<Stotra | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getFavoriteIds());
  const [readerFontSize, setReaderFontSizeState] = useState<ReaderFontSize>(getReaderFontSize());
  const [status, setStatus] = useState<ContentStatus | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contentSourceInfo, setContentSourceInfo] = useState(() => getContentSourceInfo());
  const [adminUnlocked, setAdminUnlocked] = useState(() => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(ADMIN_SESSION_KEY) === 'unlocked');

  const stotras = content.stotras.length > 0 ? content.stotras : DEFAULT_STOTRAS;
  const categories = content.categories.length > 0 ? content.categories : DEFAULT_CATEGORIES;
  const deities = content.deities.length > 0 ? content.deities : DEFAULT_DEITIES;
  const poojaBidhi = content.poojaBidhi.length > 0 ? content.poojaBidhi : DEFAULT_POOJA_BIDHI;
  const stories = content.stories.length > 0 ? content.stories : DEFAULT_STORIES;
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
        (stotra.alternateTitle?.toLowerCase().includes(queryText) ?? false) ||
        stotra.deity.toLowerCase().includes(queryText) ||
        stotra.category.toLowerCase().includes(queryText) ||
        stotra.content.toLowerCase().includes(queryText) ||
        (stotra.nepaliMeaning?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.wordMeaning?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.benefits?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.process?.toLowerCase().includes(queryText) ?? false) ||
        (stotra.tags?.some((tag) => tag.toLowerCase().includes(queryText)) ?? false);
      const matchesDeity = !activeDeity || stotra.deity === activeDeity;
      const matchesCategory = activeCategory === 'All' || stotra.category === activeCategory;

      return matchesSearch && matchesDeity && matchesCategory;
    });
  }, [activeCategory, activeDeity, searchQuery, stotras]);

  useEffect(() => {
    saveReaderFontSize(readerFontSize);
  }, [readerFontSize]);

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

  const syncContent = () => {
    setContent(getContentBundle());
    setFavoriteIds(getFavoriteIds());
    setContentSourceInfo(getContentSourceInfo());
  };

  const setMessage = (text: string, kind: ContentStatus['kind'] = 'neutral') => {
    setStatus({ text, kind });
  };

  const clearMessage = () => setStatus(null);

  const handleViewChange = (view: AppView) => {
    setActiveView(view);
    setIsMenuOpen(false);
    if (view === 'home') {
      setActiveCategory('All');
      setActiveDeity(null);
      clearMessage();
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
    addHistory(stotra);
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
      setMessage('Page link copied to clipboard when available.');
    } catch (error) {
      console.error('Share failed:', error);
      setMessage('Sharing is not available in this browser.', 'error');
    }
  };

  const handleFontSizeChange = (fontSize: ReaderFontSize) => {
    setReaderFontSizeState(fontSize);
    saveReaderFontSize(fontSize);
  };

  const handleSaveStotra = (input: StotraInput, id?: string): boolean => {
    setIsSaving(true);
    try {
      id ? updateStotra(id, input) : saveStotra(input);
      syncContent();
      setMessage('Stotra saved locally.');
      return true;
    } catch (error) {
      console.error('Save stotra failed:', error);
      setMessage('Could not save the stotra.', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStotra = (id: string) => {
    if (!confirm('Delete this stotra from local content?')) return;
    deleteStotra(id);
    removeFavorite(id);
    syncContent();
    setSelectedStotra((current) => (current?.id === id ? null : current));
    setMessage('Stotra deleted locally.');
  };

  const handleSaveCategory = (input: CategoryInput, id?: string): Category | null => {
    setIsSaving(true);
    try {
      const previous = id ? content.categories.find((category) => category.id === id) : undefined;
      const savedCategory = id ? updateCategory(id, input) : saveCategory(input);
      if (previous && previous.name !== savedCategory.name) {
        content.stotras
          .filter((stotra) => stotra.category === previous.name)
          .forEach((stotra) => {
            updateStotra(stotra.id, { ...stotra, category: savedCategory.name });
          });
      }
      syncContent();
      setMessage('Category saved locally.');
      return savedCategory;
    } catch (error) {
      console.error('Save category failed:', error);
      setMessage('Could not save the category.', 'error');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    const category = content.categories.find((item) => item.id === id);
    if (category && content.stotras.some((stotra) => stotra.category === category.name)) {
      setMessage('Move or update stotras using this category before deleting it.', 'error');
      return;
    }
    if (!confirm('Delete this category from local content?')) return;
    deleteCategory(id);
    syncContent();
    setMessage('Category deleted locally.');
  };

  const handleSaveDeity = (input: DeityInput, id?: string): Deity | null => {
    setIsSaving(true);
    try {
      const previous = id ? content.deities.find((deity) => deity.id === id) : undefined;
      const savedDeity = id ? updateDeity(id, input) : saveDeity(input);
      if (previous && previous.name !== savedDeity.name) {
        content.stotras
          .filter((stotra) => stotra.deity === previous.name)
          .forEach((stotra) => {
            updateStotra(stotra.id, { ...stotra, deity: savedDeity.name });
          });
      }
      syncContent();
      setMessage('Deity saved locally.');
      return savedDeity;
    } catch (error) {
      console.error('Save deity failed:', error);
      setMessage('Could not save the deity.', 'error');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDeity = (id: string) => {
    const deity = content.deities.find((item) => item.id === id);
    if (deity && content.stotras.some((stotra) => stotra.deity === deity.name)) {
      setMessage('Move or update stotras using this deity before deleting it.', 'error');
      return;
    }
    if (!confirm('Delete this deity from local content?')) return;
    deleteDeity(id);
    syncContent();
    setMessage('Deity deleted locally.');
  };

  const handleSavePoojaBidhi = (input: PoojaBidhiInput, id?: string): boolean => {
    setIsSaving(true);
    try {
      id ? updatePoojaBidhi(id, input) : savePoojaBidhi(input);
      syncContent();
      setMessage('Pooja Bidhi saved locally.');
      return true;
    } catch (error) {
      console.error('Save pooja failed:', error);
      setMessage('Could not save the pooja guide.', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePoojaBidhi = (id: string) => {
    if (!confirm('Delete this pooja guide from local content?')) return;
    deletePoojaBidhi(id);
    syncContent();
    setMessage('Pooja Bidhi deleted locally.');
  };

  const handleSaveStory = (input: HinduStoryInput, id?: string): boolean => {
    setIsSaving(true);
    try {
      id ? updateStory(id, input) : saveStory(input);
      syncContent();
      setMessage('Story saved locally.');
      return true;
    } catch (error) {
      console.error('Save story failed:', error);
      setMessage('Could not save the story.', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePanchangContent = (input: PanchangContentInput): boolean => {
    setIsSaving(true);
    try {
      savePanchangContent(input);
      syncContent();
      setMessage('Panchang guide saved locally.');
      return true;
    } catch (error) {
      console.error('Save Panchang failed:', error);
      setMessage('Could not save the Panchang guide.', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStory = (id: string) => {
    if (!confirm('Delete this story from local content?')) return;
    deleteStory(id);
    syncContent();
    setMessage('Story deleted locally.');
  };

  const handleExportAllContent = () => exportAllContent();

  const handleImportAllContent = (json: string): boolean => {
    setIsSaving(true);
    try {
      importAllContent(json);
      syncContent();
      setMessage('Content imported successfully.');
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      setMessage('Import failed. Please check the JSON format.', 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaultContent = () => {
    setIsSaving(true);
    try {
      resetToDefaultContent();
      clearFavorites();
      clearHistory();
      syncContent();
      setSelectedStotra(null);
      setActiveView('home');
      setActiveCategory('All');
      setActiveDeity(null);
      setMessage('Local content reset to default starter content.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdminUnlock = (passcode: string) => {
    if (!ADMIN_PASSCODE) {
      setMessage('Admin passcode is not configured.', 'error');
      return false;
    }
    if (passcode !== ADMIN_PASSCODE) {
      setMessage('Invalid admin passcode.', 'error');
      return false;
    }
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'unlocked');
    setAdminUnlocked(true);
    setMessage('Admin unlocked for this browser session.');
    return true;
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminUnlocked(false);
    setMessage('Admin logged out.');
    handleViewChange('home');
  };

  const handlePublishContent = async (): Promise<boolean> => {
    const password = window.prompt('Enter backend admin password to publish content') || '';
    if (!password) {
      setMessage('Backend admin password is required to publish.', 'error');
      return false;
    }
    setIsSaving(true);
    try {
      const result = await publishContentToGitHub(getContentBundle(), password);
      setMessage(result.message, result.ok ? 'neutral' : 'error');
      return result.ok;
    } finally {
      setIsSaving(false);
    }
  };

  const handleBrowseStotras = (deity: string) => {
    setActiveDeity(deity);
    setActiveView('stotras');
  };

  const handleNavigate = (view: 'stotras' | 'gods' | 'pooja' | 'stories' | 'panchang') => {
    handleViewChange(view);
  };

  return (
    <AppShell
      activeView={activeView}
      searchQuery={searchQuery}
      isMenuOpen={isMenuOpen}
      onSearchChange={handleSearchChange}
      onViewChange={handleViewChange}
      onToggleMenu={() => setIsMenuOpen((open) => !open)}
    >
      {status && activeView !== 'admin' && (
        <div className="page-container pt-6">
          <StateMessage title={status.kind === 'error' ? 'Notice' : 'Update'} message={status.text} tone={status.kind === 'error' ? 'error' : 'neutral'} />
        </div>
      )}

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
          poojaGuideCount={poojaBidhi.length}
          onBrowseStotras={handleBrowseStotras}
          onOpenAdmin={() => handleViewChange('admin')}
        />
      ) : activeView === 'pooja' ? (
        <PoojaPage poojaBidhi={poojaBidhi} />
      ) : activeView === 'stories' ? (
        <StoriesPage stories={stories} />
      ) : activeView === 'panchang' ? (
        <Panchang content={panchang} />
      ) : activeView === 'favorites' ? (
        <FavoritesPage
          favoriteStotras={favoriteStotras}
          favoriteStotraIds={favoriteIds}
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
          onSearchChange={handleSearchChange}
          onDeityChange={setActiveDeity}
          onCategoryChange={setActiveCategory}
          onNavigate={handleNavigate}
          onOpenStotra={handleOpenStotra}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      <StotraReader
        stotra={selectedStotra}
        fontSize={readerFontSize}
        isFavorite={selectedStotra ? favoriteIds.includes(selectedStotra.id) : false}
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
  onSubmit,
  onCancel,
}: {
  message: string | null;
  errorMessage: string | null;
  onSubmit: (passcode: string) => boolean;
  onCancel: () => void;
}) {
  const [passcode, setPasscode] = useState('');

  return (
    <main className="page-container page-shell">
      <section className="page-hero editorial-card admin-access-card">
        <p className="page-eyebrow">Admin Access</p>
        <h1 className="page-title">Unlock local content studio</h1>
        <p className="page-subtitle">
          Enter the admin passcode for this browser session. This is a simple v1 content gate, not production authentication.
        </p>
        {message && <StateMessage title="Admin" message={message} />}
        {errorMessage && <StateMessage title="Admin notice" message={errorMessage} tone="error" />}
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
            placeholder="Admin passcode"
            className="admin-input"
            autoComplete="current-password"
          />
          <div className="button-row">
            <button className="action-button" type="submit">
              Unlock Admin
            </button>
            <button className="secondary-button" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
