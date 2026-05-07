import { Bookmark, Printer, Share2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Stotra } from '../../types';

export type ReaderFontSize = 'small' | 'medium' | 'large';

const fontSizeClass: Record<ReaderFontSize, string> = {
  small: 'reader-text-small',
  medium: 'reader-text-medium',
  large: 'reader-text-large',
};

interface StotraReaderProps {
  stotra: Stotra | null;
  fontSize: ReaderFontSize;
  isFavorite: boolean;
  onClose: () => void;
  onFontSizeChange: (fontSize: ReaderFontSize) => void;
  onPrint: () => void;
  onShare: (stotra: Stotra) => void;
  onToggleFavorite: (stotra: Stotra) => void;
}

export default function StotraReader({
  stotra,
  fontSize,
  isFavorite,
  onClose,
  onFontSizeChange,
  onPrint,
  onShare,
  onToggleFavorite,
}: StotraReaderProps) {
  return (
    <AnimatePresence>
      {stotra && (
        <div className="reader-overlay">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="reader-backdrop" />

          <motion.article
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            className="reader-panel premium-shell"
          >
            <div className="reader-toolbar">
              <div className="reader-toolbar-row">
                <div className="reader-controls">
                  <FontButtons value={fontSize} onChange={onFontSizeChange} />
                  <ReaderActionButton onClick={onPrint} icon={<Printer size={18} />} label="Print" ariaLabel="Print stotra" />
                  <ReaderActionButton onClick={() => onShare(stotra)} icon={<Share2 size={18} />} label="Share" ariaLabel="Share stotra" />
                  <ReaderActionButton
                    onClick={() => onToggleFavorite(stotra)}
                    icon={<Bookmark size={18} fill={isFavorite ? 'currentColor' : 'none'} />}
                    label={isFavorite ? 'Saved' : 'Save'}
                    ariaLabel={isFavorite ? 'Remove from favorites' : 'Save favorite'}
                    active={isFavorite}
                  />
                </div>

                <button onClick={onClose} className="reader-action reader-close" aria-label="Close reader">
                  <X size={18} />
                  <span>Close</span>
                </button>
              </div>
            </div>

            <div className="reader-content">
              <header className="reader-header editorial-card">
                <div className="reader-hero-top">
                  <div className="symbol-medallion reader-mark">ॐ</div>
                  <div className="reader-heading">
                    <div className="page-eyebrow">Reading Room</div>
                    <h2 className="reader-title">{stotra.title}</h2>
                    {stotra.alternateTitle && <p className="reader-subtitle devanagari-line">{stotra.alternateTitle}</p>}
                  </div>
                </div>

                <div className="reader-meta">
                  <MetaChip text={stotra.deity} />
                  <MetaChip text={stotra.category} />
                  {stotra.language && <MetaChip text={stotra.language} />}
                  {stotra.script && <MetaChip text={stotra.script} />}
                </div>

                {stotra.tags.length > 0 && (
                  <div className="reader-tags">
                    {stotra.tags.map((tag) => (
                      <span key={tag} className="tag-chip tag-chip-muted">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              <div className="reader-sections">
                <ReaderSection title="Stotra Text">
                  <div className={`reader-text devanagari-line ${fontSizeClass[fontSize]}`}>{stotra.content}</div>
                </ReaderSection>

                {stotra.nepaliMeaning && (
                  <ReaderSection title="Meaning">
                    <p className="reader-paragraph whitespace-pre-wrap">{stotra.nepaliMeaning}</p>
                  </ReaderSection>
                )}

                {stotra.wordMeaning && (
                  <ReaderSection title="Word Meaning">
                    <p className="reader-paragraph whitespace-pre-wrap">{stotra.wordMeaning}</p>
                  </ReaderSection>
                )}

                {stotra.benefits && (
                  <ReaderSection title="Benefits">
                    <p className="reader-paragraph whitespace-pre-wrap">{stotra.benefits}</p>
                  </ReaderSection>
                )}

                {stotra.process && (
                  <ReaderSection title="How to Recite">
                    <p className="reader-paragraph whitespace-pre-wrap">{stotra.process}</p>
                  </ReaderSection>
                )}

                {stotra.source && (
                  <ReaderSection title="Source">
                    <p className="reader-paragraph whitespace-pre-wrap">{stotra.source}</p>
                  </ReaderSection>
                )}
              </div>
            </div>
          </motion.article>
        </div>
      )}
    </AnimatePresence>
  );
}

function FontButtons({ value, onChange }: { value: ReaderFontSize; onChange: (value: ReaderFontSize) => void }) {
  const options: Array<{ value: ReaderFontSize; label: string }> = [
    { value: 'small', label: 'A-' },
    { value: 'medium', label: 'A' },
    { value: 'large', label: 'A+' },
  ];

  return (
    <div className="reader-font-controls">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          aria-label={`Set reader font size to ${option.value}`}
          className={`reader-font-button ${value === option.value ? 'reader-font-button-active' : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ReaderActionButton({
  onClick,
  icon,
  label,
  ariaLabel,
  active = false,
}: {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  ariaLabel: string;
  active?: boolean;
}) {
  return (
    <button onClick={onClick} className={`reader-action ${active ? 'reader-action-active' : ''}`} aria-label={ariaLabel}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function MetaChip({ text }: { text: string }) {
  return <span className="tag-chip tag-chip-muted">{text}</span>;
}

function ReaderSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="reader-section editorial-card">
      <p className="section-kicker">{title}</p>
      <div className="soft-divider" />
      {children}
    </section>
  );
}
