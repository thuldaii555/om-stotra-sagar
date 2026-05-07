import { useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Deity, Stotra } from '../../types';

interface GodsPageProps {
  deities: Deity[];
  stotras: Stotra[];
  poojaGuideCount: number;
  onBrowseStotras: (deity: string) => void;
  onOpenAdmin?: () => void;
}

export default function GodsPage({ deities, stotras, poojaGuideCount, onBrowseStotras, onOpenAdmin }: GodsPageProps) {
  const relatedCount = useMemo(() => {
    const counts = new Map<string, number>();
    stotras.forEach((stotra) => {
      counts.set(stotra.deity, (counts.get(stotra.deity) || 0) + 1);
    });
    return counts;
  }, [stotras]);

  const totals = {
    deities: deities.length,
    stotras: stotras.length,
    guides: poojaGuideCount,
  };

  return (
    <main className="page-container page-shell gods-page">
      <section className="page-hero premium-hero-card">
        <div className="gods-hero">
          <div className="gods-hero-copy">
            <p className="page-eyebrow">Gods &amp; Goddesses</p>
            <h1 className="page-title">Explore Gods &amp; Goddesses</h1>
            <p className="page-subtitle">
              Learn about deities, their significance, mantras, and related devotional texts.
            </p>

            <div className="chip-row gods-stat-grid" aria-label="Deity gallery stats">
              <StatBadge label="Deities" value={totals.deities} />
              <StatBadge label="Stotras" value={totals.stotras} />
              <StatBadge label="Pooja Guides" value={totals.guides} />
            </div>
          </div>

          <div className="gods-hero-visual visual-card">
            <div className="gods-hero-visual-window">
              <div className="gods-hero-visual-arch">
                <div className="symbol-medallion gods-hero-medallion">ॐ</div>
                <div className="gods-hero-visual-copy">
                  <strong>Deity Profiles</strong>
                  <p>Symbolic visuals, concise guidance, and related devotional texts in one gallery.</p>
                </div>
              </div>

              <div className="gods-hero-mini-grid">
                <MiniPanel icon={<Sparkles size={18} />} title="Read with context" text="See meaning, significance, and mantras together." />
                <MiniPanel icon={<ArrowRight size={18} />} title="Jump to stotras" text="Open related devotional texts with one tap." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {deities.length === 0 ? (
        <section className="empty-state premium-empty-state deity-empty-state">
          <div className="symbol-medallion deity-empty-medallion">ॐ</div>
          <div className="empty-state-copy">
            <h2 className="card-title">No deities available yet</h2>
            <p className="card-copy">Add deity profiles from the Local Content Studio to build this gallery.</p>
          </div>
          {onOpenAdmin && (
            <button onClick={onOpenAdmin} className="action-button">
              Open Admin
            </button>
          )}
        </section>
      ) : (
        <section className="content-grid deity-gallery">
          {deities.map((deity, index) => (
            <DeityCard
              key={deity.id}
              deity={deity}
              accentClass={deity.theme || deityAccentClass(index)}
              relatedCount={relatedCount.get(deity.name) || 0}
              onBrowseStotras={onBrowseStotras}
            />
          ))}
        </section>
      )}
    </main>
  );
}

function DeityCard({
  key: _key,
  deity,
  accentClass,
  relatedCount,
  onBrowseStotras,
}: {
  key?: string;
  deity: Deity;
  accentClass: string;
  relatedCount: number;
  onBrowseStotras: (deity: string) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(deity.imageUrl) && !imageFailed;
  const symbol = deity.sanskritName?.trim().charAt(0) || deity.name.trim().charAt(0) || 'ॐ';

  return (
    <article className={`deity-profile-card deity-card-premium visual-card ${accentClass}`}>
      <div className="deity-visual deity-visual-band">
        {hasImage ? (
          <div className="deity-image-shell deity-image-preview">
            <img
              src={deity.imageUrl}
              alt={deity.name}
              className="deity-image"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          </div>
        ) : (
          <div className="deity-fallback deity-fallback-premium">
            <div className="symbol-medallion deity-medallion">{symbol}</div>
          </div>
        )}

        <div className="deity-top-copy">
          <span className="badge-chip">Deity Profile</span>
          <h2 className="card-title">{deity.name}</h2>
          {deity.sanskritName && <p className="devanagari-line deity-line">{deity.sanskritName}</p>}
        </div>
      </div>

      <div className="deity-body deity-card-body">
        <div className="deity-summary">
          <p className="card-copy">{deity.description}</p>
        </div>

        <section className="content-block">
          <p className="page-eyebrow">Significance</p>
          <div className="soft-divider" />
          <p className="reader-paragraph">{deity.significance}</p>
        </section>

        {deity.mantra && (
          <section className="content-block mantra-callout">
            <p className="page-eyebrow">Mantra</p>
            <div className="soft-divider" />
            <p className="reader-paragraph devanagari-line">{deity.mantra}</p>
          </section>
        )}

        {deity.tags.length > 0 && (
          <div className="chip-row deity-tag-row">
            {deity.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="tag-chip tag-chip-muted">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <button onClick={() => onBrowseStotras(deity.name)} className="related-stotra-button action-button">
          View Related Stotras <ArrowRight size={16} />
          <span className="badge-inline">{relatedCount}</span>
        </button>
      </div>
    </article>
  );
}

function StatBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-badge gods-stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function MiniPanel({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="visual-mini-card gods-mini-card">
      <span className="mini-icon">{icon}</span>
      <span className="mini-title">{title}</span>
      <p className="mini-copy">{text}</p>
    </div>
  );
}

function deityAccentClass(index: number) {
  const palette = ['gradient-saffron', 'gradient-sand', 'gradient-emerald', 'gradient-indigo', 'gradient-rose', 'gradient-gold'];
  return palette[index % palette.length];
}
