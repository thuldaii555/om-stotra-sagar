import { Search, Sparkles, SlidersHorizontal } from 'lucide-react';
import type { Category, Deity, Stotra } from '../../types';
import StateMessage from '../common/StateMessage';
import StotraCard from './StotraCard';

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
  onSearchChange,
  onDeityChange,
  onCategoryChange,
  onOpenStotra,
  onToggleFavorite,
}: StotrasPageProps) {
  const hasFilters = Boolean(searchQuery || activeDeity || activeCategory !== 'All');

  return (
    <main className="page-container page-shell stotras-page">
      <section className="page-hero editorial-card premium-hero-card">
        <div className="page-eyebrow">Stotras Library</div>
        <h1 className="page-title">Read and reflect through sacred stotras</h1>
        <p className="page-subtitle">
          Search by title, deity, category, or within the text. Open the reader to see meaning, benefits, source notes, and process when available.
        </p>

        <div className="hero-metric-row">
          <StatBadge label="Stotras" value={String(stotras.length || 20)} />
          <StatBadge label="Deities" value={String(deities.length)} />
          <StatBadge label="Categories" value={String(categories.length)} />
        </div>
      </section>

      <section className="section-band search-band">
        <div className="section-band-content">
          <div>
            <p className="section-kicker">Search and filters</p>
            <h2 className="section-heading">Find a reading quickly</h2>
            <p className="section-subtitle">Use the search field, deity chips, and category chips to narrow the library.</p>
          </div>
          {(searchQuery || activeDeity || activeCategory !== 'All') && (
            <button
              onClick={() => {
                onSearchChange('');
                onDeityChange(null);
                onCategoryChange('All');
              }}
              className="secondary-button"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="search-panel premium-search-panel">
          <div className="search-wrap search-wrap-wide">
            <input
              value={searchQuery}
              aria-label="Search stotras"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search title, deity, category, content, or tags..."
              className="search-bar"
            />
            <Search className="search-icon" size={18} />
          </div>

          <div className="filter-stack">
            <div className="filter-heading">
              <SlidersHorizontal size={16} />
              <span>Deities</span>
            </div>
            <div className="chip-row filter-chips">
              <button onClick={() => onDeityChange(null)} aria-pressed={activeDeity === null} className={`tag-chip ${activeDeity === null ? 'tag-chip-active' : ''}`}>
                All
              </button>
              {deities.map((deity, index) => (
                <button
                  key={deity.id}
                  onClick={() => onDeityChange(activeDeity === deity.name ? null : deity.name)}
                  aria-pressed={activeDeity === deity.name}
                  className={`tag-chip ${activeDeity === deity.name ? 'tag-chip-active' : ''} tag-chip-deity`}
                >
                  <span className={`chip-dot ${chipGradient(index)}`} />
                  {deity.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-stack">
            <div className="filter-heading">
              <SlidersHorizontal size={16} />
              <span>Categories</span>
            </div>
            <div className="chip-row filter-chips">
              <button onClick={() => onCategoryChange('All')} aria-pressed={activeCategory === 'All'} className={`tag-chip ${activeCategory === 'All' ? 'tag-chip-active' : ''}`}>
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.name)}
                  aria-pressed={activeCategory === category.name}
                  className={`tag-chip ${activeCategory === category.name ? 'tag-chip-active' : ''}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-band">
        <div className="section-band-content">
          <div>
            <p className="section-kicker">Collection</p>
            <h2 className="section-heading">Stotra library</h2>
            <p className="section-subtitle">A curated reading wall with meaning, benefits, source notes, and favorites.</p>
          </div>
          <p className="section-note">{filteredStotras.length} shown</p>
        </div>

        {isLoading ? (
          <StateMessage title="Loading stotras" message="Preparing the devotional library." />
        ) : stotras.length === 0 ? (
          <StateMessage title="No stotras yet" message="Use Admin to add verified texts or restore the starter collection." />
        ) : filteredStotras.length === 0 ? (
          <div className="empty-spotlight editorial-card">
            <div className="empty-spotlight-mark symbol-medallion">ॐ</div>
            <div className="empty-spotlight-copy">
              <h3 className="card-title">No matching stotras</h3>
              <p className="card-copy">Try another search term or clear the deity and category filters.</p>
              <button
                onClick={() => {
                  onSearchChange('');
                  onDeityChange(null);
                  onCategoryChange('All');
                }}
                className="action-button"
              >
                Clear filters
              </button>
            </div>
          </div>
        ) : (
          <div className="content-grid stotra-library-grid">
            {filteredStotras.map((stotra) => (
              <StotraCard
                key={stotra.id}
                stotra={stotra}
                isFavorite={favoriteStotraIds.includes(stotra.id)}
                onOpen={onOpenStotra}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-badge">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function chipGradient(index: number) {
  const palette = ['gradient-saffron', 'gradient-sand', 'gradient-emerald', 'gradient-indigo', 'gradient-rose', 'gradient-gold'];
  return palette[index % palette.length];
}
