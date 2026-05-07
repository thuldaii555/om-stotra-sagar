import type { ReactNode } from 'react';
import { Bookmark, BookOpen, Calendar, Feather, Home, Menu, ScrollText, Search, Sparkles, UserRound, X } from 'lucide-react';

export type AppView = 'home' | 'stotras' | 'gods' | 'pooja' | 'stories' | 'panchang' | 'favorites' | 'admin';

interface AppShellProps {
  activeView: AppView;
  searchQuery: string;
  isMenuOpen: boolean;
  children: ReactNode;
  onSearchChange: (value: string) => void;
  onViewChange: (view: AppView) => void;
  onToggleMenu: () => void;
}

export default function AppShell({
  activeView,
  searchQuery,
  isMenuOpen,
  children,
  onSearchChange,
  onViewChange,
  onToggleMenu,
}: AppShellProps) {
  return (
    <div className="site-shell app-shell">
      <header className="site-header premium-header app-header glass-nav">
        <div className="nav-bar">
          <button onClick={() => onViewChange('home')} className="brand brand-lockup" aria-label="Go to home">
            <span className="brand-mark">ॐ</span>
            <span className="brand-copy">
              <span className="brand-title">Om Stotra Sagar</span>
              <span className="brand-subtitle">Sanatan Devotional Library</span>
            </span>
          </button>

          <nav className="nav-menu nav-menu-desktop" aria-label="Primary navigation">
            <NavButton active={activeView === 'home'} onClick={() => onViewChange('home')} icon={<Home size={18} />} label="Home" />
            <NavButton active={activeView === 'stotras'} onClick={() => onViewChange('stotras')} icon={<ScrollText size={18} />} label="Stotras" />
            <NavButton active={activeView === 'gods'} onClick={() => onViewChange('gods')} icon={<Sparkles size={18} />} label="Gods" />
            <NavButton active={activeView === 'pooja'} onClick={() => onViewChange('pooja')} icon={<Feather size={18} />} label="Pooja Bidhi" />
            <NavButton active={activeView === 'stories'} onClick={() => onViewChange('stories')} icon={<BookOpen size={18} />} label="Stories" />
            <NavButton active={activeView === 'panchang'} onClick={() => onViewChange('panchang')} icon={<Calendar size={18} />} label="Panchang" />
            <NavButton active={activeView === 'favorites'} onClick={() => onViewChange('favorites')} icon={<Bookmark size={18} />} label="Favorites" />
            <NavButton active={activeView === 'admin'} onClick={() => onViewChange('admin')} icon={<UserRound size={18} />} label="Admin" />
          </nav>

          <div className="nav-actions">
            <button className="header-cta header-cta-desktop" onClick={() => onViewChange('stotras')}>
              Browse Stotras
            </button>
            <div className="search-wrap search-wrap-desktop">
              <input
                type="text"
                aria-label="Search stotras"
                placeholder="Search the library..."
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="search-bar"
              />
              <Search className="search-icon" size={16} />
            </div>

            <button className="menu-button" onClick={onToggleMenu} aria-label="Toggle navigation">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="nav-menu nav-menu-mobile">
            <button className="header-cta mobile-cta" onClick={() => onViewChange('stotras')}>
              Browse Stotras
            </button>
            <div className="search-wrap">
              <input
                type="text"
                aria-label="Search stotras"
                placeholder="Search the library..."
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="search-bar"
              />
              <Search className="search-icon" size={16} />
            </div>
            <div className="nav-stack">
              <NavButton full active={activeView === 'home'} onClick={() => onViewChange('home')} icon={<Home size={18} />} label="Home" />
              <NavButton full active={activeView === 'stotras'} onClick={() => onViewChange('stotras')} icon={<ScrollText size={18} />} label="Stotras" />
              <NavButton full active={activeView === 'gods'} onClick={() => onViewChange('gods')} icon={<Sparkles size={18} />} label="Gods" />
              <NavButton full active={activeView === 'pooja'} onClick={() => onViewChange('pooja')} icon={<Feather size={18} />} label="Pooja Bidhi" />
              <NavButton full active={activeView === 'stories'} onClick={() => onViewChange('stories')} icon={<BookOpen size={18} />} label="Stories" />
              <NavButton full active={activeView === 'panchang'} onClick={() => onViewChange('panchang')} icon={<Calendar size={18} />} label="Panchang" />
              <NavButton full active={activeView === 'favorites'} onClick={() => onViewChange('favorites')} icon={<Bookmark size={18} />} label="Favorites" />
              <NavButton full active={activeView === 'admin'} onClick={() => onViewChange('admin')} icon={<UserRound size={18} />} label="Admin" />
            </div>
          </div>
        )}
      </header>

      {children}

      <footer className="app-footer">
        <div className="app-footer-inner">
          <p className="footer-mantra">॥ ॐ नमो भगवते वासुदेवाय ॥</p>
          <p className="footer-note">A calm devotional reading space for everyday reflection, respectful learning, and quiet return.</p>
          <p className="footer-note">Texts, meanings, stories, and ritual guides should be verified with trusted sources, family tradition, or a priest before formal or public use. Om Stotra Sagar is intended for devotional reading and learning.</p>
          <div className="footer-links" aria-label="Footer quick links">
            <button onClick={() => onViewChange('home')} className="footer-link">Home</button>
            <button onClick={() => onViewChange('stotras')} className="footer-link">Stotras</button>
            <button onClick={() => onViewChange('gods')} className="footer-link">Gods</button>
            <button onClick={() => onViewChange('pooja')} className="footer-link">Pooja Bidhi</button>
            <button onClick={() => onViewChange('stories')} className="footer-link">Stories</button>
            <button onClick={() => onViewChange('panchang')} className="footer-link">Panchang</button>
          </div>
          <div className="footer-rule" />
          <p className="footer-copy">© {new Date().getFullYear()} Om Stotra Sagar</p>
        </div>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, full = false }: { active: boolean; onClick: () => void; icon: ReactNode; label: string; full?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`nav-item nav-link ${active ? 'nav-item-active nav-link-active' : ''} ${full ? 'nav-item-full' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
