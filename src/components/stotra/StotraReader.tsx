import { Bookmark, Check, Copy, ImageIcon, Printer, Share2, X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { Stotra } from '../../types';

export type ReaderFontSize = 'small' | 'medium' | 'large';

const fontSizeClass: Record<ReaderFontSize, string> = {
  small: 'reader-text-small',
  medium: 'reader-text-medium',
  large: 'reader-text-large',
};

function wrapCanvasText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      ctx.fillText(line.trim(), x + maxWidth / 2, y);
      line = `${word} `;
      y += lineHeight;
      if (y > 900) {
        ctx.fillText('...', x + maxWidth / 2, y);
        return;
      }
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line.trim(), x + maxWidth / 2, y);
}

async function generateShareImage(stotra: Stotra): Promise<void> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not supported.');

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, '#fffaf1');
  gradient.addColorStop(1, '#f5ead6');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.strokeStyle = '#ff6b35';
  ctx.lineWidth = 12;
  ctx.strokeRect(24, 24, 1032, 1032);

  ctx.font = 'bold 80px serif';
  ctx.fillStyle = '#d8b24a';
  ctx.textAlign = 'center';
  ctx.fillText('ॐ', 540, 160);

  ctx.font = 'bold 52px serif';
  ctx.fillStyle = '#1a1a2e';
  ctx.fillText(stotra.title, 540, 260);

  ctx.font = '36px sans-serif';
  ctx.fillStyle = '#ff6b35';
  ctx.fillText(stotra.deity, 540, 320);

  ctx.font = '32px serif';
  ctx.fillStyle = '#4a3b31';
  const preview = stotra.content.slice(0, 200).replace(/\n/g, ' ');
  wrapCanvasText(ctx, preview, 100, 420, 880, 48);

  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#d8b24a';
  ctx.fillText('Om Stotra Sagar', 540, 1020);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Image generation failed.');
  const file = new File([blob], `${stotra.title}.png`, { type: 'image/png' });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: stotra.title });
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${stotra.title}.png`;
  link.click();
  URL.revokeObjectURL(url);
}

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
  const meaning = stotra?.meaning || stotra?.nepaliMeaning;
  const textScriptClass = stotra?.content && /[\u0900-\u097F]/.test(stotra.content) ? 'reader-text-devanagari' : 'reader-text-latin';
  const [imageFailed, setImageFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shareImageError, setShareImageError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setImageFailed(false);
    setCopied(false);
    setProgress(0);
    setShareImageError(null);
  }, [stotra?.id]);

  useEffect(() => {
    if (!stotra) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      previousFocusRef.current?.focus();
    };
  }, [stotra]);

  const handleCopyText = async () => {
    if (!stotra) return;
    const text = [
      stotra.title,
      stotra.alternateTitle ? `(${stotra.alternateTitle})` : '',
      '',
      stotra.content,
      meaning ? `\nMeaning:\n${meaning}` : '',
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleScroll = () => {
    const el = contentRef.current;
    if (!el) return;
    const scrolled = el.scrollTop;
    const total = el.scrollHeight - el.clientHeight;
    setProgress(total > 0 ? Math.round((scrolled / total) * 100) : 0);
  };

  const handleShareImage = async () => {
    if (!stotra) return;
    try {
      setShareImageError(null);
      await generateShareImage(stotra);
    } catch {
      setShareImageError('Image sharing not supported.');
    }
  };

  useEffect(() => {
    if (!stotra) return;
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === 'Escape') onClose();
      if (event.key === 'b' || event.key === 'B') onToggleFavorite(stotra);
      if (event.key === 'p' || event.key === 'P') onPrint();
      if (event.key === '+' || event.key === '=') {
        onFontSizeChange(fontSize === 'small' ? 'medium' : 'large');
      }
      if (event.key === '-') {
        onFontSizeChange(fontSize === 'large' ? 'medium' : 'small');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [stotra, fontSize, onClose, onToggleFavorite, onPrint, onFontSizeChange]);

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
            role="dialog"
            aria-modal="true"
            aria-labelledby="reader-title"
          >
            <div className="reader-toolbar">
              <div className="reader-toolbar-row">
                <div className="reader-controls">
                  <FontButtons value={fontSize} onChange={onFontSizeChange} />
                </div>

                <div className="reader-controls reader-controls-right">
                  <ReaderActionButton
                    onClick={handleCopyText}
                    icon={copied ? <Check size={18} /> : <Copy size={18} />}
                    ariaLabel={copied ? 'Copied stotra text' : 'Copy stotra text to clipboard'}
                    active={copied}
                  />
                  <ReaderActionButton onClick={() => onShare(stotra)} icon={<Share2 size={18} />} ariaLabel="Share content" />
                  <ReaderActionButton
                    onClick={() => onToggleFavorite(stotra)}
                    icon={<Bookmark size={18} fill={isFavorite ? 'currentColor' : 'none'} />}
                    ariaLabel={isFavorite ? 'Remove from favorites' : 'Save favorite'}
                    active={isFavorite}
                  />
                  <ReaderActionButton onClick={onPrint} icon={<Printer size={18} />} ariaLabel="Print content" />
                  <ReaderActionButton onClick={handleShareImage} icon={<ImageIcon size={18} />} ariaLabel="Share content as image" />
                  <button ref={closeButtonRef} onClick={onClose} className="reader-action reader-close" aria-label="Close reader" title="Close reader">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="reader-shortcuts" aria-hidden="true">
                <kbd>Esc</kbd> Close &nbsp; <kbd>B</kbd> Bookmark &nbsp; <kbd>+/-</kbd> Font size
              </div>
              {shareImageError && <p className="reader-inline-message">{shareImageError}</p>}
            </div>
            <div className="reader-progress-track">
              <div className="reader-progress-bar" style={{ width: `${progress}%` }} />
            </div>

            <div className="reader-content" ref={contentRef} onScroll={handleScroll}>
              <header className="reader-header reader-header-v2">
                <h2 id="reader-title" className="reader-title">{stotra.title}</h2>
                {stotra.alternateTitle && <p className="reader-subtitle devanagari-line">{stotra.alternateTitle}</p>}
                <p className="reader-meta-v2">{stotra.deity} · {stotra.category}</p>
                <div className="reader-title-rule" />
              </header>

              <div className="reader-sections">
                {stotra.imageUrl && !imageFailed && (
                  <div className="reader-image-frame">
                    <img src={stotra.imageUrl} alt={stotra.title} className="deity-image" onError={() => setImageFailed(true)} />
                  </div>
                )}

                <ReaderSection title="Devotional Text">
                  <div className={`reader-text ${textScriptClass} ${fontSizeClass[fontSize]}`}>{stotra.content}</div>
                </ReaderSection>

                {meaning && (
                  <section className="reader-meaning-block">
                    <p className="reader-meaning-label">Meaning</p>
                    <p className="reader-paragraph whitespace-pre-wrap">{meaning}</p>
                  </section>
                )}

                {stotra.wordMeaning && (
                  <ReaderSection title="Word Meaning">
                    <p className="reader-paragraph whitespace-pre-wrap">{stotra.wordMeaning}</p>
                  </ReaderSection>
                )}

                {stotra.benefits && (
                  <section className="reader-benefits-block">
                    <p className="reader-meaning-label">Benefits</p>
                    <p className="reader-paragraph whitespace-pre-wrap">{stotra.benefits}</p>
                  </section>
                )}

                {stotra.process && (
                  <ReaderSection title="How to Recite / Use">
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
  ariaLabel,
  active = false,
}: {
  onClick: () => void;
  icon: ReactNode;
  ariaLabel: string;
  active?: boolean;
}) {
  return (
    <button onClick={onClick} className={`reader-action ${active ? 'reader-action-active' : ''}`} aria-label={ariaLabel} title={ariaLabel}>
      {icon}
    </button>
  );
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
