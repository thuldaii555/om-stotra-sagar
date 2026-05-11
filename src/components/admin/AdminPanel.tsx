import { useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Download, FileText, Languages, Layers, Loader2, RotateCcw, ScrollText, Sparkles, Trash2, Upload, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import type { Category, Deity, HinduStory, PanchangContent, PoojaBidhi, Stotra } from '../../types';
import type { CategoryInput, DeityInput, HinduStoryInput, PoojaBidhiInput, StotraInput } from '../../services/localContentService';
import { getLocalizedCategoryName, getLocalizedContentTitle, getLocalizedDeityName, getLocalizedDeityType, getLocalizedPoojaTitle, getLocalizedText } from '../../utils/localization';
import { DEFAULT_IMAGE_CROP, getDeityImageSrc, getDeityImageStyle } from '../../utils/deityImage';
import ImageCropper from '../common/ImageCropper';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

interface AdminPanelProps {
  isOpen: boolean;
  stotras: Stotra[];
  categories: Category[];
  deities: Deity[];
  poojaBidhi: PoojaBidhi[];
  stories: HinduStory[];
  panchang: PanchangContent;
  isSaving: boolean;
  message: string | null;
  errorMessage: string | null;
  localContentActive: boolean;
  localDraftNewer: boolean;
  language: 'ne' | 'en';
  onClose: () => void;
  onSaveStotra: (input: StotraInput, id?: string) => boolean;
  onDeleteStotra: (id: string) => void;
  onSaveCategory: (input: CategoryInput, id?: string) => Category | null;
  onDeleteCategory: (id: string) => void;
  onSaveDeity: (input: DeityInput, id?: string) => Deity | null;
  onDeleteDeity: (id: string) => void;
  onSavePoojaBidhi: (input: PoojaBidhiInput, id?: string) => boolean;
  onDeletePoojaBidhi: (id: string) => void;
  onSaveStory: (input: HinduStoryInput, id?: string) => boolean;
  onDeleteStory: (id: string) => void;
  onSavePanchangContent: (input: Partial<PanchangContent>) => boolean;
  onExportAllContent: () => string;
  onImportAllContent: (json: string) => boolean;
  onResetToDefaultContent: () => void;
  onPublishContent: () => Promise<boolean>;
  onLogoutAdmin: () => void;
}

type Tab = 'deities' | 'content' | 'pooja' | 'stories' | 'categories' | 'backup';

const deityTypes: Array<NonNullable<Deity['type']>> = ['God', 'Goddess', 'Form', 'Other'];
const emptyDeity: DeityInput = { name: '', type: 'Other', sanskritName: '', imageUrl: '', imageDataUrl: '', imageSrc: '', imageCrop: DEFAULT_IMAGE_CROP, introduction: '', description: '', significance: '', mantra: '', tags: [] };
const emptyContent: StotraInput = { title: '', alternateTitle: '', deity: '', category: 'Stotra', imageUrl: '', content: '', meaning: '', nepaliMeaning: '', wordMeaning: '', benefits: '', process: '', source: '', tags: [], status: 'published' };
const emptyPooja: PoojaBidhiInput = { title: '', deity: '', occasion: '', overview: '', materials: [], steps: [], benefits: [], cautions: '', source: '', tags: [] };
const emptyStory: HinduStoryInput = { title: '', deity: '', summary: '', story: '', lesson: '', source: '', tags: [] };
const emptyCategory: CategoryInput = { name: '', description: '' };

const linesFromText = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const textFromList = (items?: string[]) => (items || []).join('\n');
const tagsFromText = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
const tagsToText = (items?: string[]) => (items || []).join(', ');
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    let pageText = '';
    let previousY: number | null = null;

    textContent.items.forEach((item) => {
      const textItem = item as { str?: string; transform?: number[] };
      const value = textItem.str || '';
      if (!value.trim()) return;
      const y = textItem.transform?.[5] ?? previousY;
      if (previousY !== null && y !== null && Math.abs(previousY - y) > 5) {
        pageText = pageText.trimEnd() + '\n';
      } else if (pageText && !pageText.endsWith('\n')) {
        pageText += ' ';
      }
      pageText += value;
      previousY = typeof y === 'number' ? y : previousY;
    });

    pages.push(pageText.trim());
  }

  return pages.filter(Boolean).join('\n\n').replace(/\r\n?/g, '\n');
}
type PickerOption = string | { value: string; label: string };
const pickerValue = (option: PickerOption) => (typeof option === 'string' ? option : option.value);
const pickerLabel = (option: PickerOption) => (typeof option === 'string' ? option : option.label);
const adminLabels = {
  en: {
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    deity: 'Deity',
    category: 'Category',
    meaning: 'Meaning',
    benefits: 'Benefits',
    source: 'Source',
    tags: 'Tags',
    introduction: 'Introduction',
    significance: 'Significance',
    mantra: 'Mantra',
    process: 'How to recite/use',
    logout: 'Logout',
    export: 'Export JSON',
    import: 'Import JSON',
    reset: 'Reset Defaults',
    publish: 'Publish to GitHub',
    title: 'Title',
    alternateTitle: 'Alternate title',
    name: 'Name',
    sanskritName: 'Sanskrit name',
    imageUrl: 'Image URL optional',
    contentFullText: 'Content / full text',
    wordMeaning: 'Word Meaning',
    occasion: 'Occasion',
    overview: 'Overview',
    materials: 'Materials / Samagri',
    steps: 'Steps',
    cautions: 'Cautions',
    description: 'Description',
    commaSeparated: 'comma-separated',
    exportedJson: 'Exported JSON or paste import JSON here',
    saving: 'Saving...',
    create: 'Create',
    newItem: 'New',
    typeNew: 'Type new',
    noDeity: 'No deity',
    other: 'Other',
    nepaliFields: 'Nepali Display Fields',
    nameNe: 'Nepali name',
    titleNe: 'Nepali title',
    alternateTitleNe: 'Nepali alternate title',
    introductionNe: 'Nepali introduction',
    significanceNe: 'Nepali significance',
    descriptionNe: 'Nepali description',
    meaningNe: 'Nepali meaning',
    wordMeaningNe: 'Nepali word meaning',
    benefitsNe: 'Nepali benefits',
    processNe: 'Nepali process',
    occasionNe: 'Nepali occasion',
    overviewNe: 'Nepali overview',
    materialsNe: 'Nepali materials',
    stepsNe: 'Nepali steps',
    cautionsNe: 'Nepali cautions',
    deitiesProfiles: 'Deities / Profiles',
    devotionalContent: 'Devotional Content',
    poojaBidhi: 'Pooja Bidhi',
    categories: 'Categories',
    backupPublish: 'Backup & Publish',
    saveDeity: 'Save Deity',
    saveCategory: 'Save Category',
    saveContent: 'Save Devotional Content',
    savePooja: 'Save Pooja Guide',
    clear: 'Clear',
    publishing: 'Publishing...',
  },
  ne: {
    save: 'à¤¸à¥‡à¤­ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥',
    edit: 'à¤¸à¤®à¥à¤ªà¤¾à¤¦à¤¨',
    delete: 'à¤®à¥‡à¤Ÿà¤¾à¤‰à¤¨à¥à¤¹à¥‹à¤¸à¥',
    search: 'à¤–à¥‹à¤œà¥à¤¨à¥à¤¹à¥‹à¤¸à¥',
    deity: 'à¤¦à¥‡à¤µà¤¤à¤¾',
    category: 'à¤¶à¥à¤°à¥‡à¤£à¥€',
    meaning: 'à¤…à¤°à¥à¤¥',
    benefits: 'à¤²à¤¾à¤­',
    source: 'à¤¸à¥à¤°à¥‹à¤¤',
    tags: 'à¤Ÿà¥à¤¯à¤¾à¤—à¤¹à¤°à¥‚',
    introduction: 'à¤ªà¤°à¤¿à¤šà¤¯',
    significance: 'à¤®à¤¹à¤¤à¥à¤¤à¥à¤µ',
    mantra: 'à¤®à¤¨à¥à¤¤à¥à¤°',
    process: 'à¤ªà¤¾à¤  à¤—à¤°à¥à¤¨à¥‡ à¤µà¤¿à¤§à¤¿',
    logout: 'à¤²à¤—à¤†à¤‰à¤Ÿ',
    export: 'JSON à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤',
    import: 'JSON à¤†à¤¯à¤¾à¤¤',
    reset: 'à¤ªà¥‚à¤°à¥à¤µà¤µà¤¤à¥ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥',
    publish: 'GitHub à¤®à¤¾ à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¿à¤¤ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥',
    title: 'à¤¶à¥€à¤°à¥à¤·à¤•',
    alternateTitle: 'à¤µà¥ˆà¤•à¤²à¥à¤ªà¤¿à¤• à¤¶à¥€à¤°à¥à¤·à¤•',
    name: 'à¤¨à¤¾à¤®',
    sanskritName: 'à¤¸à¤‚à¤¸à¥à¤•à¥ƒà¤¤ à¤¨à¤¾à¤®',
    imageUrl: 'à¤¤à¤¸à¥à¤¬à¤¿à¤° URL à¤µà¥ˆà¤•à¤²à¥à¤ªà¤¿à¤•',
    contentFullText: 'à¤ªà¥‚à¤°à¤¾ à¤ªà¤¾à¤ ',
    wordMeaning: 'à¤¶à¤¬à¥à¤¦à¤¾à¤°à¥à¤¥',
    occasion: 'à¤…à¤µà¤¸à¤°',
    overview: 'à¤¸à¤¾à¤°à¤¾à¤‚à¤¶',
    materials: 'à¤¸à¤¾à¤®à¤—à¥à¤°à¥€',
    steps: 'à¤µà¤¿à¤§à¤¿',
    cautions: 'à¤¸à¤¾à¤µà¤§à¤¾à¤¨à¥€à¤¹à¤°à¥‚',
    description: 'à¤µà¤¿à¤µà¤°à¤£',
    commaSeparated: 'à¤…à¤²à¥à¤ªà¤µà¤¿à¤°à¤¾à¤®à¤²à¥‡ à¤›à¥à¤Ÿà¥à¤¯à¤¾à¤‰à¤¨à¥à¤¹à¥‹à¤¸à¥',
    exportedJson: 'à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤ à¤—à¤°à¤¿à¤à¤•à¥‹ JSON à¤µà¤¾ à¤†à¤¯à¤¾à¤¤ à¤—à¤°à¥à¤¨à¥‡ JSON à¤¯à¤¹à¤¾à¤ à¤°à¤¾à¤–à¥à¤¨à¥à¤¹à¥‹à¤¸à¥',
    saving: 'à¤¸à¥‡à¤­ à¤¹à¥à¤à¤¦à¥ˆà¤›...',
    create: 'à¤¸à¤¿à¤°à¥à¤œà¤¨à¤¾ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥',
    newItem: 'à¤¨à¤¯à¤¾à¤',
    typeNew: 'à¤¨à¤¯à¤¾à¤ à¤²à¥‡à¤–à¥à¤¨à¥à¤¹à¥‹à¤¸à¥',
    noDeity: 'à¤¦à¥‡à¤µà¤¤à¤¾ à¤›à¥ˆà¤¨',
    other: 'à¤…à¤¨à¥à¤¯',
    nepaliFields: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤ªà¥à¤°à¤¦à¤°à¥à¤¶à¤¨ à¤µà¤¿à¤µà¤°à¤£',
    nameNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤¨à¤¾à¤®',
    titleNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤¶à¥€à¤°à¥à¤·à¤•',
    alternateTitleNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤µà¥ˆà¤•à¤²à¥à¤ªà¤¿à¤• à¤¶à¥€à¤°à¥à¤·à¤•',
    introductionNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤ªà¤°à¤¿à¤šà¤¯',
    significanceNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤®à¤¹à¤¤à¥à¤µ',
    descriptionNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤µà¤¿à¤µà¤°à¤£',
    meaningNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤…à¤°à¥à¤¥',
    wordMeaningNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤¶à¤¬à¥à¤¦à¤¾à¤°à¥à¤¥',
    benefitsNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤²à¤¾à¤­',
    processNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤ªà¤¾à¤  à¤µà¤¿à¤§à¤¿',
    occasionNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤…à¤µà¤¸à¤°',
    overviewNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤¸à¤¾à¤°à¤¾à¤‚à¤¶',
    materialsNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€',
    stepsNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤µà¤¿à¤§à¤¿',
    cautionsNe: 'à¤¨à¥‡à¤ªà¤¾à¤²à¥€ à¤¸à¤¾à¤µà¤§à¤¾à¤¨à¥€à¤¹à¤°à¥‚',
    deitiesProfiles: 'à¤¦à¥‡à¤µà¤¤à¤¾ / à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤²',
    devotionalContent: 'à¤­à¤•à¥à¤¤à¤¿ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€',
    poojaBidhi: 'à¤ªà¥‚à¤œà¤¾ à¤µà¤¿à¤§à¤¿',
    categories: 'à¤¶à¥à¤°à¥‡à¤£à¥€à¤¹à¤°à¥‚',
    backupPublish: 'à¤¬à¥à¤¯à¤¾à¤•à¤…à¤ª à¤° à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¨',
    saveDeity: 'à¤¦à¥‡à¤µà¤¤à¤¾ à¤¸à¥‡à¤­',
    saveCategory: 'à¤¶à¥à¤°à¥‡à¤£à¥€ à¤¸à¥‡à¤­',
    saveContent: 'à¤­à¤•à¥à¤¤à¤¿ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤¸à¥‡à¤­',
    savePooja: 'à¤ªà¥‚à¤œà¤¾ à¤®à¤¾à¤°à¥à¤—à¤¦à¤°à¥à¤¶à¤¨ à¤¸à¥‡à¤­',
    clear: 'à¤–à¤¾à¤²à¥€',
    publishing: 'à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¨ à¤¹à¥à¤à¤¦à¥ˆ...',
  },
} as const;

