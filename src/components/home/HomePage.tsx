import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronRight, Feather, ScrollText, Search, Sparkles } from 'lucide-react';
import type { Category, Deity, HinduStory, HistoryItem, PoojaBidhi, Stotra } from '../../types';
import StateMessage from '../common/StateMessage';
import { formatZonedDateTime } from '../../utils/dateTime';
import {
  getLocalizedCategoryName,
  getLocalizedContentTitle,
  getLocalizedDeityName,
  getLocalizedPoojaTitle,
  getLocalizedText,
  includesLocalizedQuery,
} from '../../utils/localization';

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
  history: HistoryItem[];
  language: 'ne' | 'en';
  onSearchChange: (value: string) => void;
  onDeityChange: (deity: string | null) => void;
  onOpenPooja: (pooja: PoojaBidhi) => void;
  onCategoryChange: (category: string) => void;
  onNavigate: (view: 'stotras' | 'gods' | 'pooja' | 'panchang') => void;
  onOpenStotra: (stotra: Stotra) => void;
  onToggleFavorite: (stotra: Stotra) => void;
}

const getDailyStoraIndex = (stotras: Stotra[]): number => {
  if (stotras.length === 0) return 0;
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dayOfYear % stotras.length;
};

const VARA_INFO = [
  { en: 'Sunday (Ravivar)', ne: 'आइतबार', deityEn: 'Surya Dev', deityNe: 'सूर्य देव' },
  { en: 'Monday (Somvar)', ne: 'सोमबार', deityEn: 'Lord Shiva', deityNe: 'भगवान् शिव' },
  { en: 'Tuesday (Mangalvar)', ne: 'मंगलबार', deityEn: 'Lord Hanuman & Devi', deityNe: 'हनुमानजी र देवी' },
  { en: 'Wednesday (Budhvar)', ne: 'बुधबार', deityEn: 'Lord Ganesha & Vishnu', deityNe: 'गणेशजी र भगवान् विष्णु' },
  { en: 'Thursday (Brihaspativar)', ne: 'बिहीबार', deityEn: 'Lord Vishnu & Guru', deityNe: 'भगवान् विष्णु र गुरु' },
  { en: 'Friday (Shukravar)', ne: 'शुक्रबार', deityEn: 'Devi Lakshmi & Devi', deityNe: 'देवी लक्ष्मी र देवी' },
  { en: 'Saturday (Shanivar)', ne: 'शनिबार', deityEn: 'Lord Shani & Hanuman', deityNe: 'शनिदेव र हनुमानजी' },
] as const;

