import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import type { PoojaBidhi } from '../../types';
import { getLocalizedDeityName, getLocalizedList, getLocalizedPoojaTitle, getLocalizedText, includesLocalizedQuery } from '../../utils/localization';

interface PoojaPageProps {
  poojaBidhi: PoojaBidhi[];
  activeDeity?: string | null;
  selectedPoojaId?: string | null;
  language: 'ne' | 'en';
}

export default function PoojaPage({ poojaBidhi, activeDeity, selectedPoojaId, language }: PoojaPageProps) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const copy = language === 'ne'
    ? {
        eyebrow: 'पूजा विधि',
        title: 'पूजा विधि',
        subtitle: 'शीर्षक सूचीबाट छानेर आवश्यक सामग्री, विधि, मन्त्र, लाभ, र सावधानीहरू हेर्नुहोस्।',
        searchPlaceholder: 'पूजा विधि खोज्नुहोस्...',
        guides: 'विधिहरू',
        noMatchTitle: 'मिल्ने विधि भेटिएन',
        noMatchCopy: 'अर्को खोज शब्द प्रयोग गर्नुहोस् वा देवता फिल्टर खाली गर्नुहोस्।',
        selectTitle: 'विधि छान्नुहोस्',
        selectCopy: 'पूर्ण पूजा विवरण खोल्न सूचीबाट शीर्षक छान्नुहोस्।',
        allGuides: 'सबै पूजा विधि',
        deity: 'देवता',
        samagri: 'सामग्री',
        steps: 'विधि',
        benefits: 'लाभ',
        cautions: 'सावधानीहरू',
        source: 'स्रोत',
        fallbackBidhi: 'पूजा विधि',
        cautionFallback: 'परिवार, क्षेत्र र सम्प्रदायअनुसार परम्परा फरक हुन सक्छ। ठूलो विधिका लागि पुरोहित वा परिवारका ज्येष्ठसँग परामर्श गर्नुहोस्।',
        notAvailable: 'उपलब्ध छैन।',
      }
    : {
        eyebrow: 'Pooja Bidhi',
        title: 'Pooja guides',
        subtitle: 'Browse by title first, then open a guide to read samagri, steps, benefits, cautions, and source notes.',
        searchPlaceholder: 'Search pooja guides...',
        guides: 'guides',
        noMatchTitle: 'No matching guides',
        noMatchCopy: 'Try another search term or clear the filter from the deity profile.',
        selectTitle: 'Select a guide',
        selectCopy: 'Choose a title from the list to open the full pooja detail view.',
        allGuides: 'All Pooja Guides',
        deity: 'Deity',
        samagri: 'Samagri',
        steps: 'Steps',
        benefits: 'Benefits',
        cautions: 'Cautions',
        source: 'Source',
        fallbackBidhi: 'Pooja Bidhi',
        cautionFallback: 'Traditions vary by family, region, and sampradaya. For major rituals, consult a priest or family elder.',
        notAvailable: 'Not available.',
      };

  const visibleItems = useMemo(() => {
    const base = activeDeity ? poojaBidhi.filter((item) => item.deity === activeDeity) : poojaBidhi;
    const search = query.trim().toLowerCase();
    if (!search) return base;
    return base.filter((item) => includesLocalizedQuery([item.title, getLocalizedPoojaTitle(item, 'ne'), item.titleNe, item.deity, getLocalizedDeityName(item.deityNe || item.deity, 'ne'), item.deityNe, item.occasion, item.occasionNe, item.overview, item.overviewNe, item.materials, item.materialsNe, item.steps, item.stepsNe, item.benefits, item.benefitsNe, item.tags], search));
  }, [activeDeity, poojaBidhi, query]);

  const selected = visibleItems.find((item) => item.id === selectedId) || null;

  useEffect(() => {
    setSelectedId(null);
  }, [activeDeity, query]);

  useEffect(() => {
    if (selectedPoojaId) {
      setSelectedId(selectedPoojaId);
    }
  }, [selectedPoojaId]);

  return (
    <main className="page-container page-shell pooja-page">
      <section className="page-hero editorial-card">
        <p className="page-eyebrow">{copy.eyebrow}</p>
        <h1 className="page-title">{copy.title}</h1>
        <p className="page-subtitle">{copy.subtitle}</p>
      </section>

      <section className="section-band">
        <div className="search-wrap search-wrap-wide">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label="Search pooja guides"
            className="search-bar"
          />
          <Search className="search-icon" size={18} />
        </div>
      </section>

      <section className="pooja-layout">
        <div className="pooja-list-panel">
          <div className="pooja-list-header">
            <p className="section-kicker">{visibleItems.length} {copy.guides}</p>
          </div>
          <div className="pooja-list">
            {visibleItems.length === 0 ? (
              <div className="empty-state editorial-card">
                <h2 className="card-title">{copy.noMatchTitle}</h2>
                <p className="card-copy">{copy.noMatchCopy}</p>
              </div>
            ) : (
              visibleItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`pooja-list-item ${selected?.id === item.id ? 'pooja-list-item-active' : ''}`}
                >
                  <div className="pooja-list-copy">
                    <p className="pooja-list-title">{getLocalizedPoojaTitle(item, language)}</p>
                    <p className="pooja-list-meta">{getLocalizedDeityName(item.deityNe || item.deity, language)} · {getLocalizedText(language, item.occasionNe, item.occasion) || copy.fallbackBidhi}</p>
                  </div>
                  <ArrowRight size={16} className="pooja-list-arrow" />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="pooja-detail-panel">
          {selected ? (
            <article className="pooja-detail-card editorial-card">
              <button onClick={() => setSelectedId(null)} className="secondary-button pooja-back-button">
                <ArrowLeft size={16} /> {copy.allGuides}
              </button>
              <p className="page-eyebrow">{selected.occasion || copy.eyebrow}</p>
              <h2 className="card-title">{getLocalizedPoojaTitle(selected, language)}</h2>
              <p className="deity-line">{copy.deity}: {getLocalizedDeityName(selected.deityNe || selected.deity, language)}</p>
              <p className="card-copy">{getLocalizedText(language, selected.overviewNe, selected.overview)}</p>

              <PoojaSection title={copy.samagri}>
                <Checklist items={getLocalizedList(language, selected.materialsNe, selected.materials)} fallback={copy.notAvailable} />
              </PoojaSection>

              <PoojaSection title={copy.steps}>
                <ol className="step-list">
                  {getLocalizedList(language, selected.stepsNe, selected.steps).map((step, index) => (
                    <li key={`${step}-${index}`} className="step-item">
                      <span className="step-number">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </PoojaSection>

              <PoojaSection title={copy.benefits}>
                <Checklist items={getLocalizedList(language, selected.benefitsNe, selected.benefits)} fallback={copy.notAvailable} />
              </PoojaSection>

              <PoojaSection title={copy.cautions}>
                <p className="reader-paragraph">{getLocalizedText(language, selected.cautionsNe, selected.cautions) || copy.cautionFallback}</p>
              </PoojaSection>

              {(selected.source || selected.sourceNe) && (
                <PoojaSection title={copy.source}>
                  <p className="reader-paragraph">{getLocalizedText(language, selected.sourceNe, selected.source)}</p>
                </PoojaSection>
              )}

              {selected.tags.length > 0 && (
                <div className="chip-row">
                  {selected.tags.map((tag) => (
                    <span key={tag} className="tag-chip tag-chip-muted">#{tag}</span>
                  ))}
                </div>
              )}
            </article>
          ) : (
            <div className="empty-state editorial-card">
              <h2 className="card-title">{copy.selectTitle}</h2>
              <p className="card-copy">{copy.selectCopy}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function PoojaSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="pooja-section">
      <p className="section-kicker">{title}</p>
      <div className="soft-divider" />
      {children}
    </section>
  );
}

function Checklist({ items, fallback }: { items: string[]; fallback: string }) {
  if (!items.length) return <p className="reader-paragraph">{fallback}</p>;

  return (
    <div className="compact-checklist">
      {items.map((item) => (
        <div key={item} className="check-item">
          <span className="check-dot" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}