function AdminFormActions({ isSaving, label, clearLabel, onCancel }: { isSaving: boolean; label: string; clearLabel: string; onCancel: () => void }) {
  const savingLabel = label.includes('à¤¸à¥‡à¤­') ? 'à¤¸à¥‡à¤­ à¤¹à¥à¤à¤¦à¥ˆà¤›...' : 'Saving...';
  return <div className="button-row"><button disabled={isSaving} className="action-button compact-save">{isSaving ? savingLabel : label}</button><button type="button" onClick={onCancel} className="secondary-button">{clearLabel}</button></div>;
}

function AdminPicker({ value, options, placeholder, optional = false, onChange, onCreate }: { value: string; options: PickerOption[]; placeholder: string; optional?: boolean; onChange: (value: string) => void; onCreate: (value: string) => void }) {
  const hasMatchingOption = options.some((option) => sameName(pickerValue(option), value));
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState('');
  const isNepali = /[\u0900-\u097F]/.test(placeholder);
  const newLabel = isNepali ? `à¤¨à¤¯à¤¾à¤ ${placeholder}` : `New ${placeholder}`;
  const cancelLabel = isNepali ? 'à¤°à¤¦à¥à¤¦ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥' : 'Cancel';
  const noDeityLabel = isNepali ? 'à¤¦à¥‡à¤µà¤¤à¤¾ à¤›à¥ˆà¤¨' : 'No deity';
  const typeNewLabel = isNepali ? `à¤¨à¤¯à¤¾à¤ ${placeholder} à¤²à¥‡à¤–à¥à¤¨à¥à¤¹à¥‹à¤¸à¥` : `Type new ${placeholder.toLowerCase()}`;
  const createLabel = isNepali ? 'à¤¸à¤¿à¤°à¥à¤œà¤¨à¤¾ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥' : 'Create';
  return (
    <div className="picker-field compact-picker">
      <select
        className="admin-input compact-input admin-select"
        value={hasMatchingOption ? value : ''}
        onChange={(e) => {
          onChange(e.target.value);
          setIsCreating(false);
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={pickerValue(option)} value={pickerValue(option)}>{pickerLabel(option)}</option>)}
      </select>
      <div className="button-row">
        {optional && <button type="button" className="secondary-button" onClick={() => onChange('')}>{noDeityLabel}</button>}
        {!isCreating ? (
          <button type="button" className="secondary-button" onClick={() => { setDraft(''); setIsCreating(true); }}>
            {newLabel}
          </button>
        ) : (
          <button type="button" className="secondary-button" onClick={() => { setDraft(''); setIsCreating(false); }}>
            {cancelLabel}
          </button>
        )}
      </div>
      {isCreating && (
        <div className="button-row compact-create-row">
          <input
            className="admin-input compact-input"
            placeholder={typeNewLabel}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="button"
            className="action-button"
            onClick={() => {
              const next = draft.trim();
              if (!next) return;
              onCreate(next);
              onChange(next);
              setDraft('');
              setIsCreating(false);
            }}
          >
            {createLabel}
          </button>
        </div>
      )}
    </div>
  );
}

