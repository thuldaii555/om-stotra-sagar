import { Bookmark, BookOpen, Sparkles } from 'lucide-react';
import type { Stotra } from '../../types';

interface StotraCardProps {
  key?: string;
  stotra: Stotra;
  isFavorite: boolean;
  onOpen: (stotra: Stotra) => void;
  onToggleFavorite: (stotra: Stotra) => void;
}

export default function StotraCard({ stotra, isFavorite, onOpen, onToggleFavorite }: StotraCardProps) {
  const tags = stotra.tags.slice(0, 4);
  const devanagariInitial = stotra.alternateTitle?.trim().charAt(0) || 'ॐ';

  return (
    <article className="stotra-card-premium devotional-card stotra-card">
      <div className="card-image-surface gradient-saffron stotra-card-top">
        <div className="card-image-medallion stotra-card-medallion">{devanagariInitial}</div>
        <div className="stotra-top-badges">
          <span className="badge-chip">{stotra.category}</span>
          {stotra.nepaliMeaning && (
            <span className="badge badge-inline">
              <Sparkles size={14} />
              Meaning
            </span>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="card-header-row">
          <div className="stotra-title-block">
            <h3 className="card-title">{stotra.title}</h3>
            {stotra.alternateTitle && <p className="devanagari-line">{stotra.alternateTitle}</p>}
          </div>
        </div>

        <div className="stotra-meta-row">
          <span>{stotra.deity}</span>
              <span className="meta-dot">•</span>
              <span>{stotra.category}</span>
              {stotra.process && (
                <>
                  <span className="meta-dot">•</span>
                  <span>How to Recite</span>
                </>
              )}
        </div>

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

        <div className="stotra-card-notes">
          {stotra.nepaliMeaning && <span className="tiny-note">Meaning</span>}
          {stotra.benefits && <span className="tiny-note">Benefits</span>}
          {stotra.source && <span className="tiny-note">Source</span>}
        </div>

        <div className="spotlight-actions">
          <button onClick={() => onOpen(stotra)} className="action-button" aria-label={`Read ${stotra.title}`}>
            <BookOpen size={18} />
            <span>Read Stotra</span>
          </button>
          <button
            onClick={() => onToggleFavorite(stotra)}
            className={`secondary-button icon-toggle ${isFavorite ? 'icon-toggle-active' : ''}`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Save favorite'}
          >
            <Bookmark size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </article>
  );
}
