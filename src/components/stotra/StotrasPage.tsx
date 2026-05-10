import { Search } from 'lucide-react';
import type { Category, Deity, Stotra } from '../../types';
import StateMessage from '../common/StateMessage';
import StotraCard from './StotraCard';
import { getLocalizedCategoryName, getLocalizedDeityName } from '../../utils/localization';

interface StotrasPageProps {
  stotras: Stotra[];
  categories: Category[];
  deities: Deity[];
  filteredStotras: Stotra[];
  searchQuery: string;
  activeDeity: string | null;
  activeCategory: string;
  isLoading: boolean;
  favoriteStotraIds: string[];
  language: 'ne' | 'en';
  onSearchChange: (value: string) => void;
  onDeityChange: (deity: string | null) => void;
  onCategoryChange: (category: string) => void;
  onOpenStotra: (stotra: Stotra) => void;
  onToggleFavorite: (stotra: Stotra) => void;
}

export default function StotrasPage({
  stotras,
  categories,
  deities,
  filteredStotras,
  searchQuery,
  activeDeity,
  activeCategory,
  isLoading,
  favoriteStotraIds,
  language,
  onSearchChange,
  onDeityChange,
  onCategoryChange,
  onOpenStotra,
  onToggleFavorite,
}: StotrasPageProps) {
  const hasFilters = Boolean(searchQuery || activeDeity || activeCategory !== 'All');
  const recommendedStotras = stotras.slice(0, 6);
  const displayStotras = hasFilters ? filteredStotras : recommendedStotras;
  const text = language === 'ne'
    ? {
        searchPlaceholder: 'शीर्षक, देवता, श्रेणी, सामग्री, वा ट्याग खोज्नुहोस्...',
        allDeities: 'सबै देवता',
        clear: 'खाली गर्नुहोस्',
        all: 'सबै',
        recommended: 'सिफारिस गरिएको',
        featured: 'चयनित भक्तिपूर्ण पाठहरू',
        results: 'नतिजा',
        loadingTitle: 'पुस्तकालय लोड हुँदैछ',
        loadingMessage: 'भक्तिपूर्ण सामग्री तयार हुँदैछ।',
        emptyTitle: 'अहिलेसम्म सामग्री छैन',
        emptyMessage: 'Admin बाट जाँचिएको सामग्री थप्नुहोस् वा starter collection पुनर्स्थापित गर्नुहोस्।',
        noMatchTitle: 'मिल्ने सामग्री भेटिएन',
        noMatchMessage: 'अर्को खोज शब्द प्रयोग गर्नुहोस् वा देवता/श्रेणी फिल्टर खाली गर्नुहोस्।',
        clearFilters: 'फिल्टर खाली गर्नुहोस्',
      }
    : {
        searchPlaceholder: 'Search title, deity, category, content, or tags...',
        allDeities: 'All Deities',
        clear: 'Clear',
        all: 'All',
        recommended: 'Recommended',
        featured: 'Featured devotional texts',
        results: 'results',
        loadingTitle: 'Loading library',
        loadingMessage: 'Preparing the devotional library.',
        emptyTitle: 'No content yet',
        emptyMessage: 'Use Admin to add verified texts or restore the starter collection.',
        noMatchTitle: 'No matching content',
        noMatchMessage: 'Try another search term or clear the deity and category filters.',
        clearFilters: 'Clear filters',
      };

  return (
    <main className="stotras-page-v2">
      <div className="search-wrap search-wrap-wide">
        <input
          value={searchQuery}
          aria-label={language === 'ne' ? 'भक्तिपूर्ण सामग्री खोज्नुहोस्' : 'Search devotional content'}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={text.searchPlaceholder}
          className="search-bar"
        />
        <Search className="search-icon" size={18} />
      </div>

      <div className="stotras-filter-bar">
        <select
          className="admin-input compact-input"
          value={activeDeity || 'All'}
          aria-label={language === 'ne' ? 'देवताअनुसार छान्नुहोस्' : 'Filter by deity'}
          onChange={(event) => onDeityChange(event.target.value === 'All' ? null : event.target.value)}
        >
          <option value="All">{text.allDeities}</option>
          {deities.map((deity) => (
            <option key={deity.id} value={deity.name}>{getLocalizedDeityName(deity, language)}</option>
          ))}
        </select>

        <button onClick={() => onCategoryChange('All')} aria-pressed={activeCategory === 'All'} className={`tag-chip ${activeCategory === 'All' ? 'tag-chip-active' : ''}`}>
          {text.all}
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.name)}
            aria-pressed={activeCategory === category.name}
            className={`tag-chip ${activeCategory === category.name ? 'tag-chip-active' : ''}`}
          >
            {getLocalizedCategoryName(category, language)}
          </button>
        ))}
        {hasFilters && (
          <button
          onClick={() => {
              onSearchChange('');
              onDeityChange(null);
              onCategoryChange('All');
            }}
            className="secondary-button"
          >
            {text.clear}
          </button>
        )}
      </div>

      <div className="stotras-collection-header">
        {!hasFilters ? (
          <div>
            <p className="section-kicker">{text.recommended}</p>
            <h2 className="section-heading">{text.featured}</h2>
          </div>
        ) : (
          <p className="stotras-result-count">{filteredStotras.length} {text.results}</p>
        )}
      </div>

      {isLoading ? (
        <StateMessage title={text.loadingTitle} message={text.loadingMessage} />
      ) : stotras.length === 0 ? (
        <StateMessage title={text.emptyTitle} message={text.emptyMessage} />
      ) : hasFilters && filteredStotras.length === 0 ? (
        <div className="empty-spotlight editorial-card">
          <div className="empty-spotlight-copy">
            <h3 className="card-title">{text.noMatchTitle}</h3>
            <p className="card-copy">{text.noMatchMessage}</p>
            <button
              onClick={() => {
                onSearchChange('');
                onDeityChange(null);
                onCategoryChange('All');
              }}
              className="action-button"
            >
              {text.clearFilters}
            </button>
          </div>
        </div>
      ) : (
        <div className="stotra-list-container">
          {displayStotras.map((stotra) => (
            <StotraCard
              key={stotra.id}
              stotra={stotra}
              isFavorite={favoriteStotraIds.includes(stotra.id)}
              searchQuery={searchQuery}
              onOpen={onOpenStotra}
              onToggleFavorite={onToggleFavorite}
              language={language}
            />
          ))}
        </div>
      )}
    </main>
  );
}
