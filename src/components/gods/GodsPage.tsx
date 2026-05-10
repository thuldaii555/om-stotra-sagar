import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Feather, Sparkles } from 'lucide-react';
import type { Deity, PoojaBidhi, Stotra } from '../../types';
import { getLocalizedCategoryName, getLocalizedContentTitle, getLocalizedDeityName, getLocalizedDeityType, getLocalizedPoojaTitle, getLocalizedText } from '../../utils/localization';
import { getDeityImageSrc, getDeityImageStyle } from '../../utils/deityImage';

interface GodsPageProps {
  deities: Deity[];
  stotras: Stotra[];
  poojaBidhi: PoojaBidhi[];
  language: 'ne' | 'en';
  activeDeity: string | null;
  onOpenContent: (item: Stotra) => void;
  onOpenPooja: (deity: string) => void;
  onOpenAdmin?: () => void;
}

const normalize = (value: string) => value.trim().toLowerCase();

export default function GodsPage({ deities, stotras, poojaBidhi, language, activeDeity, onOpenContent, onOpenPooja, onOpenAdmin }: GodsPageProps) {
  const [selectedDeityName, setSelectedDeityName] = useState<string | null>(null);
  useEffect(() => {
    if (activeDeity) {
      setSelectedDeityName(activeDeity);
    }
  }, [activeDeity]);
  const selectedDeity = deities.find((deity) => normalize(deity.name) === normalize(selectedDeityName || '')) || null;
  const copy = language === 'ne'
    ? {
        eyebrow: 'देवता / प्रोफाइल',
        title: 'देवता र देवीहरू',
        subtitle: 'प्रत्येक प्रोफाइल खोलेर परिचय, महत्त्व, मन्त्र, र सम्बन्धित भक्तिपूर्ण सामग्री वा पूजा विधि हेर्नुहोस्।',
        profiles: 'प्रोफाइल',
        libraryItems: 'पुस्तकालय सामग्री',
        poojaGuides: 'पूजा विधि',
        allProfiles: 'सबै प्रोफाइल',
        relatedContent: 'सम्बन्धित सामग्री',
        availableFor: 'उपलब्ध सामग्री',
        poojaBidhi: 'पूजा विधि',
        viewProfile: 'प्रोफाइल हेर्नुहोस्',
        noDeities: 'अहिलेसम्म कुनै देवता छैन',
        noDeitiesCopy: 'Local Content Studio बाट देवता प्रोफाइल थप्नुहोस्।',
      }
    : {
        eyebrow: 'Deities / Profiles',
        title: 'Explore Gods & Goddesses',
        subtitle: 'Open a profile to see introduction, significance, mantra, and every linked devotional text or pooja guide.',
        profiles: 'Profiles',
        libraryItems: 'Library Items',
        poojaGuides: 'Pooja Guides',
        allProfiles: 'All profiles',
        relatedContent: 'Related Content',
        availableFor: 'Available for',
        poojaBidhi: 'Pooja Bidhi',
        viewProfile: 'View Profile',
        noDeities: 'No deities available yet',
        noDeitiesCopy: 'Add deity profiles from the Local Content Studio to build this gallery.',
      };

  const relatedCount = useMemo(() => {
    const counts = new Map<string, number>();
    stotras.forEach((item) => counts.set(normalize(item.deity), (counts.get(normalize(item.deity)) || 0) + 1));
    poojaBidhi.forEach((item) => counts.set(normalize(item.deity), (counts.get(normalize(item.deity)) || 0) + 1));
    return counts;
  }, [poojaBidhi, stotras]);

  if (selectedDeity) {
    const deityKey = normalize(selectedDeity.name);
    return (
      <DeityProfile
        deity={selectedDeity}
        content={stotras.filter((item) => normalize(item.deity) === deityKey)}
        poojaBidhi={poojaBidhi.filter((item) => normalize(item.deity) === deityKey)}
        language={language}
        onBack={() => setSelectedDeityName(null)}
        onOpenContent={onOpenContent}
        onOpenPooja={onOpenPooja}
      />
    );
  }

  return (
    <main className="page-container page-shell gods-page">
      <section className="page-hero premium-hero-card">
        <div className="gods-hero">
          <div className="gods-hero-copy">
            <p className="page-eyebrow">{copy.eyebrow}</p>
            <h1 className="page-title">{copy.title}</h1>
            <p className="page-subtitle">{copy.subtitle}</p>
            <div className="chip-row gods-stat-grid" aria-label="Deity gallery stats">
              <StatBadge label={copy.profiles} value={deities.length} />
              <StatBadge label={copy.libraryItems} value={stotras.length} />
              <StatBadge label={copy.poojaGuides} value={poojaBidhi.length} />
            </div>
          </div>
        </div>
      </section>

      {deities.length === 0 ? (
        <section className="empty-state premium-empty-state deity-empty-state">
          <div className="symbol-medallion deity-empty-medallion">Om</div>
          <div className="empty-state-copy">
            <h2 className="card-title">{copy.noDeities}</h2>
            <p className="card-copy">{copy.noDeitiesCopy}</p>
          </div>
          {onOpenAdmin && <button onClick={onOpenAdmin} className="action-button">{language === 'ne' ? 'एडमिन खोल्नुहोस्' : 'Open Admin'}</button>}
        </section>
      ) : (
        <section className="content-grid deity-gallery">
          {deities.map((deity) => (
            <DeityCard
              key={deity.id}
              deity={deity}
              language={language}
              onOpen={() => setSelectedDeityName(deity.name)}
            />
          ))}
        </section>
      )}
    </main>
  );
}

