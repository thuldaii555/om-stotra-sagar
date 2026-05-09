import { useState, type ReactNode } from 'react';
import { CalendarDays, Feather, Home, Menu, Moon, ScrollText, Search, Sparkles, Sun, UserRound, X } from 'lucide-react';

export type AppView = 'home' | 'stotras' | 'gods' | 'pooja' | 'stories' | 'panchang' | 'favorites' | 'admin';

interface AppShellProps {
  activeView: AppView;
  searchQuery: string;
  isMenuOpen: boolean;
  children: ReactNode;
  language: 'ne' | 'en';
  theme: 'light' | 'dark';
  labels: {
    home: string;
    library: string;
    gods: string;
    pooja: string;
    panchang: string;
    admin: string;
    search: string;
    more: string;
  };
  onSearchChange: (value: string) => void;
  onViewChange: (view: AppView) => void;
  onToggleMenu: () => void;
  onLanguageChange: (language: 'ne' | 'en') => void;
  onThemeChange: () => void;
}

export default function AppShell({
  activeView,
  searchQuery,
  isMenuOpen,
  children,
  language,
  theme,
  labels,
  onSearchChange,
  onViewChange,
  onToggleMenu,
  onLanguageChange,
  onThemeChange,
}: AppShellProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="site-shell app-shell">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="site-header premium-header app-header glass-nav">
        <div className="nav-bar">
          <button onClick={() => onViewChange('home')} className="brand-v2" aria-label="Home">
            <span className="brand-om">ॐ</span>
            <span className="brand-name">Om Stotra Sagar</span>
          </button>

          <nav className="nav-menu nav-menu-desktop" aria-label="Primary navigation">
            <NavButton active={activeView === 'home'} onClick={() => onViewChange('home')} icon={<Home size={18} />} label={labels.home} />
            <NavButton active={activeView === 'stotras'} onClick={() => onViewChange('stotras')} icon={<ScrollText size={18} />} label={labels.library} />
            <NavButton active={activeView === 'gods'} onClick={() => onViewChange('gods')} icon={<Sparkles size={18} />} label={labels.gods} />
            <NavButton active={activeView === 'pooja'} onClick={() => onViewChange('pooja')} icon={<Feather size={18} />} label={labels.pooja} />
            <NavButton active={activeView === 'panchang'} onClick={() => onViewChange('panchang')} icon={<CalendarDays size={18} />} label={labels.panchang} />
            <NavButton active={activeView === 'admin'} onClick={() => onViewChange('admin')} icon={<UserRound size={18} />} label={labels.admin} />
          </nav>

          <div className="nav-actions">
            <div className="nav-search-toggle">
              {searchOpen ? (
                <div className="nav-search-expanded">
                  <input
                    autoFocus
                    type="text"
                    aria-label="Search devotional library"
                    placeholder={`${labels.search}...`}
                    value={searchQuery}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="nav-search-input"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      onSearchChange('');
                    }}
                    className="nav-icon-btn"
                    aria-label="Close search"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setSearchOpen(true)} className="nav-icon-btn" aria-label="Search">
                  <Search size={18} />
                </button>
              )}
            </div>
            <button
              className="lang-toggle-btn"
              onClick={() => onLanguageChange(language === 'ne' ? 'en' : 'ne')}
              aria-label="Switch language"
            >
              {language === 'ne' ? 'EN' : 'नेपाली'}
            </button>
            <button className="nav-icon-btn" onClick={onThemeChange} aria-label="Toggle color theme" title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="menu-button" onClick={onToggleMenu} aria-label="Toggle navigation">
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="nav-menu nav-menu-mobile">
            <div className="search-wrap">
              <input
                type="text"
                aria-label="Search devotional library"
                placeholder={`${labels.search}...`}
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="search-bar"
              />
              <Search className="search-icon" size={16} />
            </div>
            <div className="nav-stack">
              <NavButton full active={activeView === 'home'} onClick={() => onViewChange('home')} icon={<Home size={18} />} label={labels.home} />
              <NavButton full active={activeView === 'stotras'} onClick={() => onViewChange('stotras')} icon={<ScrollText size={18} />} label={labels.library} />
              <NavButton full active={activeView === 'gods'} onClick={() => onViewChange('gods')} icon={<Sparkles size={18} />} label={labels.gods} />
              <NavButton full active={activeView === 'pooja'} onClick={() => onViewChange('pooja')} icon={<Feather size={18} />} label={labels.pooja} />
              <NavButton full active={activeView === 'panchang'} onClick={() => onViewChange('panchang')} icon={<CalendarDays size={18} />} label={labels.panchang} />
              <NavButton full active={activeView === 'admin'} onClick={() => onViewChange('admin')} icon={<UserRound size={18} />} label={labels.admin} />
            </div>
          </div>
        )}
      </header>

      <main id="main-content">
        {children}
      </main>

      <footer className="app-footer-v2">
        <div className="footer-v2-inner">
          <div className="footer-v2-left">
            <span className="footer-om">ॐ</span>
            <span className="footer-brand">Om Stotra Sagar</span>
          </div>
          <nav className="footer-v2-links" aria-label="Footer links">
            <button onClick={() => onViewChange('stotras')} className="footer-v2-link">{labels.library}</button>
            <button onClick={() => onViewChange('gods')} className="footer-v2-link">{labels.gods}</button>
            <button onClick={() => onViewChange('pooja')} className="footer-v2-link">{labels.pooja}</button>
            <button onClick={() => onViewChange('panchang')} className="footer-v2-link">{labels.panchang}</button>
          </nav>
          <p className="footer-v2-copy">© {new Date().getFullYear()} Om Stotra Sagar</p>
        </div>
      </footer>

      <nav className="bottom-nav" aria-label="Mobile primary navigation">
        <BottomNavTab active={activeView === 'home'} onClick={() => onViewChange('home')} icon={<Home size={20} />} label={labels.home} />
        <BottomNavTab active={activeView === 'stotras'} onClick={() => onViewChange('stotras')} icon={<ScrollText size={20} />} label={labels.library} />
        <BottomNavTab active={activeView === 'gods'} onClick={() => onViewChange('gods')} icon={<Sparkles size={20} />} label={labels.gods} />
        <BottomNavTab active={isMenuOpen} onClick={onToggleMenu} icon={<Menu size={20} />} label={labels.more} />
      </nav>
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

function BottomNavTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`bottom-nav-tab ${active ? 'active' : ''}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