function DeityImageEditor({
  deity,
  status,
  onUpload,
  onChange,
}: {
  deity: DeityInput;
  status: string | null;
  onUpload: (file: File | undefined) => void;
  onChange: (updater: (previous: DeityInput) => DeityInput) => void;
}) {
  const imageSrc = getDeityImageSrc(deity);
  const crop = deity.imageCrop || DEFAULT_IMAGE_CROP;
  const setCrop = (partial: Partial<typeof crop>) => onChange((previous) => ({ ...previous, imageCrop: { ...(previous.imageCrop || DEFAULT_IMAGE_CROP), ...partial } }));

  return (
    <div className="deity-image-editor">
      <div className="button-row compact-create-row">
        <label className="secondary-button file-upload-button">
          <Upload size={15} />
          <span>Upload image</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => {
              onUpload(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
        </label>
        <button type="button" className="secondary-button" onClick={() => setCrop(DEFAULT_IMAGE_CROP)}>
          <RotateCcw size={15} />
          <span>Reset image adjustment</span>
        </button>
      </div>

      <div className="deity-crop-row">
        <div className="deity-crop-preview" aria-label="Circular deity image preview">
          {imageSrc ? (
            <img src={imageSrc} alt="" className="deity-crop-image" style={getDeityImageStyle(deity)} />
          ) : (
            <div className="symbol-medallion deity-tile-medallion">{deity.name.trim().charAt(0) || 'Om'}</div>
          )}
        </div>
        <div className="deity-crop-controls">
          <label className="range-field">
            <span>Zoom</span>
            <input type="range" min="0.8" max="2.4" step="0.05" value={crop.scale} onChange={(event) => setCrop({ scale: Number(event.target.value) })} />
          </label>
          <label className="range-field">
            <span>Horizontal position</span>
            <input type="range" min="-35" max="35" step="1" value={crop.x} onChange={(event) => setCrop({ x: Number(event.target.value) })} />
          </label>
          <label className="range-field">
            <span>Vertical position</span>
            <input type="range" min="-35" max="35" step="1" value={crop.y} onChange={(event) => setCrop({ y: Number(event.target.value) })} />
          </label>
        </div>
      </div>
      {status && <p className="admin-helper-text">{status}</p>}
    </div>
  );
}

function AdminRecordList({ title, toolbar, children }: { title: string; toolbar?: ReactNode; children: ReactNode }) {
  return <section className="admin-card admin-list compact-list"><div className="section-header"><SectionTitle title={title} />{toolbar}</div><div className="record-list">{children}</div></section>;
}

function AdminRecord({ title, subtitle, editLabel = 'Edit', onEdit, onDelete }: { key?: string; title: string; subtitle: string; editLabel?: string; onEdit: () => void; onDelete: () => void }) {
  const deleteLabel = editLabel === 'à¤¸à¤®à¥à¤ªà¤¾à¤¦à¤¨' ? `${title} à¤®à¥‡à¤Ÿà¤¾à¤‰à¤¨à¥à¤¹à¥‹à¤¸à¥` : `Delete ${title}`;
  return <article className="record-card compact-record"><div className="record-card-copy"><p className="record-title">{title}</p><p className="record-subtitle">{subtitle}</p></div><div className="record-actions"><button onClick={onEdit} className="secondary-button">{editLabel}</button><button onClick={onDelete} className="icon-button" aria-label={deleteLabel}><Trash2 size={16} /></button></div></article>;
}

function AdminBackupAction({ title, text, button }: { title: string; text: string; button: ReactNode }) {
  return <section className="backup-section"><div><p className="backup-title">{title}</p><p className="body-copy">{text}</p></div>{button}</section>;
}

function AdminMessage({ tone, text, onDismiss }: { tone: 'success' | 'error' | 'neutral' | 'info'; text: string; onDismiss?: () => void }) {
  return (
    <div className={`message-banner message-${tone}`}>
      <span>{text}</span>
      {onDismiss && (
        <button type="button" className="message-close" onClick={onDismiss} aria-label="Dismiss message">
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default function AdminPanel({
  isOpen,
  stotras,
  categories,
  deities,
  poojaBidhi,
  stories,
  isSaving,
  message,
  errorMessage,
  localContentActive,
  localDraftNewer,
  language,
  onClose,
  onSaveStotra,
  onDeleteStotra,
  onSaveCategory,
  onDeleteCategory,
  onSaveDeity,
  onDeleteDeity,
  onSavePoojaBidhi,
  onDeletePoojaBidhi,
  onSaveStory,
  onDeleteStory,
  onExportAllContent,
  onImportAllContent,
  onResetToDefaultContent,
  onPublishContent,
  onLogoutAdmin,
}: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>('deities');
  const [notice, setNotice] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [query, setQuery] = useState('');
  const [deityForm, setDeityForm] = useState<DeityInput>(emptyDeity);
  const [contentForm, setContentForm] = useState<StotraInput>(emptyContent);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);
  const [imageUploadStatus, setImageUploadStatus] = useState<string | null>(null);
  const [poojaForm, setPoojaForm] = useState<PoojaBidhiInput>(emptyPooja);
  const [poojaText, setPoojaText] = useState({ materials: '', steps: '', benefits: '', materialsNe: '', stepsNe: '', benefitsNe: '' });
  const [storyForm, setStoryForm] = useState<HinduStoryInput>(emptyStory);
  const [categoryForm, setCategoryForm] = useState<CategoryInput>(emptyCategory);
  const [editing, setEditing] = useState<{ type: Tab; id: string } | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Record<string, boolean>>({});
  const [translating, setTranslating] = useState<Record<string, boolean>>({});
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [cropperFor, setCropperFor] = useState<string>('');
  const [cropperAspect, setCropperAspect] = useState<number | null>(null);

  function detectLang(text: string): 'sa' | 'ne' | 'en' {
    const devChars = (text.match(/[\u0900-\u097F]/g) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    if (devChars / (totalChars || 1) > 0.5) {
      const lines = text.split('\n').filter(l => l.trim());
      const avgLineLen = lines.reduce((s, l) => s + l.length, 0) / (lines.length || 1);
      return avgLineLen > 25 ? 'sa' : 'ne';
    }
    return 'en';
  }

  async function autoTranslate(
    fieldId: string,
    text: string,
    onResult: (translated: string, romanized?: string) => void
  ) {
    if (!text || text.trim().length < 3) return;
    setTranslating(t => ({ ...t, [fieldId]: true }));
    try {
      const lang = detectLang(text);
      if (lang === 'sa') {
        const res = await fetch('/.netlify/functions/translate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, from: 'sa', to: 'latn' }),
        });
        const data = await res.json();
        onResult('', data.result || '');
      } else if (lang === 'ne') {
        const res = await fetch('/.netlify/functions/translate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, from: 'ne', to: 'en' }),
        });
        const data = await res.json();
        onResult(data.result || '');
      } else {
        const res = await fetch('/.netlify/functions/translate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, from: 'en', to: 'ne' }),
        });
        const data = await res.json();
        onResult(data.result || '');
      }
    } catch {
      // Users can still edit translations manually if the external API is unavailable.
    } finally {
      setTranslating(t => ({ ...t, [fieldId]: false }));
    }
  }

  const labels = adminLabels[language];
  const localDraftNotice = language === 'ne'
    ? 'This browser has a newer unsynced local draft than the remote content. Publish to GitHub to make it live, or export a backup.'
    : 'This browser has a newer unsynced local draft than the remote content. Publish to GitHub to make it live, or export a backup.';
  const ui = language === 'ne'
    ? {
        kicker: 'à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤¸à¥à¤Ÿà¥à¤¡à¤¿à¤¯à¥‹',
        title: 'Om Stotra Sagar à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤µà¥à¤¯à¤µà¤¸à¥à¤¥à¤¾à¤ªà¤¨',
        subtitle: 'à¤¸à¥‡à¤­ à¤—à¤°à¥à¤¦à¤¾ à¤¯à¥‹ à¤¬à¥à¤°à¤¾à¤‰à¤œà¤°à¤®à¤¾ à¤¤à¥à¤°à¥à¤¨à¥à¤¤à¥ˆ à¤²à¥‡à¤–à¤¿à¤¨à¥à¤›à¥¤ GitHub à¤®à¤¾ à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¨ à¤µà¥ˆà¤•à¤²à¥à¤ªà¤¿à¤• backend à¤®à¤¾à¤°à¥à¤«à¤¤ à¤®à¤¾à¤¤à¥à¤° à¤¹à¥à¤¨à¥à¤›à¥¤',
        localActive: 'à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤¬à¥à¤°à¤¾à¤‰à¤œà¤° à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤¸à¤•à¥à¤°à¤¿à¤¯ à¤›à¥¤ à¤¤à¤¯à¤¾à¤° à¤­à¤à¤ªà¤›à¤¿ à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤ à¤µà¤¾ à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¨ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤',
        instantSave: 'à¤¸à¥‡à¤­ à¤—à¤°à¥à¤¦à¤¾ à¤¯à¥‹ à¤¬à¥à¤°à¤¾à¤‰à¤œà¤°à¤®à¤¾ à¤¤à¥à¤°à¥à¤¨à¥à¤¤à¥ˆ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤¹à¥à¤¨à¥à¤›à¥¤ GitHub à¤®à¤¾ à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¨ à¤µà¥ˆà¤•à¤²à¥à¤ªà¤¿à¤• à¤° à¤…à¤²à¤— à¤›à¥¤',
        deityTitle: editing?.type === 'deities' ? 'à¤¦à¥‡à¤µà¤¤à¤¾ à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤² à¤¸à¤®à¥à¤ªà¤¾à¤¦à¤¨' : 'à¤¦à¥‡à¤µà¤¤à¤¾ à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤² à¤¥à¤ªà¥à¤¨à¥à¤¹à¥‹à¤¸à¥',
        contentTitle: editing?.type === 'content' ? 'à¤­à¤•à¥à¤¤à¤¿à¤ªà¥‚à¤°à¥à¤£ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤¸à¤®à¥à¤ªà¤¾à¤¦à¤¨' : 'à¤­à¤•à¥à¤¤à¤¿à¤ªà¥‚à¤°à¥à¤£ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤¥à¤ªà¥à¤¨à¥à¤¹à¥‹à¤¸à¥',
        poojaTitle: editing?.type === 'pooja' ? 'à¤ªà¥‚à¤œà¤¾ à¤µà¤¿à¤§à¤¿ à¤¸à¤®à¥à¤ªà¤¾à¤¦à¤¨' : 'à¤ªà¥‚à¤œà¤¾ à¤µà¤¿à¤§à¤¿ à¤¥à¤ªà¥à¤¨à¥à¤¹à¥‹à¤¸à¥',
        categoryTitle: editing?.type === 'categories' ? 'à¤¶à¥à¤°à¥‡à¤£à¥€ à¤¸à¤®à¥à¤ªà¤¾à¤¦à¤¨' : 'à¤¶à¥à¤°à¥‡à¤£à¥€ à¤¥à¤ªà¥à¤¨à¥à¤¹à¥‹à¤¸à¥',
        contentList: 'à¤­à¤•à¥à¤¤à¤¿à¤ªà¥‚à¤°à¥à¤£ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€',
        poojaList: 'à¤ªà¥‚à¤œà¤¾ à¤µà¤¿à¤§à¤¿',
        categoryList: 'à¤¶à¥à¤°à¥‡à¤£à¥€à¤¹à¤°à¥‚',
      }
    : {
        kicker: 'Local Content Studio',
        title: 'Manage Om Stotra Sagar content',
        subtitle: 'Save writes to this browser. Publish writes to GitHub only through the optional backend.',
        localActive: 'Local browser content is active. Export or publish it when ready.',
        instantSave: 'Save updates this browser instantly. Publish to GitHub is optional and separate.',
        deityTitle: editing?.type === 'deities' ? 'Edit Deity Profile' : 'Add Deity Profile',
        contentTitle: editing?.type === 'content' ? 'Edit Devotional Content' : 'Add Devotional Content',
        poojaTitle: editing?.type === 'pooja' ? 'Edit Pooja Bidhi' : 'Add Pooja Bidhi',
        categoryTitle: editing?.type === 'categories' ? 'Edit Category' : 'Add Category',
        contentList: 'Devotional Content',
        poojaList: 'Pooja Bidhi',
        categoryList: 'Categories',
      };

  const resetPoojaForm = (value: PoojaBidhiInput) => {
    setPoojaForm(value);
    setPoojaText({
      materials: textFromList(value.materials),
      steps: textFromList(value.steps),
      benefits: textFromList(value.benefits),
      materialsNe: textFromList(value.materialsNe),
      stepsNe: textFromList(value.stepsNe),
      benefitsNe: textFromList(value.benefitsNe),
    });
  };

  const resetDeityForm = () => {
    setDeityForm(emptyDeity);
    setEditing(null);
    setImageUploadStatus(null);
  };

  const resetContentForm = () => {
    setContentForm(emptyContent);
    setEditing(null);
    setPdfStatus(null);
  };

  async function handleImageFile(file: File | undefined, fieldName: string, aspectRatio: number | null = null) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageUploadStatus('File is not an image (jpg, png, webp, gif allowed).');
      return;
    }
    setImageUploadStatus(language === 'ne' ? 'à¤¤à¤¸à¥à¤µà¥€à¤° à¤•à¥à¤°à¤ª à¤—à¤°à¥à¤¨ à¤¤à¤¯à¤¾à¤° à¤›à¥¤' : 'Image ready to crop.');
    const reader = new FileReader();
    reader.onerror = () => setImageUploadStatus(`Could not read image: ${reader.error?.message || 'unknown error'}`);
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== 'string' || !result.startsWith('data:image/')) {
        setImageUploadStatus('Invalid image data returned by browser.');
        return;
      }
      setCropperSrc(result);
      setCropperFor(fieldName);
      setCropperAspect(aspectRatio);
    };
    reader.readAsDataURL(file);
  }


  const handlePdfUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setPdfStatus('Upload a PDF file.');
      return;
    }
    setPdfStatus(language === 'ne' ? 'PDF à¤¬à¤¾à¤Ÿ à¤ªà¤¾à¤  à¤¨à¤¿à¤•à¤¾à¤²à¤¿à¤à¤¦à¥ˆà¤›...' : 'Extracting text from PDF...');
    try {
      const text = await extractPdfText(file);
      if (!text.trim()) {
        setPdfStatus('PDF text could not be extracted. Please paste the text manually or attach the PDF as source.');
        setContentForm((prev) => ({ ...prev, sourcePdfName: file.name }));
        return;
      }
      setContentForm((prev) => ({ ...prev, content: text, sourcePdfName: file.name }));
      setPdfStatus(language === 'ne' ? 'PDF à¤ªà¤¾à¤  textarea à¤®à¤¾ à¤°à¤¾à¤–à¤¿à¤¯à¥‹à¥¤ à¤¸à¥‡à¤­ à¤—à¤°à¥à¤¨à¥ à¤…à¤˜à¤¿ à¤œà¤¾à¤à¤š/à¤¸à¤®à¥à¤ªà¤¾à¤¦à¤¨ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤' : 'Extracted PDF text was placed in the textarea. Review and edit before saving.');
    } catch {
      setPdfStatus('PDF text could not be extracted. Please paste the text manually or attach the PDF as source.');
      setContentForm((prev) => ({ ...prev, sourcePdfName: file.name }));
    }
  };

  const filteredContent = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return stotras;
    return stotras.filter((item) => [item.title, item.deity, item.category, item.content, item.meaning, item.nepaliMeaning, ...(item.tags || [])].some((part) => part?.toLowerCase().includes(value)));
  }, [query, stotras]);

  if (!isOpen) return null;

  const duplicateDeity = (name: string, id?: string) => deities.some((item) => item.id !== id && sameName(item.name, name));
  const duplicateCategory = (name: string, id?: string) => categories.some((item) => item.id !== id && sameName(item.name, name));
  const noticeText = {
    nameRequired: language === 'ne' ? 'à¤¨à¤¾à¤® à¤…à¤¨à¤¿à¤µà¤¾à¤°à¥à¤¯ à¤›à¥¤' : 'Name is required.',
    deityDuplicate: language === 'ne' ? 'à¤¯à¥‹ à¤¨à¤¾à¤®à¤•à¥‹ à¤¦à¥‡à¤µà¤¤à¤¾ à¤ªà¤¹à¤¿à¤²à¥‡ à¤¨à¥ˆ à¤›à¥¤' : 'A deity with this name already exists.',
    deitySaved: language === 'ne' ? 'à¤¦à¥‡à¤µà¤¤à¤¾ à¤ªà¥à¤°à¥‹à¤«à¤¾à¤‡à¤² à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤°à¥‚à¤ªà¤®à¤¾ à¤¸à¥‡à¤­ à¤­à¤¯à¥‹à¥¤' : 'Deity profile saved locally.',
    contentRequired: language === 'ne' ? 'à¤¶à¥€à¤°à¥à¤·à¤•, à¤¦à¥‡à¤µà¤¤à¤¾, à¤¶à¥à¤°à¥‡à¤£à¥€ à¤° à¤ªà¥‚à¤°à¤¾ à¤ªà¤¾à¤  à¤…à¤¨à¤¿à¤µà¤¾à¤°à¥à¤¯ à¤›à¤¨à¥à¥¤' : 'Title, deity, category, and full text are required.',
    titleLength: language === 'ne' ? 'à¤¶à¥€à¤°à¥à¤·à¤• à¥§à¥¨à¥¦ à¤…à¤•à¥à¤·à¤° à¤µà¤¾ à¤•à¤® à¤¹à¥à¤¨à¥à¤ªà¤°à¥à¤›à¥¤' : 'Title must be 120 characters or fewer.',
    contentLength: language === 'ne' ? 'à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¥«à¥¦à¥¦à¥¦ à¤…à¤•à¥à¤·à¤° à¤µà¤¾ à¤•à¤® à¤¹à¥à¤¨à¥à¤ªà¤°à¥à¤›à¥¤' : 'Content must be 5000 characters or fewer.',
    meaningLength: language === 'ne' ? 'à¤…à¤°à¥à¤¥ à¥©à¥¦à¥¦à¥¦ à¤…à¤•à¥à¤·à¤° à¤µà¤¾ à¤•à¤® à¤¹à¥à¤¨à¥à¤ªà¤°à¥à¤›à¥¤' : 'Meaning must be 3000 characters or fewer.',
    benefitsLength: language === 'ne' ? 'à¤²à¤¾à¤­ à¥§à¥¦à¥¦à¥¦ à¤…à¤•à¥à¤·à¤° à¤µà¤¾ à¤•à¤® à¤¹à¥à¤¨à¥à¤ªà¤°à¥à¤›à¥¤' : 'Benefits must be 1000 characters or fewer.',
    contentSaved: language === 'ne' ? 'à¤­à¤•à¥à¤¤à¤¿à¤ªà¥‚à¤°à¥à¤£ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤¯à¥‹ à¤¬à¥à¤°à¤¾à¤‰à¤œà¤°à¤®à¤¾ à¤¸à¥‡à¤­ à¤­à¤¯à¥‹à¥¤' : 'Devotional content saved to this browser.',
    poojaRequired: language === 'ne' ? 'à¤¶à¥€à¤°à¥à¤·à¤•, à¤¦à¥‡à¤µà¤¤à¤¾ à¤° à¤¸à¤¾à¤°à¤¾à¤‚à¤¶ à¤…à¤¨à¤¿à¤µà¤¾à¤°à¥à¤¯ à¤›à¤¨à¥à¥¤' : 'Title, deity, and overview are required.',
    poojaSaved: language === 'ne' ? 'à¤ªà¥‚à¤œà¤¾ à¤µà¤¿à¤§à¤¿ à¤¯à¥‹ à¤¬à¥à¤°à¤¾à¤‰à¤œà¤°à¤®à¤¾ à¤¸à¥‡à¤­ à¤­à¤¯à¥‹à¥¤' : 'Pooja Bidhi saved to this browser.',
    storyRequired: language === 'ne' ? 'à¤¶à¥€à¤°à¥à¤·à¤•, à¤¸à¤¾à¤°à¤¾à¤‚à¤¶ à¤° à¤•à¤¥à¤¾ à¤…à¤¨à¤¿à¤µà¤¾à¤°à¥à¤¯ à¤›à¤¨à¥à¥¤' : 'Title, summary, and story are required.',
    storySaved: language === 'ne' ? 'à¤•à¤¥à¤¾ à¤¯à¥‹ à¤¬à¥à¤°à¤¾à¤‰à¤œà¤°à¤®à¤¾ à¤¸à¥‡à¤­ à¤­à¤¯à¥‹à¥¤' : 'Story saved to this browser.',
    categoryRequired: language === 'ne' ? 'à¤¶à¥à¤°à¥‡à¤£à¥€ à¤¨à¤¾à¤® à¤…à¤¨à¤¿à¤µà¤¾à¤°à¥à¤¯ à¤›à¥¤' : 'Category name is required.',
    categoryDuplicate: language === 'ne' ? 'à¤¯à¥‹ à¤¨à¤¾à¤®à¤•à¥‹ à¤¶à¥à¤°à¥‡à¤£à¥€ à¤ªà¤¹à¤¿à¤²à¥‡ à¤¨à¥ˆ à¤›à¥¤' : 'A category with this name already exists.',
    categorySaved: language === 'ne' ? 'à¤¶à¥à¤°à¥‡à¤£à¥€ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤°à¥‚à¤ªà¤®à¤¾ à¤¸à¥‡à¤­ à¤­à¤¯à¥‹à¥¤' : 'Category saved locally.',
  };

  const submitDeity = (event: FormEvent) => {
    event.preventDefault();
    const id = editing?.type === 'deities' ? editing.id : undefined;
    if (!deityForm.name.trim()) return setNotice(noticeText.nameRequired);
    if (duplicateDeity(deityForm.name, id)) return setNotice(noticeText.deityDuplicate);
    const saved = onSaveDeity({ ...deityForm, description: deityForm.introduction || deityForm.description, tags: deityForm.tags || [] }, id);
    if (saved) {
      resetDeityForm();
      setNotice(noticeText.deitySaved);
    }
  };

  const submitContent = (event: FormEvent) => {
    event.preventDefault();
    const id = editing?.type === 'content' ? editing.id : undefined;
    if (!contentForm.title.trim() || !contentForm.deity.trim() || !contentForm.category.trim() || !contentForm.content.trim()) return setNotice(noticeText.contentRequired);
    if (contentForm.title.length > 120) return setNotice(noticeText.titleLength);
    if (contentForm.content.length > 50000) return setNotice(noticeText.contentLength);
    if ((contentForm.meaning || contentForm.nepaliMeaning || '').length > 3000) return setNotice(noticeText.meaningLength);
    if ((contentForm.benefits || '').length > 1000) return setNotice(noticeText.benefitsLength);
    onSaveStotra({ ...contentForm, nepaliMeaning: contentForm.meaning || contentForm.nepaliMeaning, tags: contentForm.tags || [] }, id);
    resetContentForm();
    setNotice(noticeText.contentSaved);
  };

  const submitPooja = (event: FormEvent) => {
    event.preventDefault();
    const id = editing?.type === 'pooja' ? editing.id : undefined;
    if (!poojaForm.title.trim() || !poojaForm.deity.trim() || !poojaForm.overview.trim()) return setNotice(noticeText.poojaRequired);
    onSavePoojaBidhi({
      ...poojaForm,
      materials: linesFromText(poojaText.materials),
      steps: linesFromText(poojaText.steps),
      benefits: linesFromText(poojaText.benefits),
      materialsNe: linesFromText(poojaText.materialsNe),
      stepsNe: linesFromText(poojaText.stepsNe),
      benefitsNe: linesFromText(poojaText.benefitsNe),
    }, id);
    setPoojaForm(emptyPooja);
    setPoojaText({ materials: '', steps: '', benefits: '', materialsNe: '', stepsNe: '', benefitsNe: '' });
    setEditing(null);
    setNotice(noticeText.poojaSaved);
  };

  const submitStory = (event: FormEvent) => {
    event.preventDefault();
    const id = editing?.type === 'stories' ? editing.id : undefined;
    if (!storyForm.title.trim() || !storyForm.summary.trim() || !storyForm.story.trim()) return setNotice(noticeText.storyRequired);
    onSaveStory(storyForm, id);
    setStoryForm(emptyStory);
    setEditing(null);
    setNotice(noticeText.storySaved);
  };

  const submitCategory = (event: FormEvent) => {
    event.preventDefault();
    const id = editing?.type === 'categories' ? editing.id : undefined;
    if (!categoryForm.name.trim()) return setNotice(noticeText.categoryRequired);
    if (duplicateCategory(categoryForm.name, id)) return setNotice(noticeText.categoryDuplicate);
    const saved = onSaveCategory(categoryForm, id);
    if (saved) {
      setCategoryForm(emptyCategory);
      setEditing(null);
      setNotice(noticeText.categorySaved);
    }
  };

  const deleteDeity = (deity: Deity) => {
    const hasRelated = stotras.some((item) => item.deity === deity.name) || poojaBidhi.some((item) => item.deity === deity.name) || stories.some((item) => item.deity === deity.name);
    const warning = language === 'ne'
      ? (hasRelated ? 'à¤¯à¥‹ à¤¦à¥‡à¤µà¤¤à¤¾à¤¸à¤à¤— à¤¸à¤®à¥à¤¬à¤¨à¥à¤§à¤¿à¤¤ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤›à¥¤ à¤®à¥‡à¤Ÿà¤¾à¤‰à¤à¤¦à¤¾ à¤¤à¥€ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤›à¥à¤Ÿà¥à¤Ÿà¤¿à¤¨ à¤¸à¤•à¥à¤›à¤¨à¥à¥¤ à¤¤à¥ˆà¤ªà¤¨à¤¿ à¤®à¥‡à¤Ÿà¤¾à¤‰à¤¨à¥‡?' : `${deity.name} à¤®à¥‡à¤Ÿà¤¾à¤‰à¤¨à¥‡?`)
      : (hasRelated ? 'This deity has related content. Deleting it may orphan related items. Delete anyway?' : `Delete ${deity.name}?`);
    if (confirm(warning)) onDeleteDeity(deity.id);
  };

  const deleteCategory = (category: Category) => {
    const used = stotras.some((item) => item.category === category.name);
    const warning = language === 'ne'
      ? (used ? 'à¤¯à¥‹ à¤¶à¥à¤°à¥‡à¤£à¥€ à¤­à¤•à¥à¤¤à¤¿à¤ªà¥‚à¤°à¥à¤£ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€à¤®à¤¾ à¤ªà¥à¤°à¤¯à¥‹à¤— à¤­à¤à¤•à¥‹ à¤›à¥¤ à¤®à¥‡à¤Ÿà¤¾à¤‰à¤à¤¦à¤¾ à¤¸à¤®à¥à¤¬à¤¨à¥à¤§à¤¿à¤¤ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤›à¥à¤Ÿà¥à¤Ÿà¤¿à¤¨ à¤¸à¤•à¥à¤›à¥¤ à¤¤à¥ˆà¤ªà¤¨à¤¿ à¤®à¥‡à¤Ÿà¤¾à¤‰à¤¨à¥‡?' : `${category.name} à¤®à¥‡à¤Ÿà¤¾à¤‰à¤¨à¥‡?`)
      : (used ? 'This category is used by devotional content. Deleting it may orphan related items. Delete anyway?' : `Delete ${category.name}?`);
    if (confirm(warning)) onDeleteCategory(category.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
      {cropperSrc && (
        <div className="cropper-modal-overlay">
          <div className="cropper-modal">
            <ImageCropper
              src={cropperSrc}
              aspectRatio={cropperAspect}
              outputSize={{ w: 800, h: 600 }}
              onDone={(dataUrl) => {
                if (cropperFor === 'deityImage') {
                  setDeityForm((prev) => ({
                    ...prev,
                    imageDataUrl: dataUrl,
                    imageSrc: dataUrl,
                    imageCrop: prev.imageCrop || DEFAULT_IMAGE_CROP,
                  }));
                  setImageUploadStatus(language === 'ne' ? 'à¤¤à¤¸à¥à¤µà¥€à¤° à¤¥à¤ªà¤¿à¤¯à¥‹à¥¤ à¤¸à¥‡à¤­ à¤—à¤°à¥à¤¨à¥ à¤…à¤˜à¤¿ à¤®à¤¿à¤²à¤¾à¤‰à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤' : 'Image added. Adjust it before saving.');
                }
                setCropperSrc(null);
                setCropperFor('');
                setCropperAspect(null);
              }}
              onCancel={() => {
                setCropperSrc(null);
                setCropperFor('');
                setCropperAspect(null);
              }}
            />
          </div>
        </div>
      )}
      <div onClick={onClose} className="absolute inset-0 bg-deep-blue/72 backdrop-blur-sm" />
      <section className="admin-studio premium-shell admin-panel compact-admin relative z-10 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden">
        <header className="premium-header admin-hero compact-admin-header">
          <div>
            <p className="section-kicker">{ui.kicker}</p>
            <h2 className="compact-admin-title">{ui.title}</h2>
            <p className="compact-admin-subtitle">{ui.subtitle}</p>
          </div>
          <button onClick={onLogoutAdmin} className="secondary-button">{labels.logout}</button>
          <button onClick={onClose} className="icon-button" aria-label="Close admin"><X size={18} /></button>
        </header>

        <nav className="admin-tabs nav-menu compact-tabs" aria-label="Admin sections">
          <TabButton active={tab === 'deities'} onClick={() => setTab('deities')} icon={<Sparkles size={15} />} label={labels.deitiesProfiles} />
          <TabButton active={tab === 'content'} onClick={() => setTab('content')} icon={<ScrollText size={15} />} label={labels.devotionalContent} />
          <TabButton active={tab === 'pooja'} onClick={() => setTab('pooja')} icon={<Layers size={15} />} label={labels.poojaBidhi} />
          <TabButton active={tab === 'categories'} onClick={() => setTab('categories')} icon={<Layers size={15} />} label={labels.categories} />
          <TabButton active={tab === 'backup'} onClick={() => setTab('backup')} icon={<Download size={15} />} label={labels.backupPublish} />
        </nav>

        <div className="admin-body compact-admin-body">
          <div className="admin-banner-stack">
            {!dismissedAlerts[`info:${ui.instantSave}`] && (
              <AdminMessage
                tone="info"
                text={ui.instantSave}
                onDismiss={() => setDismissedAlerts((prev) => ({ ...prev, [`info:${ui.instantSave}`]: true }))}
              />
            )}
            {localDraftNewer && !dismissedAlerts[`neutral:${localDraftNotice}`] && (
              <AdminMessage
                tone="neutral"
                text={localDraftNotice}
                onDismiss={() => setDismissedAlerts((prev) => ({ ...prev, [`neutral:${localDraftNotice}`]: true }))}
              />
            )}
            {localContentActive && !localDraftNewer && !dismissedAlerts[`neutral:${ui.localActive}`] && (
              <AdminMessage
                tone="neutral"
                text={ui.localActive}
                onDismiss={() => setDismissedAlerts((prev) => ({ ...prev, [`neutral:${ui.localActive}`]: true }))}
              />
            )}
          </div>
          {message && !dismissedAlerts[`success:${message}`] && (
            <AdminMessage tone="success" text={message} onDismiss={() => setDismissedAlerts((prev) => ({ ...prev, [`success:${message}`]: true }))} />
          )}
          {errorMessage && !dismissedAlerts[`error:${errorMessage}`] && (
            <AdminMessage tone="error" text={errorMessage} onDismiss={() => setDismissedAlerts((prev) => ({ ...prev, [`error:${errorMessage}`]: true }))} />
          )}
          {notice && !dismissedAlerts[`neutral:${notice}`] && (
            <AdminMessage tone="neutral" text={notice} onDismiss={() => setDismissedAlerts((prev) => ({ ...prev, [`neutral:${notice}`]: true }))} />
          )}

          {tab === 'deities' && (
            <div className="admin-grid compact-admin-grid">
              <form onSubmit={submitDeity} className="admin-card compact-form">
                <SectionTitle title={ui.deityTitle} />
                <input className="admin-input compact-input" placeholder={labels.name} value={deityForm.name} onChange={(e) => setDeityForm((p) => ({ ...p, name: e.target.value }))} />
                <select className="admin-input compact-input" value={deityForm.type || 'Other'} onChange={(e) => setDeityForm((p) => ({ ...p, type: e.target.value as Deity['type'] }))}>{deityTypes.map((type) => <option key={type} value={type}>{language === 'ne' ? ({ God: 'à¤¦à¥‡à¤µà¤¤à¤¾', Goddess: 'à¤¦à¥‡à¤µà¥€', Form: 'à¤¸à¥à¤µà¤°à¥‚à¤ª', Other: 'à¤…à¤¨à¥à¤¯' } as Record<string, string>)[type] : type}</option>)}</select>
                <input className="admin-input compact-input" placeholder={labels.sanskritName} value={deityForm.sanskritName || ''} onChange={(e) => setDeityForm((p) => ({ ...p, sanskritName: e.target.value }))} />
                <input className="admin-input compact-input" placeholder={labels.imageUrl} value={deityForm.imageUrl || ''} onChange={(e) => setDeityForm((p) => ({ ...p, imageUrl: e.target.value }))} />
                <DeityImageEditor deity={deityForm} status={imageUploadStatus} onUpload={(file) => handleImageFile(file, 'deityImage', 1)} onChange={setDeityForm} />
                <textarea className="admin-input compact-textarea" rows={7} placeholder={labels.introduction} value={deityForm.introduction || deityForm.description || ''} onChange={(e) => setDeityForm((p) => ({ ...p, introduction: e.target.value, description: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={7} placeholder={labels.significance} value={deityForm.significance} onChange={(e) => setDeityForm((p) => ({ ...p, significance: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={3} placeholder={labels.mantra} value={deityForm.mantra || ''} onChange={(e) => setDeityForm((p) => ({ ...p, mantra: e.target.value }))} />
                <details className="admin-nested-section">
                  <summary className="field-label">{labels.nepaliFields}</summary>
                  <input className="admin-input compact-input" placeholder={labels.nameNe} value={deityForm.nameNe || ''} onChange={(e) => setDeityForm((p) => ({ ...p, nameNe: e.target.value }))} />
                  <textarea className="admin-input compact-textarea" rows={4} placeholder={labels.introductionNe} value={deityForm.introductionNe || ''} onChange={(e) => setDeityForm((p) => ({ ...p, introductionNe: e.target.value }))} />
                  <textarea className="admin-input compact-textarea" rows={4} placeholder={labels.significanceNe} value={deityForm.significanceNe || ''} onChange={(e) => setDeityForm((p) => ({ ...p, significanceNe: e.target.value }))} />
                </details>
                <input className="admin-input compact-input" placeholder={`${labels.tags}, ${labels.commaSeparated}`} value={tagsToText(deityForm.tags)} onChange={(e) => setDeityForm((p) => ({ ...p, tags: tagsFromText(e.target.value) }))} />
                <AdminFormActions isSaving={isSaving} label={labels.saveDeity} clearLabel={labels.clear} onCancel={resetDeityForm} />
              </form>
              <AdminRecordList title={labels.deitiesProfiles}>{deities.map((deity) => <AdminRecord key={deity.id} title={getLocalizedDeityName(deity, language)} subtitle={`${getLocalizedDeityType(deity, language)} - ${getLocalizedText(language, deity.introductionNe, deity.introduction || deity.description)}`} editLabel={labels.edit} onEdit={() => { setDeityForm({ ...deity, imageCrop: deity.imageCrop || DEFAULT_IMAGE_CROP, introduction: deity.introduction || deity.description }); setImageUploadStatus(null); setEditing({ type: 'deities', id: deity.id }); }} onDelete={() => deleteDeity(deity)} />)}</AdminRecordList>
            </div>
          )}

          {tab === 'content' && (
            <div className="admin-grid compact-admin-grid">
              <form onSubmit={submitContent} className="admin-card compact-form">
                <SectionTitle title={ui.contentTitle} />
                <div className="field-group">
                  <input
                    className={`admin-input compact-input ${contentForm.title.length > 120 ? 'field-error' : ''}`}
                    placeholder={labels.title}
                    value={contentForm.title}
                    maxLength={170}
                    onChange={(e) => setContentForm((p) => ({ ...p, title: e.target.value }))}
                    onBlur={(e) => {
                      autoTranslate('stotraTitle', e.target.value, (translated) => {
                        if (translated) setContentForm(s => ({ ...s, alternateTitle: translated }));
                      });
                    }}
                  />
                  <span className={`char-count ${contentForm.title.length > 120 ? 'char-count-error' : ''}`}>{contentForm.title.length} / 120</span>
                  {translating['stotraTitle'] && (
                    <span className="translate-status"><Languages size={12} /><Loader2 size={12} className="spin-icon" /> Translating...</span>
                  )}
                </div>
                <input className="admin-input compact-input" placeholder={labels.alternateTitle} value={contentForm.alternateTitle || ''} onChange={(e) => setContentForm((p) => ({ ...p, alternateTitle: e.target.value }))} />
                <AdminPicker value={contentForm.deity} options={deities.map((d) => ({ value: d.name, label: getLocalizedDeityName(d, language) }))} placeholder={labels.deity} onChange={(value) => setContentForm((p) => ({ ...p, deity: value }))} onCreate={(name) => { const saved = onSaveDeity({ ...emptyDeity, name, nameNe: language === 'ne' ? name : undefined, introduction: language === 'ne' ? `${name} à¤•à¥‹ à¤ªà¤°à¤¿à¤šà¤¯` : `${name} profile introduction.`, introductionNe: language === 'ne' ? `${name} à¤•à¥‹ à¤ªà¤°à¤¿à¤šà¤¯` : undefined, description: language === 'ne' ? `${name} à¤•à¥‹ à¤ªà¤°à¤¿à¤šà¤¯` : `${name} profile introduction.`, significance: language === 'ne' ? 'à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¨ à¤…à¤˜à¤¿ à¤®à¤¹à¤¤à¥à¤¤à¥à¤µ à¤¥à¤ªà¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤' : 'Add significance before publishing.', significanceNe: language === 'ne' ? 'à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¨ à¤…à¤˜à¤¿ à¤®à¤¹à¤¤à¥à¤¤à¥à¤µ à¤¥à¤ªà¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤' : undefined, tags: [name.toLowerCase()] }); if (saved) setContentForm((p) => ({ ...p, deity: saved.name })); }} />
                <AdminPicker value={contentForm.category} options={categories.map((c) => ({ value: c.name, label: getLocalizedCategoryName(c, language) }))} placeholder={labels.category} onChange={(value) => setContentForm((p) => ({ ...p, category: value }))} onCreate={(name) => { const saved = onSaveCategory({ name, nameNe: language === 'ne' ? name : undefined, description: '', descriptionNe: language === 'ne' ? 'à¤¶à¥à¤°à¥‡à¤£à¥€ à¤µà¤¿à¤µà¤°à¤£' : undefined }); if (saved) setContentForm((p) => ({ ...p, category: saved.name })); }} />
                <input className="admin-input compact-input" placeholder={labels.imageUrl} value={contentForm.imageUrl || ''} onChange={(e) => setContentForm((p) => ({ ...p, imageUrl: e.target.value }))} />
                <details className="admin-nested-section pdf-import-section">
                  <summary className="field-label"><FileText size={15} /> Import from PDF / PDF à¤¬à¤¾à¤Ÿ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤²à¥à¤¯à¤¾à¤‰à¤¨à¥à¤¹à¥‹à¤¸à¥</summary>
                  <label className="secondary-button file-upload-button">
                    <Upload size={15} />
                    <span>Upload PDF</span>
                    <input type="file" accept="application/pdf,.pdf" onChange={handlePdfUpload} />
                  </label>
                  {contentForm.sourcePdfName && <p className="admin-helper-text">Source PDF: {contentForm.sourcePdfName}</p>}
                  {pdfStatus && <p className="admin-helper-text">{pdfStatus}</p>}
                </details>
                <CharCountTextarea
                  label={labels.contentFullText}
                  required
                  maxLength={50000}
                  rows={14}
                  placeholder={labels.contentFullText}
                  value={contentForm.content}
                  onChange={(e) => setContentForm((p) => ({ ...p, content: e.target.value }))}
                  onBlur={(e) => {
                    autoTranslate('stotraContent', e.target.value, (_translated, romanized) => {
                      if (romanized) setContentForm(s => ({ ...s, romanizedContent: romanized }));
                    });
                  }}
                  className="content-textarea devotional-textarea"
                />
                {translating['stotraContent'] && (
                  <span className="translate-status"><Languages size={12} /><Loader2 size={12} className="spin-icon" /> Translating...</span>
                )}
                <CharCountTextarea
                  label={labels.meaning}
                  maxLength={3000}
                  rows={5}
                  placeholder={labels.meaning}
                  value={contentForm.meaning || contentForm.nepaliMeaning || ''}
                  onChange={(e) => setContentForm((p) => ({ ...p, meaning: e.target.value, nepaliMeaning: e.target.value }))}
                  onBlur={(e) => {
                    autoTranslate('stotraMeaning', e.target.value, (translated) => {
                      if (translated) setContentForm(s => ({ ...s, nepaliMeaning: translated }));
                    });
                  }}
                />
                {translating['stotraMeaning'] && (
                  <span className="translate-status"><Languages size={12} /><Loader2 size={12} className="spin-icon" /> Translating...</span>
                )}
                <textarea className="admin-input compact-textarea" rows={4} placeholder={labels.wordMeaning} value={contentForm.wordMeaning || ''} onChange={(e) => setContentForm((p) => ({ ...p, wordMeaning: e.target.value }))} />
                <CharCountTextarea label={labels.benefits} maxLength={1000} rows={4} placeholder={labels.benefits} value={contentForm.benefits || ''} onChange={(e) => setContentForm((p) => ({ ...p, benefits: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={4} placeholder={labels.process} value={contentForm.process || ''} onChange={(e) => setContentForm((p) => ({ ...p, process: e.target.value }))} />
                <details className="admin-nested-section">
                  <summary className="field-label">{labels.nepaliFields}</summary>
                  <input className="admin-input compact-input" placeholder={labels.titleNe} value={contentForm.titleNe || ''} onChange={(e) => setContentForm((p) => ({ ...p, titleNe: e.target.value }))} />
                  <input className="admin-input compact-input" placeholder={labels.alternateTitleNe} value={contentForm.alternateTitleNe || ''} onChange={(e) => setContentForm((p) => ({ ...p, alternateTitleNe: e.target.value }))} />
                  <textarea
                    className="admin-input compact-textarea"
                    rows={4}
                    placeholder={labels.meaningNe}
                    value={contentForm.meaningNe || ''}
                    onChange={(e) => setContentForm((p) => ({ ...p, meaningNe: e.target.value }))}
                    onBlur={(e) => {
                      autoTranslate('stotraNepaliMeaning', e.target.value, (translated) => {
                        if (translated) setContentForm(s => ({ ...s, meaning: translated }));
                      });
                    }}
                  />
                  {translating['stotraNepaliMeaning'] && (
                    <span className="translate-status"><Languages size={12} /><Loader2 size={12} className="spin-icon" /> Translating...</span>
                  )}
                  <textarea className="admin-input compact-textarea" rows={4} placeholder={labels.wordMeaningNe} value={contentForm.wordMeaningNe || ''} onChange={(e) => setContentForm((p) => ({ ...p, wordMeaningNe: e.target.value }))} />
                  <textarea className="admin-input compact-textarea" rows={4} placeholder={labels.benefitsNe} value={contentForm.benefitsNe || ''} onChange={(e) => setContentForm((p) => ({ ...p, benefitsNe: e.target.value }))} />
                  <textarea className="admin-input compact-textarea" rows={4} placeholder={labels.processNe} value={contentForm.processNe || ''} onChange={(e) => setContentForm((p) => ({ ...p, processNe: e.target.value }))} />
                </details>
                <input className="admin-input compact-input" placeholder={labels.source} value={contentForm.source || ''} onChange={(e) => setContentForm((p) => ({ ...p, source: e.target.value }))} />
                <input className="admin-input compact-input" placeholder={`${labels.tags}, ${labels.commaSeparated}`} value={tagsToText(contentForm.tags)} onChange={(e) => setContentForm((p) => ({ ...p, tags: tagsFromText(e.target.value) }))} />
                <AdminFormActions isSaving={isSaving} label={labels.saveContent} clearLabel={labels.clear} onCancel={resetContentForm} />
              </form>
              <AdminRecordList title={ui.contentList} toolbar={<input className="admin-input compact-input" placeholder={labels.search} value={query} onChange={(e) => setQuery(e.target.value)} />}>{filteredContent.map((item) => <AdminRecord key={item.id} title={getLocalizedContentTitle(item, language)} subtitle={`${getLocalizedDeityName(item.deityNe || item.deity, language)} - ${getLocalizedCategoryName(item.categoryNe || item.category, language)}`} editLabel={labels.edit} onEdit={() => { setContentForm({ ...item, meaning: item.meaning || item.nepaliMeaning }); setPdfStatus(null); setEditing({ type: 'content', id: item.id }); }} onDelete={() => { if (confirm(language === 'ne' ? `${getLocalizedContentTitle(item, language)} à¤®à¥‡à¤Ÿà¤¾à¤‰à¤¨à¥‡?` : `Delete ${item.title}?`)) onDeleteStotra(item.id); }} />)}</AdminRecordList>
            </div>
          )}

          {tab === 'pooja' && (
            <div className="admin-grid compact-admin-grid">
              <form onSubmit={submitPooja} className="admin-card compact-form">
                <SectionTitle title={ui.poojaTitle} />
                <input className="admin-input compact-input" placeholder={labels.title} value={poojaForm.title} onChange={(e) => setPoojaForm((p) => ({ ...p, title: e.target.value }))} />
                <AdminPicker value={poojaForm.deity} options={deities.map((d) => ({ value: d.name, label: getLocalizedDeityName(d, language) }))} placeholder={labels.deity} onChange={(value) => setPoojaForm((p) => ({ ...p, deity: value }))} onCreate={(name) => { const saved = onSaveDeity({ ...emptyDeity, name, nameNe: language === 'ne' ? name : undefined, introduction: language === 'ne' ? `${name} à¤•à¥‹ à¤ªà¤°à¤¿à¤šà¤¯` : `${name} profile introduction.`, introductionNe: language === 'ne' ? `${name} à¤•à¥‹ à¤ªà¤°à¤¿à¤šà¤¯` : undefined, description: language === 'ne' ? `${name} à¤•à¥‹ à¤ªà¤°à¤¿à¤šà¤¯` : `${name} profile introduction.`, significance: language === 'ne' ? 'à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¨ à¤…à¤˜à¤¿ à¤®à¤¹à¤¤à¥à¤¤à¥à¤µ à¤¥à¤ªà¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤' : 'Add significance before publishing.', significanceNe: language === 'ne' ? 'à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¨ à¤…à¤˜à¤¿ à¤®à¤¹à¤¤à¥à¤¤à¥à¤µ à¤¥à¤ªà¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤' : undefined, tags: [name.toLowerCase()] }); if (saved) setPoojaForm((p) => ({ ...p, deity: saved.name })); }} />
                <input className="admin-input compact-input" placeholder={labels.occasion} value={poojaForm.occasion} onChange={(e) => setPoojaForm((p) => ({ ...p, occasion: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={5} placeholder={labels.overview} value={poojaForm.overview} onChange={(e) => setPoojaForm((p) => ({ ...p, overview: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={7} placeholder={labels.materials} value={poojaText.materials} onChange={(e) => setPoojaText((p) => ({ ...p, materials: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={8} placeholder={labels.steps} value={poojaText.steps} onChange={(e) => setPoojaText((p) => ({ ...p, steps: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={5} placeholder={labels.benefits} value={poojaText.benefits} onChange={(e) => setPoojaText((p) => ({ ...p, benefits: e.target.value }))} />
                <input className="admin-input compact-input" placeholder={labels.cautions} value={poojaForm.cautions || ''} onChange={(e) => setPoojaForm((p) => ({ ...p, cautions: e.target.value }))} />
                <details className="admin-nested-section">
                  <summary className="field-label">{labels.nepaliFields}</summary>
                  <input className="admin-input compact-input" placeholder={labels.titleNe} value={poojaForm.titleNe || ''} onChange={(e) => setPoojaForm((p) => ({ ...p, titleNe: e.target.value }))} />
                  <input className="admin-input compact-input" placeholder={labels.occasionNe} value={poojaForm.occasionNe || ''} onChange={(e) => setPoojaForm((p) => ({ ...p, occasionNe: e.target.value }))} />
                  <textarea className="admin-input compact-textarea" rows={4} placeholder={labels.overviewNe} value={poojaForm.overviewNe || ''} onChange={(e) => setPoojaForm((p) => ({ ...p, overviewNe: e.target.value }))} />
                  <textarea className="admin-input compact-textarea" rows={5} placeholder={labels.materialsNe} value={poojaText.materialsNe} onChange={(e) => setPoojaText((p) => ({ ...p, materialsNe: e.target.value }))} />
                  <textarea className="admin-input compact-textarea" rows={6} placeholder={labels.stepsNe} value={poojaText.stepsNe} onChange={(e) => setPoojaText((p) => ({ ...p, stepsNe: e.target.value }))} />
                  <textarea className="admin-input compact-textarea" rows={4} placeholder={labels.benefitsNe} value={poojaText.benefitsNe} onChange={(e) => setPoojaText((p) => ({ ...p, benefitsNe: e.target.value }))} />
                  <textarea className="admin-input compact-textarea" rows={3} placeholder={labels.cautionsNe} value={poojaForm.cautionsNe || ''} onChange={(e) => setPoojaForm((p) => ({ ...p, cautionsNe: e.target.value }))} />
                </details>
                <input className="admin-input compact-input" placeholder={labels.source} value={poojaForm.source || ''} onChange={(e) => setPoojaForm((p) => ({ ...p, source: e.target.value }))} />
                <input className="admin-input compact-input" placeholder={`${labels.tags}, ${labels.commaSeparated}`} value={tagsToText(poojaForm.tags)} onChange={(e) => setPoojaForm((p) => ({ ...p, tags: tagsFromText(e.target.value) }))} />
                <AdminFormActions isSaving={isSaving} label={labels.savePooja} clearLabel={labels.clear} onCancel={() => { setPoojaForm(emptyPooja); setPoojaText({ materials: '', steps: '', benefits: '', materialsNe: '', stepsNe: '', benefitsNe: '' }); setEditing(null); }} />
              </form>
              <AdminRecordList title={ui.poojaList}>{poojaBidhi.map((item) => <AdminRecord key={item.id} title={getLocalizedPoojaTitle(item, language)} subtitle={`${getLocalizedDeityName(item.deityNe || item.deity, language)} - ${getLocalizedText(language, item.occasionNe, item.occasion)}`} editLabel={labels.edit} onEdit={() => { resetPoojaForm(item); setEditing({ type: 'pooja', id: item.id }); }} onDelete={() => { if (confirm(language === 'ne' ? `${getLocalizedPoojaTitle(item, language)} à¤®à¥‡à¤Ÿà¤¾à¤‰à¤¨à¥‡?` : `Delete ${item.title}?`)) onDeletePoojaBidhi(item.id); }} />)}</AdminRecordList>
            </div>
          )}

          {tab === 'categories' && (
            <div className="admin-grid compact-admin-grid">
              <form onSubmit={submitCategory} className="admin-card compact-form">
                <SectionTitle title={ui.categoryTitle} />
                <input className="admin-input compact-input" placeholder={labels.name} value={categoryForm.name} onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={4} placeholder={labels.description} value={categoryForm.description || ''} onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))} />
                <details className="admin-nested-section">
                  <summary className="field-label">{labels.nepaliFields}</summary>
                  <input className="admin-input compact-input" placeholder={labels.nameNe} value={categoryForm.nameNe || ''} onChange={(e) => setCategoryForm((p) => ({ ...p, nameNe: e.target.value }))} />
                  <textarea className="admin-input compact-textarea" rows={4} placeholder={labels.descriptionNe} value={categoryForm.descriptionNe || ''} onChange={(e) => setCategoryForm((p) => ({ ...p, descriptionNe: e.target.value }))} />
                </details>
                <AdminFormActions isSaving={isSaving} label={labels.saveCategory} clearLabel={labels.clear} onCancel={() => { setCategoryForm(emptyCategory); setEditing(null); }} />
              </form>
              <AdminRecordList title={ui.categoryList}>{categories.map((category) => <AdminRecord key={category.id} title={getLocalizedCategoryName(category, language)} subtitle={getLocalizedText(language, category.descriptionNe, category.description)} editLabel={labels.edit} onEdit={() => { setCategoryForm(category); setEditing({ type: 'categories', id: category.id }); }} onDelete={() => deleteCategory(category)} />)}</AdminRecordList>
            </div>
          )}

          {tab === 'backup' && (
            <div className="admin-tools-grid">
              <div className="admin-card backup-card compact-form">
                <SectionTitle title={labels.backupPublish} />
                <AdminBackupAction title={labels.export} text={language === 'ne' ? 'à¤¬à¥à¤¯à¤¾à¤•à¤…à¤ª à¤®à¤¾à¤¤à¥à¤°à¥¤ à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯ à¤¸à¤®à¥à¤ªà¤¾à¤¦à¤¨à¤•à¤¾ à¤²à¤¾à¤—à¤¿ à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤ à¤†à¤µà¤¶à¥à¤¯à¤• à¤›à¥ˆà¤¨à¥¤' : 'Backup only. Normal editing does not require export.'} button={<button onClick={() => { setJsonText(onExportAllContent()); setNotice(language === 'ne' ? 'à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤¤à¤²à¤•à¥‹ à¤¬à¤¾à¤•à¤¸à¤®à¤¾ à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤ à¤—à¤°à¤¿à¤¯à¥‹à¥¤' : 'Content exported to the box below.'); }} className="action-button">{labels.export}</button>} />
                <AdminBackupAction title={labels.import} text={language === 'ne' ? 'à¤¯à¥‹ à¤¬à¥à¤°à¤¾à¤‰à¤œà¤°à¤®à¤¾ à¤¬à¥à¤¯à¤¾à¤•à¤…à¤ª à¤ªà¥à¤¨à¤°à¥à¤¸à¥à¤¥à¤¾à¤ªà¤¿à¤¤ à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤' : 'Restore a backup into this browser.'} button={<button onClick={() => onImportAllContent(jsonText) && setNotice(language === 'ne' ? 'à¤¸à¤¾à¤®à¤—à¥à¤°à¥€ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤°à¥‚à¤ªà¤®à¤¾ à¤†à¤¯à¤¾à¤¤ à¤—à¤°à¤¿à¤¯à¥‹à¥¤' : 'Content imported locally.')} className="secondary-button">{labels.import}</button>} />
                <AdminBackupAction title={labels.reset} text={language === 'ne' ? 'à¤ªà¥à¤·à¥à¤Ÿà¤¿ à¤ªà¤›à¤¿ bundled defaults à¤ªà¥à¤¨à¤°à¥à¤¸à¥à¤¥à¤¾à¤ªà¤¿à¤¤ à¤¹à¥à¤¨à¥à¤›à¥¤' : 'Restores bundled defaults after confirmation.'} button={<button onClick={() => { if (confirm(language === 'ne' ? 'à¤¸à¤¬à¥ˆ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤¸à¤¾à¤®à¤—à¥à¤°à¥€à¤²à¤¾à¤ˆ à¤¡à¤¿à¤«à¤²à¥à¤Ÿà¤®à¤¾ à¤«à¤°à¥à¤•à¤¾à¤‰à¤¨à¥‡?' : 'Reset all local content to defaults?')) onResetToDefaultContent(); }} className="secondary-button danger-button">{labels.reset}</button>} />
                <AdminBackupAction title={labels.publish} text={language === 'ne' ? 'Netlify Functions à¤®à¤¾à¤°à¥à¤«à¤¤ à¤µà¥ˆà¤•à¤²à¥à¤ªà¤¿à¤• à¤°à¤¿à¤®à¥‹à¤Ÿ à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¨à¥¤' : 'Optional remote publishing through Netlify Functions.'} button={<button onClick={onPublishContent} disabled={isSaving} className="secondary-button">{isSaving ? labels.publishing : labels.publish}</button>} />
                <textarea className="admin-input admin-json compact-textarea" value={jsonText} onChange={(e) => setJsonText(e.target.value)} placeholder={labels.exportedJson} />
                <p className="body-copy">{language === 'ne' ? 'à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤¸à¥‡à¤­à¤¹à¤°à¥‚ à¤¯à¥‹ à¤¬à¥à¤°à¤¾à¤‰à¤œà¤°à¤®à¤¾ à¤¤à¥à¤°à¥à¤¨à¥à¤¤à¥ˆ à¤¦à¥‡à¤–à¤¿à¤¨à¥à¤›à¤¨à¥à¥¤ à¤²à¤¾à¤‡à¤­ backend à¤•à¤¾ à¤²à¤¾à¤—à¤¿ à¤¤à¤¯à¤¾à¤° à¤­à¤à¤ªà¤›à¤¿ à¤®à¤¾à¤¤à¥à¤° GitHub à¤®à¤¾ à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¨ à¤ªà¥à¤°à¤¯à¥‹à¤— à¤—à¤°à¥à¤¨à¥à¤¹à¥‹à¤¸à¥à¥¤' : 'Local saves appear immediately in this browser. Use Publish to GitHub when the content is ready for the live site backend.'}</p>
                <p className="body-copy">{language === 'ne' ? 'Backend à¤¨à¤­à¤ à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¨ à¤—à¤°à¥à¤¦à¤¾ â€œbackend à¤œà¤¡à¤¾à¤¨ à¤—à¤°à¤¿à¤à¤•à¥‹ à¤›à¥ˆà¤¨â€ à¤¦à¥‡à¤–à¤¿à¤¨à¥à¤›à¥¤ à¤¨à¤¿à¤°à¥à¤¯à¤¾à¤¤/à¤†à¤¯à¤¾à¤¤ à¤­à¤¨à¥‡ à¤¸à¥à¤¥à¤¾à¤¨à¥€à¤¯ à¤°à¥‚à¤ªà¤®à¤¾ à¤•à¤¾à¤® à¤—à¤°à¥à¤›à¥¤' : 'If backend is missing, Publish shows: backend not configured. Export/import still works locally.'}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return <button onClick={onClick} className={`nav-item ${active ? 'nav-item-active' : ''}`}>{icon}<span>{label}</span></button>;
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="compact-section-title">{title}</h3>;
}

function CharCountTextarea({
  value,
  onChange,
  maxLength,
  label,
  required,
  className = '',
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  maxLength: number;
  required?: boolean;
}) {
  const count = value ? String(value).length : 0;
  const isOver = count > maxLength;

  return (
    <div className="field-group">
      <label className="field-label">{label}{required && ' *'}</label>
      <textarea
        value={value}
        onChange={onChange}
        maxLength={maxLength + 50}
        {...rest}
        className={`admin-input compact-textarea admin-textarea ${className} ${isOver ? 'field-error' : ''}`}
      />
      <span className={`char-count ${isOver ? 'char-count-error' : ''}`}>
        {count} / {maxLength}
      </span>
    </div>
  );
}

