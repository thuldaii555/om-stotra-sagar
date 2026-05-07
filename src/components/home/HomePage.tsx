import { ArrowRight, BookOpen, Calendar, Feather, Heart, Sparkles, ScrollText, ShieldCheck, Users } from 'lucide-react';
import type { Category, Deity, HinduStory, PoojaBidhi, Stotra } from '../../types';
import StateMessage from '../common/StateMessage';

interface HomePageProps {
  stotras: Stotra[];
  deities: Deity[];
  categories: Category[];
  poojaBidhi: PoojaBidhi[];
  stories: HinduStory[];
  filteredStotras: Stotra[];
  searchQuery: string;
  activeDeity: string | null;
  activeCategory: string;
  isLoading: boolean;
  favoriteStotraIds: string[];
  onSearchChange: (value: string) => void;
  onDeityChange: (deity: string | null) => void;
  onCategoryChange: (category: string) => void;
  onNavigate: (view: 'stotras' | 'gods' | 'pooja' | 'stories' | 'panchang') => void;
  onOpenStotra: (stotra: Stotra) => void;
  onToggleFavorite: (stotra: Stotra) => void;
}

export default function HomePage({
  stotras,
  deities,
  categories,
  poojaBidhi,
  stories,
  filteredStotras,
  searchQuery,
  activeDeity,
  activeCategory,
  isLoading,
  favoriteStotraIds,
  onDeityChange,
  onCategoryChange,
  onNavigate,
  onOpenStotra,
  onToggleFavorite,
}: HomePageProps) {
  const hasFilters = Boolean(searchQuery || activeDeity || activeCategory !== 'All');
  const journeyCards = [
    {
      title: 'Stotra Library',
      description: 'Read devotional texts with meanings, benefits, sources, and print-ready reading mode.',
      icon: <ScrollText size={24} />,
      view: 'stotras' as const,
    },
    {
      title: 'Gods & Goddesses',
      description: 'Explore devotional profiles, symbolism, mantras, and related readings.',
      icon: <Sparkles size={24} />,
      view: 'gods' as const,
    },
    {
      title: 'Pooja Bidhi',
      description: 'Follow simple ritual guidance with samagri, steps, and practical cautions.',
      icon: <Feather size={24} />,
      view: 'pooja' as const,
    },
    {
      title: 'Sacred Stories',
      description: 'Read short family-friendly Hindu stories with a clear devotional lesson.',
      icon: <BookOpen size={24} />,
      view: 'stories' as const,
    },
    {
      title: 'Panchang Guide',
      description: 'Use the educational Panchang guide for day-to-day timing concepts.',
      icon: <Calendar size={24} />,
      view: 'panchang' as const,
    },
  ];

  const benefitCards = [
    {
      title: 'Works without login',
      description: 'Open the site immediately and start reading with no account setup.',
      icon: <ShieldCheck size={22} />,
    },
    {
      title: 'Read with meaning',
      description: 'Stotras include meaning, benefits, source notes, and reading guidance when available.',
      icon: <BookOpen size={22} />,
    },
    {
      title: 'Save favorites locally',
      description: 'Keep a personal reading list in the browser and return to it later.',
      icon: <Heart size={22} />,
    },
    {
      title: 'Family-friendly learning',
      description: 'Explore devotional content, pooja guidance, and stories in a calm, respectful format.',
      icon: <Users size={22} />,
    },
  ];

  return (
    <>
      <section className="page-shell hero-section hero-banner">
        <div className="page-container hero-stage">
          <div className="hero-copy page-hero editorial-card premium-hero-card">
            <div className="page-eyebrow">Sanatan Devotional Library</div>
            <h1 className="page-title">A sacred space for stotras, pooja, and reflection</h1>
            <p className="page-subtitle">
              Read devotional texts, understand their meaning, explore deities, follow simple pooja guidance, and learn timeless Hindu stories in one calm place.
            </p>

            <div className="button-row">
              <button onClick={() => onNavigate('stotras')} className="action-button">
                Browse Stotras
              </button>
              <button onClick={() => onNavigate('pooja')} className="secondary-button">
                Explore Pooja Bidhi
              </button>
            </div>

            <div className="hero-note-card devotional-note editorial-card">
              <p className="page-eyebrow">Opening line</p>
              <p className="hero-sanskrit">ॐ नमः शिवाय</p>
              <p className="body-copy">Begin with stillness, devotion, and clarity.</p>
            </div>

            <div className="hero-category-strip">
              <p className="hero-strip-label">Popular categories</p>
              <div className="chip-row">
                {categories.slice(0, 6).map((category) => (
                  <button key={category.id} onClick={() => onCategoryChange(category.name)} className="tag-chip tag-chip-muted">
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="hero-visual hero-visual-card visual-card premium-visual-card">
            <div className="hero-visual-arch">
              <div className="hero-arch-line" />
              <div className="hero-arch-window">
                <div className="symbol-medallion hero-medallion">ॐ</div>
                <div className="hero-visual-copy">
                  <p className="hero-panel-label">Read • Reflect • Preserve</p>
                  <p className="body-copy">
                    A devotional library designed for quiet reading, respectful learning, and daily return.
                  </p>
                </div>
              </div>
            </div>

            <div className="hero-stats">
              <StatBadge label="Stotras" value={`${Math.max(stotras.length, 20)}+`} />
              <StatBadge label="Deities" value="12" />
              <StatBadge label="Pooja Guides" value="8" />
              <StatBadge label="Stories" value="10" />
            </div>

            <div className="hero-mini-grid">
              {journeyCards.slice(0, 4).map((card) => (
                <button key={card.title} onClick={() => onNavigate(card.view)} className="visual-mini-card">
                  <span className="mini-icon">{card.icon}</span>
                  <span className="mini-title">{card.title}</span>
                  <span className="mini-copy">{card.description}</span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <main className="page-container home-page">
        <section className="section-band">
          <div className="section-band-content">
            <div>
              <p className="section-kicker">Start here</p>
              <h2 className="section-heading">Explore your devotional path</h2>
              <p className="section-subtitle">Five curated entry points designed for devotional reading, learning, and practice.</p>
            </div>
          </div>
          <div className="card-grid journey-grid">
            {journeyCards.map((card) => (
              <button key={card.title} onClick={() => onNavigate(card.view)} className="feature-card devotional-card journey-card">
                <div className="card-image-surface gradient-saffron">
                  <div className="card-image-medallion">{card.icon}</div>
                </div>
                <div className="card-body">
                  <div className="card-header-row">
                    <h3 className="card-title">{card.title}</h3>
                    <ArrowRight size={18} className="muted-arrow" />
                  </div>
                  <p className="card-copy">{card.description}</p>
                  <span className="soft-cta">Open section</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="section-band">
          <div className="section-band-content">
            <div>
              <p className="section-kicker">Featured stotras</p>
              <h2 className="section-heading">Start with the most visited readings</h2>
              <p className="section-subtitle">Three editorial cards to begin reading right away.</p>
            </div>
            <button onClick={() => onNavigate('stotras')} className="secondary-button">
              View all stotras
            </button>
          </div>
          {isLoading ? (
            <StateMessage title="Loading content" message="Preparing the local devotional library." />
          ) : stotras.length === 0 ? (
            <StateMessage title="No stotras available" message="Add content from Admin or restore the starter bundle." />
          ) : (
            <div className="card-grid featured-story-grid">
              {(filteredStotras.length > 0 ? filteredStotras : stotras).slice(0, 3).map((stotra) => (
                <StotraSpotlightCard
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

        <section className="section-band">
          <div className="section-band-content">
            <div>
              <p className="section-kicker">Explore by deity</p>
              <h2 className="section-heading">Featured deities</h2>
              <p className="section-subtitle">A compact gallery of the main devotional forms in the library.</p>
            </div>
          </div>
          <div className="card-grid deity-showcase-grid">
            {deities.slice(0, 6).map((deity, index) => (
              <button
                key={deity.id}
                onClick={() => onDeityChange(activeDeity === deity.name ? null : deity.name)}
                className={`deity-card-premium deity-showcase-card ${activeDeity === deity.name ? 'deity-card-active' : ''}`}
              >
                <div className={`deity-card-top visual-gradient-${showcaseGradient(index)}`}>
                  <div className="symbol-medallion deity-medallion">{deity.sanskritName?.trim().charAt(0) || 'ॐ'}</div>
                  <div className="deity-meta">
                    <h3 className="card-title">{deity.name}</h3>
                    {deity.sanskritName && <p className="devanagari-line">{deity.sanskritName}</p>}
                  </div>
                </div>
                <p className="card-copy">{deity.description}</p>
                <span className="soft-cta">View Stotras</span>
              </button>
            ))}
          </div>
        </section>

        <section className="section-band split-band">
          <div className="feature-panel devotional-card">
            <div className="card-image-surface gradient-gold">
              <div className="card-image-medallion">ॐ</div>
            </div>
            <div className="card-body">
              <p className="section-kicker">Pooja Bidhi</p>
              <h2 className="section-heading">Simple guidance for daily and festive puja</h2>
              <p className="section-subtitle">Browse short ritual guides with samagri, steps, benefits, and cautions.</p>
              <button onClick={() => onNavigate('pooja')} className="secondary-button">
                Open Pooja Bidhi
              </button>
            </div>
          </div>

          <div className="feature-panel devotional-card">
            <div className="card-image-surface gradient-indigo">
              <div className="card-image-medallion">✦</div>
            </div>
            <div className="card-body">
              <p className="section-kicker">Sacred Stories</p>
              <h2 className="section-heading">Family-friendly stories with a clear lesson</h2>
              <p className="section-subtitle">Read short Hindu stories that are calm, warm, and respectful for all ages.</p>
              <button onClick={() => onNavigate('stories')} className="secondary-button">
                Open Stories
              </button>
            </div>
          </div>
        </section>

        <section className="section-band">
          <div className="section-band-content">
            <div>
              <p className="section-kicker">Why use this site</p>
              <h2 className="section-heading">A calm devotional reading space</h2>
              <p className="section-subtitle">Designed for respectful, practical, and family-friendly browsing.</p>
            </div>
          </div>
          <div className="card-grid benefit-grid">
            {benefitCards.map((card) => (
              <div key={card.title} className="benefit-card editorial-card">
                <div className="benefit-icon">{card.icon}</div>
                <h3 className="card-title">{card.title}</h3>
                <p className="card-copy">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        {stories.length > 0 && (
          <section className="section-band">
            <div className="section-band-content">
              <div>
                <p className="section-kicker">More to explore</p>
                <h2 className="section-heading">Stories, timing, and reflection</h2>
                <p className="section-subtitle">Continue into the full library whenever you are ready.</p>
              </div>
            </div>
            <div className="card-grid split-mini-grid">
              <button onClick={() => onNavigate('panchang')} className="feature-card devotional-card mini-feature-card">
                <div className="card-image-surface gradient-emerald">
                  <div className="card-image-medallion">☼</div>
                </div>
                <div className="card-body">
                  <h3 className="card-title">Panchang Guide</h3>
                  <p className="card-copy">A clear educational guide to the daily timing terms used in devotional life.</p>
                </div>
              </button>

              <button onClick={() => onNavigate('stories')} className="feature-card devotional-card mini-feature-card">
                <div className="card-image-surface gradient-rose">
                  <div className="card-image-medallion">✦</div>
                </div>
                <div className="card-body">
                  <h3 className="card-title">Story Archive</h3>
                  <p className="card-copy">Short sacred stories that are simple, warm, and meaningful for family reading.</p>
                </div>
              </button>
            </div>
          </section>
        )}

        {hasFilters && filteredStotras.length === 0 && !isLoading ? (
          <StateMessage title="No matching stotras" message="Try another search term or clear the deity and category filters." />
        ) : null}
      </main>
    </>
  );
}

function StotraSpotlightCard({
  key: _key,
  stotra,
  isFavorite,
  onOpen,
  onToggleFavorite,
}: {
  key?: string;
  stotra: Stotra;
  isFavorite: boolean;
  onOpen: (stotra: Stotra) => void;
  onToggleFavorite: (stotra: Stotra) => void;
}) {
  const tags = stotra.tags.slice(0, 3);

  return (
    <article className="feature-card devotional-card stotra-spotlight-card">
      <div className="card-image-surface gradient-saffron">
        <div className="card-image-medallion">ॐ</div>
      </div>
      <div className="card-body">
        <span className="badge badge-chip">{stotra.category}</span>
        <h3 className="card-title">{stotra.title}</h3>
        <p className="card-copy">{stotra.deity}</p>
        <p className="card-copy stotra-preview">{stotra.content}</p>
        {tags.length > 0 && (
          <div className="chip-row">
            {tags.map((tag) => (
              <span key={tag} className="tag-chip tag-chip-muted">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="spotlight-actions">
          <button onClick={() => onOpen(stotra)} className="action-button">
            Read Stotra
          </button>
          <button onClick={() => onToggleFavorite(stotra)} className={`secondary-button ${isFavorite ? 'chip-active' : ''}`}>
            {isFavorite ? 'Saved' : 'Favorite'}
          </button>
        </div>
      </div>
    </article>
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

function showcaseGradient(index: number) {
  const palette = ['saffron', 'sand', 'emerald', 'indigo', 'rose', 'gold'];
  return palette[index % palette.length];
}