function DeityCard({ deity, language, onOpen }: { key?: string; deity: Deity; language: 'ne' | 'en'; onOpen: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = getDeityImageSrc(deity);
  const hasImage = Boolean(imageSrc) && !imageFailed;
  const displayName = getLocalizedDeityName(deity, language);
  const symbol = displayName.trim().charAt(0) || 'Om';

  return (
    <button className="deity-tile-card" onClick={onOpen}>
      <div className="deity-tile-media">
        {hasImage ? (
          <img src={imageSrc} alt={displayName} className="deity-tile-image deity-crop-image" style={getDeityImageStyle(deity)} loading="lazy" onError={() => setImageFailed(true)} />
        ) : (
          <div className="deity-tile-fallback">
            <div className="symbol-medallion deity-tile-medallion">{symbol}</div>
          </div>
        )}
      </div>
      <div className="deity-tile-copy">
        <h2 className="deity-tile-title">{displayName}</h2>
        {deity.sanskritName && <p className="deity-tile-sanskrit devanagari-line">{deity.sanskritName}</p>}
      </div>
    </button>
  );
}

function DeityProfile({
  deity,
  content,
  poojaBidhi,
  language,
  onBack,
  onOpenContent,
  onOpenPooja,
}: {
  deity: Deity;
  content: Stotra[];
  poojaBidhi: PoojaBidhi[];
  language: 'ne' | 'en';
  onBack: () => void;
  onOpenContent: (item: Stotra) => void;
  onOpenPooja: (deity: string) => void;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = getDeityImageSrc(deity);
  const symbol = deity.sanskritName?.trim().charAt(0) || deity.name.trim().charAt(0) || 'Om';
  const copy = language === 'ne'
    ? { back: 'सबै प्रोफाइल', significance: 'महत्त्व', mantra: 'मन्त्र', related: 'सम्बन्धित सामग्री', availableFor: 'उपलब्ध सामग्री', pooja: 'पूजा विधि', empty: 'सम्बन्धित भक्तिपूर्ण सामग्री अहिलेसम्म छैन।' }
    : { back: 'All profiles', significance: 'Significance', mantra: 'Mantra', related: 'Related Content', availableFor: 'Available for', pooja: 'Pooja Bidhi', empty: 'No linked devotional content yet.' };
  const grouped = Array.from(
    content.reduce((map, item) => {
      const key = item.category || 'Other';
      map.set(key, [...(map.get(key) || []), item]);
      return map;
    }, new Map<string, Stotra[]>())
  );

  return (
    <main className="page-container page-shell gods-page">
      <button onClick={onBack} className="secondary-button deity-back-button"><ArrowLeft size={16} /> {copy.back}</button>
      <section className="page-hero premium-hero-card deity-detail-hero">
        <div className="deity-detail-visual">
          {imageSrc && !imageFailed ? (
            <img src={imageSrc} alt={deity.name} className="deity-image deity-crop-image" style={getDeityImageStyle(deity)} onError={() => setImageFailed(true)} />
          ) : (
            <div className="symbol-medallion gods-hero-medallion">{symbol}</div>
          )}
        </div>
        <div className="deity-detail-copy">
          <p className="page-eyebrow">{getLocalizedDeityType(deity, language)}</p>
          <h1 className="page-title">{getLocalizedDeityName(deity, language)}</h1>
          {deity.sanskritName && <p className="reader-subtitle devanagari-line">{deity.sanskritName}</p>}
          <p className="page-subtitle">{getLocalizedText(language, deity.introductionNe, deity.introduction || deity.description)}</p>
          <section className="content-block">
            <p className="page-eyebrow">{copy.significance}</p>
            <p className="reader-paragraph">{getLocalizedText(language, deity.significanceNe, deity.significance)}</p>
          </section>
          {deity.mantra && <section className="info-callout"><p className="page-eyebrow">{copy.mantra}</p><p className="reader-paragraph devanagari-line">{deity.mantra}</p></section>}
          {deity.tags.length > 0 && <div className="chip-row">{deity.tags.map((tag) => <span key={tag} className="tag-chip tag-chip-muted">#{tag}</span>)}</div>}
        </div>
      </section>

      <section className="section-band">
        <div className="section-band-content">
          <div>
            <p className="section-kicker">{copy.related}</p>
            <h2 className="section-heading">{copy.availableFor} {getLocalizedDeityName(deity, language)}</h2>
          </div>
        </div>

        <div className="deity-related-stack">
          {grouped.map(([category, items]) => <RelatedSection key={category} title={category} icon={<BookOpen size={16} />} items={items} language={language} onOpen={onOpenContent} />)}
          {poojaBidhi.length > 0 && (
            <section className="admin-card deity-related-section">
              <h3 className="section-heading compact-heading"><Feather size={16} /> {copy.pooja}</h3>
              {poojaBidhi.map((item) => <button key={item.id} onClick={() => onOpenPooja(deity.name)} className="record-card record-button"><span>{getLocalizedPoojaTitle(item, language)}</span><ArrowRight size={16} /></button>)}
            </section>
          )}
          {content.length === 0 && poojaBidhi.length === 0 && (
            <section className="empty-state premium-empty-state">
              <Sparkles size={22} />
              <p className="card-copy">{copy.empty}</p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function RelatedSection({ title, icon, items, language, onOpen }: { key?: string; title: string; icon: ReactNode; items: Stotra[]; language: 'ne' | 'en'; onOpen: (item: Stotra) => void }) {
  return (
    <section className="admin-card deity-related-section">
      <h3 className="section-heading compact-heading">{icon} {getLocalizedCategoryName(title, language)}</h3>
      <div className="record-list">
        {items.map((item) => (
          <button key={item.id} onClick={() => onOpen(item)} className="record-card record-button">
            <span>{getLocalizedContentTitle(item, language)}</span>
            <span className="tag-chip tag-chip-muted">{getLocalizedCategoryName(item.categoryNe || item.category, language)}</span>
          </button>
        ))}
      </div>
    </section>
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
