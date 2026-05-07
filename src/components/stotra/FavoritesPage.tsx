import type { Stotra } from '../../types';
import StotraCard from './StotraCard';

interface FavoritesPageProps {
  favoriteStotras: Stotra[];
  favoriteStotraIds: string[];
  onOpenStotra: (stotra: Stotra) => void;
  onToggleFavorite: (stotra: Stotra) => void;
  onBrowseStotras: () => void;
}

export default function FavoritesPage({ favoriteStotras, favoriteStotraIds, onOpenStotra, onToggleFavorite, onBrowseStotras }: FavoritesPageProps) {
  return (
    <main className="page-container page-shell favorites-page">
      <section className="page-hero editorial-card">
        <p className="page-eyebrow">Saved locally</p>
        <h1 className="page-title">Favorites</h1>
        <p className="page-subtitle">Keep the stotras you return to most often in one quiet place.</p>
      </section>

      {favoriteStotras.length === 0 ? (
        <div className="empty-state editorial-card devotional-card">
          <div className="symbol-medallion empty-medallion">ॐ</div>
          <h2 className="card-title">No favorites saved yet</h2>
          <p className="card-copy">
            Use the bookmark button on a stotra to save it here. Your favorites stay in this browser and can be revisited anytime.
          </p>
          <button onClick={onBrowseStotras} className="action-button">
            Browse stotras
          </button>
        </div>
      ) : (
        <div className="content-grid card-deck">
          {favoriteStotras.map((stotra) => (
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
    </main>
  );
}