export default function HomePage({
  stotras,
  deities,
  poojaBidhi,
  filteredStotras,
  isLoading,
  history,
  language,
  onDeityChange,
  onOpenPooja,
  onNavigate,
  onOpenStotra,
}: HomePageProps) {
  const [homeSearch, setHomeSearch] = useState('');
  const [now, setNow] = useState(() => new Date());
  const featuredContent = (filteredStotras.length > 0 ? filteredStotras : stotras).slice(0, 5);
  const dailyStotra = stotras.length > 0 ? stotras[getDailyStoraIndex(stotras)] : null;
  const vara = VARA_INFO[new Date().getDay()];
  const kathmanduInfo = useMemo(() => formatZonedDateTime(now, 'Asia/Kathmandu', language === 'ne' ? 'काठमाडौं, नेपाल' : 'Kathmandu, Nepal', language), [language, now]);
  const recentStotras = history
    .slice(0, 3)
    .map((item) => stotras.find((stotra) => stotra.id === item.stotraId))
    .filter((stotra): stotra is Stotra => Boolean(stotra));
  const copy = language === 'ne'
    ? {
        title: 'ओम स्तोत्र सागर',
        tagline: 'पवित्र ग्रन्थ, देवता परिचय, र पूजा मार्गदर्शन — नेपाली र संस्कृतमा।',
        dailyStotra: 'आजको स्तोत्र',
        recentlyRead: 'हालै पढिएको',
        featured: 'चयनित स्तोत्रहरू',
        explore: 'अन्वेषण',
        deityProfiles: 'देवता प्रोफाइल',
        godsCount: 'देवता र देवीहरू',
        poojaGuides: 'पूजा मार्गदर्शन',
        ritualGuides: 'पूजा विधि',
        almanac: 'पञ्चाङ्ग',
        almanacGuide: 'हिन्दू पात्रो मार्गदर्शन',
        search: 'खोज्नुहोस्',
        noContent: 'अहिलेसम्म सामग्री छैन',
        noContentCopy: 'Admin बाट जाँचिएको सामग्री थप्नुहोस् वा starter collection पुनर्स्थापित गर्नुहोस्।',
        loadingTitle: 'सामग्री लोड हुँदैछ',
        loadingMessage: 'भक्तिपूर्ण पुस्तकालय तयार हुँदैछ।',
        featuredInLibrary: 'पुस्तकालयमा',
      }
    : {
        title: 'Om Stotra Sagar',
        tagline: 'Sacred texts, deity guides, and pooja wisdom — in Nepali and Sanskrit.',
        dailyStotra: "Today's Stotra",
        recentlyRead: 'Recently Read',
        featured: 'Featured Stotras',
        explore: 'Explore',
        deityProfiles: 'Deity Profiles',
        godsCount: 'gods and goddesses',
        poojaGuides: 'Pooja Guides',
        ritualGuides: 'ritual guides',
        almanac: 'Panchang',
        almanacGuide: 'Hindu almanac guide',
        search: 'Search',
        noContent: 'No content available',
        noContentCopy: 'Add content from Admin or restore the starter bundle.',
        loadingTitle: 'Loading content',
        loadingMessage: 'Preparing the local devotional library.',
        featuredInLibrary: 'in library',
      };

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const homeSearchQuery = homeSearch.trim().toLowerCase();
  const homeSearchResults = useMemo(() => {
    if (!homeSearchQuery) return null;
    const deityResults = deities.filter((deity) => (
      includesLocalizedQuery([deity.name, getLocalizedDeityName(deity, 'ne'), deity.nameNe, deity.sanskritName, deity.introduction, deity.introductionNe, deity.description, deity.significance, deity.significanceNe, deity.mantra, deity.tags], homeSearchQuery)
    )).slice(0, 4);
    const textResults = stotras.filter((stotra) => (
      includesLocalizedQuery([stotra.title, getLocalizedContentTitle(stotra, 'ne'), stotra.titleNe, stotra.alternateTitle, stotra.alternateTitleNe, stotra.deity, getLocalizedDeityName(stotra.deityNe || stotra.deity, 'ne'), stotra.deityNe, stotra.category, getLocalizedCategoryName(stotra.categoryNe || stotra.category, 'ne'), stotra.categoryNe, stotra.content, stotra.meaning, stotra.meaningNe, stotra.nepaliMeaning, stotra.wordMeaning, stotra.wordMeaningNe, stotra.benefits, stotra.benefitsNe, stotra.process, stotra.processNe, stotra.tags], homeSearchQuery)
    )).slice(0, 4);
    const poojaResults = poojaBidhi.filter((pooja) => (
      includesLocalizedQuery([pooja.title, getLocalizedPoojaTitle(pooja, 'ne'), pooja.titleNe, pooja.deity, getLocalizedDeityName(pooja.deityNe || pooja.deity, 'ne'), pooja.deityNe, pooja.occasion, pooja.occasionNe, pooja.overview, pooja.overviewNe, pooja.materials, pooja.materialsNe, pooja.steps, pooja.stepsNe, pooja.benefits, pooja.benefitsNe, pooja.cautions, pooja.cautionsNe, pooja.tags], homeSearchQuery)
    )).slice(0, 4);
    const panchangMatches = /panchang|almanac|tithi|nakshatra|yoga|karana|rahu|पञ्चाङ्ग|तिथि|नक्षत्र|करण|राहु/i.test(homeSearchQuery);
    return { deityResults, textResults, poojaResults, panchangMatches };
  }, [deities, homeSearchQuery, poojaBidhi, stotras]);
  const hasHomeSearch = Boolean(homeSearchQuery);
  const totalResults = homeSearchResults
    ? homeSearchResults.deityResults.length + homeSearchResults.textResults.length + homeSearchResults.poojaResults.length + (homeSearchResults.panchangMatches ? 1 : 0)
    : 0;

  const searchCopy = language === 'ne'
    ? {
        title: 'खोज परिणाम',
        deities: 'देवताहरू',
        texts: 'भक्तिपूर्ण सामग्री',
        pooja: 'पूजा विधि',
        panchang: 'पञ्चाङ्ग',
        noResults: 'मिल्ने सामग्री भेटिएन।',
        clear: 'खोज खाली गर्नुहोस्',
      }
    : {
        title: 'Search results',
        deities: 'Deities',
        texts: 'Devotional texts',
        pooja: 'Pooja guides',
        panchang: 'Panchang',
        noResults: 'No matching content found.',
        clear: 'Clear search',
      };

  const truncate = (value: string, limit = 120) => (value.length > limit ? `${value.slice(0, limit).trimEnd()}…` : value);

  return (
    <>
      <section className="home-hero-v2">
        <div className="home-hero-inner">
          <div className="home-hero-logo-mark">
            <img
              src="/images/golden-om-logo-circle.png"
              alt="Om Stotra Sagar golden Om logo"
              className="home-hero-logo-image logo-glow"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <span className="home-logo-fallback" aria-hidden="true">ॐ</span>
          </div>

          <div className="home-vara-chip">
            <span className="vara-day-name">{language === 'ne' ? vara.ne : vara.en}</span>
            <span className="vara-sep">·</span>
            <span className="vara-deity-name">{language === 'ne' ? vara.deityNe : vara.deityEn}</span>
          </div>

            <div className="home-date-widget" aria-label={language === 'ne' ? 'मिति र समय' : 'Date and time'}>
              <span>{kathmanduInfo.bikramSambat || (language === 'ne' ? 'वि.सं. मिति जडान हुँदैछ' : 'Bikram Sambat coming soon')}</span>
              <span>{kathmanduInfo.gregorianDate}</span>
              <span>{kathmanduInfo.time} · {kathmanduInfo.city}</span>
            </div>

            <h1 className="home-title-v2">{copy.title}</h1>
            <p className="home-tagline-v2">{copy.tagline}</p>

            <div className="home-nav-pills">
              <button onClick={() => onNavigate('stotras')} className="home-pill">
                <ScrollText size={15} /> {language === 'ne' ? 'पुस्तकालय' : 'Library'}
              </button>
              <button onClick={() => onNavigate('gods')} className="home-pill">
                <Sparkles size={15} /> {language === 'ne' ? 'देवता' : 'Gods'}
              </button>
              <button onClick={() => onNavigate('pooja')} className="home-pill">
                <Feather size={15} /> {language === 'ne' ? 'पूजा' : 'Pooja'}
              </button>
              <button onClick={() => onNavigate('panchang')} className="home-pill">
                <CalendarDays size={15} /> {language === 'ne' ? 'पञ्चाङ्ग' : 'Panchang'}
              </button>
            </div>

            <div className="search-wrap search-wrap-wide home-search-wrap">
              <input
                value={homeSearch}
                onChange={(event) => setHomeSearch(event.target.value)}
                placeholder={copy.search}
                aria-label={copy.search}
                className="search-bar"
              />
              <Search className="search-icon" size={18} />
            </div>

            {hasHomeSearch ? (
              <section className="home-search-results-panel">
                <div className="home-search-results-header">
                  <div>
                    <h2 className="home-section-title">{searchCopy.title}</h2>
                    <p className="home-section-sub">{totalResults} {language === 'ne' ? 'परिणाम' : 'results'}</p>
                  </div>
                  <button type="button" className="secondary-button" onClick={() => setHomeSearch('')}>
                    {searchCopy.clear}
                  </button>
                </div>

                {homeSearchResults && totalResults > 0 ? (
                  <div className="home-search-groups">
                    {homeSearchResults.deityResults.length > 0 && (
                      <section className="home-search-group">
                        <p className="section-kicker">{searchCopy.deities}</p>
                        <div className="home-search-list">
                          {homeSearchResults.deityResults.map((deity) => (
                            <button
                              key={deity.id}
                              className="home-search-item"
                              onClick={() => {
                                onDeityChange(deity.name);
                                setHomeSearch('');
                                onNavigate('gods');
                              }}
                            >
                              <div className="home-search-item-copy">
                                <p className="home-search-item-title">{getLocalizedDeityName(deity, language)}</p>
                                <p className="home-search-item-meta">{language === 'ne' ? 'देवता' : (deity.type || 'Other')}</p>
                                <p className="home-search-item-preview">{truncate([getLocalizedText(language, deity.introductionNe, deity.introduction), getLocalizedText(language, deity.significanceNe, deity.significance), deity.mantra].filter(Boolean).join(' · ') || deity.description || '', 120)}</p>
                              </div>
                              <ChevronRight size={16} className="home-search-item-arrow" />
                            </button>
                          ))}
                        </div>
                      </section>
                    )}

                    {homeSearchResults.textResults.length > 0 && (
                      <section className="home-search-group">
                        <p className="section-kicker">{searchCopy.texts}</p>
                        <div className="home-search-list">
                          {homeSearchResults.textResults.map((stotra) => (
                            <button
                              key={stotra.id}
                              className="home-search-item"
                              onClick={() => {
                                setHomeSearch('');
                                onOpenStotra(stotra);
                              }}
                            >
                              <div className="home-search-item-copy">
                                <p className="home-search-item-title">{getLocalizedContentTitle(stotra, language)}</p>
                                <p className="home-search-item-meta">{getLocalizedDeityName(stotra.deityNe || stotra.deity, language)} · {getLocalizedCategoryName(stotra.categoryNe || stotra.category, language)}</p>
                                <p className="home-search-item-preview">{truncate(getLocalizedText(language, stotra.meaningNe || stotra.nepaliMeaning, stotra.meaning) || stotra.content || getLocalizedText(language, stotra.benefitsNe, stotra.benefits) || '', 120)}</p>
                              </div>
                              <ChevronRight size={16} className="home-search-item-arrow" />
                            </button>
                          ))}
                        </div>
                      </section>
                    )}

                    {homeSearchResults.poojaResults.length > 0 && (
                      <section className="home-search-group">
                        <p className="section-kicker">{searchCopy.pooja}</p>
                        <div className="home-search-list">
                          {homeSearchResults.poojaResults.map((pooja) => (
                            <button
                              key={pooja.id}
                              className="home-search-item"
                              onClick={() => {
                                setHomeSearch('');
                                onOpenPooja(pooja);
                              }}
                            >
                              <div className="home-search-item-copy">
                                <p className="home-search-item-title">{getLocalizedPoojaTitle(pooja, language)}</p>
                                <p className="home-search-item-meta">{getLocalizedDeityName(pooja.deityNe || pooja.deity, language)} · {getLocalizedText(language, pooja.occasionNe, pooja.occasion) || copy.poojaGuides}</p>
                                <p className="home-search-item-preview">{truncate([getLocalizedText(language, pooja.overviewNe, pooja.overview), pooja.materialsNe?.[0] || pooja.materials[0], pooja.stepsNe?.[0] || pooja.steps[0]].filter(Boolean).join(' · ') || '', 120)}</p>
                              </div>
                              <ChevronRight size={16} className="home-search-item-arrow" />
                            </button>
                          ))}
                        </div>
                      </section>
                    )}

                    {homeSearchResults.panchangMatches && (
                      <section className="home-search-group">
                        <p className="section-kicker">{searchCopy.panchang}</p>
                        <button
                          className="home-search-item"
                          onClick={() => {
                            setHomeSearch('');
                            onNavigate('panchang');
                          }}
                        >
                          <div className="home-search-item-copy">
                            <p className="home-search-item-title">{searchCopy.panchang}</p>
                            <p className="home-search-item-meta">{language === 'ne' ? 'पञ्चाङ्ग पृष्ठ' : 'Panchang page'}</p>
                            <p className="home-search-item-preview">{language === 'ne' ? 'वर्तमान मिति, समय, र उपलब्ध गणनाहरू हेर्नुहोस्।' : 'Open the current date, time, and available calculation notes.'}</p>
                          </div>
                          <ChevronRight size={16} className="home-search-item-arrow" />
                        </button>
                      </section>
                    )}
                  </div>
                ) : (
                  <StateMessage title={searchCopy.noResults} message={language === 'ne' ? 'अर्को शब्द प्रयोग गर्नुहोस् वा खोज खाली गर्नुहोस्।' : 'Try another word or clear the search.'} />
                )}
              </section>
            ) : null}
          </div>
        </section>

      {!hasHomeSearch && (
      <section className="home-deity-row-v2">
        <div className="home-deity-scroll">
          {deities.slice(0, 8).map((deity) => (
            <button
              key={deity.id}
              onClick={() => {
                onDeityChange(deity.name);
                onNavigate('gods');
              }}
              className="deity-pill-v2"
            >
              <span className="deity-pill-initial">{getLocalizedDeityName(deity, language).charAt(0)}</span>
              <span className="deity-pill-name">{getLocalizedDeityName(deity, language)}</span>
            </button>
          ))}
        </div>
      </section>
      )}

      {!hasHomeSearch && (
      <main className="home-content-v2">
        {dailyStotra && (
          <section>
            <div className="home-section-header">
              <h2 className="home-section-title">{copy.dailyStotra}</h2>
            </div>
            <p className="today-stotra-label">{copy.dailyStotra}</p>
            <button onClick={() => onOpenStotra(dailyStotra)} className="stotra-list-item today-stotra-card">
              <p className="today-stotra-badge">{copy.dailyStotra}</p>
              <div className="stotra-list-initial">{getLocalizedContentTitle(dailyStotra, language).charAt(0)}</div>
              <div className="stotra-list-body">
                <p className="today-stotra-title">{getLocalizedContentTitle(dailyStotra, language)}</p>
                <p className="today-stotra-meta">{getLocalizedDeityName(dailyStotra.deityNe || dailyStotra.deity, language)} · {getLocalizedCategoryName(dailyStotra.categoryNe || dailyStotra.category, language)}</p>
              </div>
              <ChevronRight size={16} className="stotra-list-arrow" />
            </button>
          </section>
        )}

        {recentStotras.length > 0 && (
          <section>
            <div className="home-section-header">
              <h2 className="home-section-title">{copy.recentlyRead}</h2>
            </div>
            <div className="stotra-list-compact">
              {recentStotras.map((stotra) => (
                <button key={stotra.id} onClick={() => onOpenStotra(stotra)} className="stotra-list-item">
                    <div className="stotra-list-initial">{getLocalizedContentTitle(stotra, language).charAt(0)}</div>
                  <div className="stotra-list-body">
                    <p className="stotra-list-title">{getLocalizedContentTitle(stotra, language)}</p>
                    <p className="stotra-list-meta">{getLocalizedDeityName(stotra.deityNe || stotra.deity, language)} · {getLocalizedCategoryName(stotra.categoryNe || stotra.category, language)}</p>
                  </div>
                  <ChevronRight size={16} className="stotra-list-arrow" />
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="home-section-header">
            <h2 className="home-section-title">{copy.featured}</h2>
            <span className="home-section-sub">{stotras.length} {copy.featuredInLibrary}</span>
          </div>
          {isLoading ? (
            <StateMessage title={copy.loadingTitle} message={copy.loadingMessage} />
          ) : stotras.length === 0 ? (
            <StateMessage title={copy.noContent} message={copy.noContentCopy} />
          ) : (
            <div className="stotra-list-compact">
              {featuredContent.map((stotra) => (
                <button
                  key={stotra.id}
                  onClick={() => onOpenStotra(stotra)}
                  className="stotra-list-item"
                >
                  <div className="stotra-list-initial">{getLocalizedContentTitle(stotra, language).charAt(0)}</div>
                  <div className="stotra-list-body">
                    <p className="stotra-list-title">{getLocalizedContentTitle(stotra, language)}</p>
                    <p className="stotra-list-meta">{getLocalizedDeityName(stotra.deityNe || stotra.deity, language)} · {getLocalizedCategoryName(stotra.categoryNe || stotra.category, language)}</p>
                  </div>
                  <ChevronRight size={16} className="stotra-list-arrow" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="home-section-header">
            <h2 className="home-section-title">{copy.explore}</h2>
          </div>
          <div className="home-quicklinks">
            <button onClick={() => onNavigate('gods')} className="home-quicklink-item">
              <Sparkles size={18} className="ql-icon" />
              <div>
                <p className="ql-title">{copy.deityProfiles}</p>
                <p className="ql-sub">{deities.length} {copy.godsCount}</p>
              </div>
              <ChevronRight size={16} className="ql-arrow" />
            </button>
            <button onClick={() => onNavigate('pooja')} className="home-quicklink-item">
              <Feather size={18} className="ql-icon" />
              <div>
                <p className="ql-title">{copy.poojaGuides}</p>
                <p className="ql-sub">{poojaBidhi.length} {copy.ritualGuides}</p>
              </div>
              <ChevronRight size={16} className="ql-arrow" />
            </button>
            <button onClick={() => onNavigate('panchang')} className="home-quicklink-item">
              <CalendarDays size={18} className="ql-icon" />
              <div>
                <p className="ql-title">{copy.almanac}</p>
                <p className="ql-sub">{copy.almanacGuide}</p>
              </div>
              <ChevronRight size={16} className="ql-arrow" />
            </button>
          </div>
        </section>
      </main>
      )}
    </>
  );
}
