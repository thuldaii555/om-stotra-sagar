import { Bookmark, ChevronRight } from 'lucide-react';
import type { Stotra } from '../../types';
import { getLocalizedCategoryName, getLocalizedContentTitle, getLocalizedDeityName } from '../../utils/localization';

interface StotraCardProps {
  key?: string;
  stotra: Stotra;
  isFavorite: boolean;
  searchQuery?: string;
  language: 'ne' | 'en';
  onOpen: (stotra: Stotra) => void;
  onToggleFavorite: (stotra: Stotra) => void;
}

function highlightText(text: string, query = '') {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={`${part}-${index}`} className="search-highlight">{part}</mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </>
  );
}

export default function StotraCard({ stotra, isFavorite, onOpen, onToggleFavorite, searchQuery = '', language }: StotraCardProps) {
  const title = getLocalizedContentTitle(stotra, language);
  const deity = getLocalizedDeityName(stotra.deityNe || stotra.deity, language);
  const category = getLocalizedCategoryName(stotra.categoryNe || stotra.category, language);

  return (
    <article className="stotra-card-v2">
      <button className="stotra-card-main" onClick={() => onOpen(stotra)} aria-label={language === 'ne' ? `${title} खोल्नुहोस्` : `Open ${stotra.title}`}>
        <div className="sc-initial">{title.charAt(0)}</div>
        <div className="sc-body">
          <p className="sc-title">{highlightText(title, searchQuery)}</p>
          <p className="sc-meta">
            {highlightText(deity, searchQuery)}
            <span className="sc-dot">·</span>
            <span className="sc-category">{category}</span>
          </p>
          {stotra.tags.length > 0 && (
            <p className="sc-tags">{stotra.tags.slice(0, 3).map((tag) => `#${tag}`).join(' ')}</p>
          )}
        </div>
        <ChevronRight size={15} className="sc-arrow" />
      </button>
      <button
        className={`sc-fav ${isFavorite ? 'sc-fav-active' : ''}`}
        onClick={() => onToggleFavorite(stotra)}
        aria-label={isFavorite ? (language === 'ne' ? 'मनपर्नेबाट हटाउनुहोस्' : 'Remove from favorites') : (language === 'ne' ? 'मनपर्नेमा थप्नुहोस्' : 'Add to favorites')}
      >
        <Bookmark size={14} fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
    </article>
  );
}
