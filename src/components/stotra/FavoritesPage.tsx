import type { Stotra } from '../../types';
import StotraCard from './StotraCard';

interface FavoritesPageProps {
  favoriteStotras: Stotra[];
  favoriteStotraIds: string[];
  language: 'ne' | 'en';
  onOpenStotra: (stotra: Stotra) => void;
  onToggleFavorite: (stotra: Stotra) => void;
  onBrowseStotras: () => void;
}

export default function FavoritesPage({ favoriteStotras, favoriteStotraIds, language, onOpenStotra, onToggleFavorite, onBrowseStotras }: FavoritesPageProps) {
  const copy = language === 'ne'
    ? {
        eyebrow: 'स्थानीय रूपमा सुरक्षित',
        title: 'मनपर्ने',
        subtitle: 'बारम्बार पढ्ने भक्तिपाठहरू एकै ठाउँमा राख्नुहोस्।',
        emptyTitle: 'अहिलेसम्म मनपर्ने सामग्री छैन',
        emptyCopy: 'कुनै स्तोत्र मनपर्नेमा राख्न बुकमार्क बटन प्रयोग गर्नुहोस्। मनपर्ने सामग्री यही ब्राउजरमा रहन्छ।',
        openLibrary: 'पुस्तकालय खोल्नुहोस्',
      }
    : {
        eyebrow: 'Saved locally',
        title: 'Favorites',
        subtitle: 'Keep the devotional readings you return to most often in one quiet place.',
        emptyTitle: 'No favorites saved yet',
        emptyCopy: 'Use the bookmark button on a stotra to save it here. Your favorites stay in this browser and can be revisited anytime.',
        openLibrary: 'Open Library',
      };
  return (
    <main className="page-container page-shell favorites-page">
      <section className="page-hero editorial-card">
        <p className="page-eyebrow">{copy.eyebrow}</p>
        <h1 className="page-title">{copy.title}</h1>
        <p className="page-subtitle">{copy.subtitle}</p>
      </section>

      {favoriteStotras.length === 0 ? (
        <div className="empty-state editorial-card devotional-card">
          <div className="symbol-medallion empty-medallion">ॐ</div>
          <h2 className="card-title">{copy.emptyTitle}</h2>
          <p className="card-copy">{copy.emptyCopy}</p>
          <button onClick={onBrowseStotras} className="action-button">
            {copy.openLibrary}
          </button>
        </div>
      ) : (
        <div className="content-grid card-deck">
          {favoriteStotras.map((stotra) => (
            <StotraCard
              key={stotra.id}
              stotra={stotra}
              isFavorite={favoriteStotraIds.includes(stotra.id)}
              language={language}
              onOpen={onOpenStotra}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </main>
  );
}
