import { useMemo, useState, type FormEvent, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Download, Layers, ScrollText, Sparkles, Trash2, X } from 'lucide-react';
import type { Category, Deity, HinduStory, PanchangContent, PoojaBidhi, Stotra } from '../../types';
import type { CategoryInput, DeityInput, HinduStoryInput, PoojaBidhiInput, StotraInput } from '../../services/localContentService';

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
const emptyDeity: DeityInput = { name: '', type: 'Other', sanskritName: '', imageUrl: '', introduction: '', description: '', significance: '', mantra: '', tags: [] };
const emptyContent: StotraInput = { title: '', alternateTitle: '', deity: '', category: 'Stotra', imageUrl: '', content: '', meaning: '', nepaliMeaning: '', wordMeaning: '', benefits: '', process: '', source: '', tags: [], status: 'published' };
const emptyPooja: PoojaBidhiInput = { title: '', deity: '', occasion: '', overview: '', materials: [], steps: [], benefits: [], cautions: '', source: '', tags: [] };
const emptyStory: HinduStoryInput = { title: '', deity: '', summary: '', story: '', lesson: '', source: '', tags: [] };
const emptyCategory: CategoryInput = { name: '', description: '' };

const linesFromText = (value: string) => value.split('\n').map((item) => item.trim()).filter(Boolean);
const textFromList = (items?: string[]) => (items || []).join('\n');
const tagsFromText = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
const tagsToText = (items?: string[]) => (items || []).join(', ');
const sameName = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
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
    save: 'सेभ',
    edit: 'सम्पादन',
    delete: 'हटाउनुहोस्',
    search: 'खोज्नुहोस्',
    deity: 'देवता',
    category: 'श्रेणी',
    meaning: 'अर्थ',
    benefits: 'लाभ',
    source: 'स्रोत',
    tags: 'ट्याग',
    introduction: 'परिचय',
    significance: 'महत्त्व',
    mantra: 'मन्त्र',
    process: 'पाठ गर्ने विधि',
    logout: 'लगआउट',
    export: 'JSON निर्यात',
    import: 'JSON आयात',
    reset: 'डिफल्टमा फर्काउनुहोस्',
    publish: 'GitHub मा प्रकाशित',
    deitiesProfiles: 'देवता / प्रोफाइल',
    devotionalContent: 'भक्ति सामग्री',
    poojaBidhi: 'पूजा विधि',
    categories: 'श्रेणीहरू',
    backupPublish: 'ब्याकअप र प्रकाशन',
    saveDeity: 'देवता सेभ',
    saveCategory: 'श्रेणी सेभ',
    saveContent: 'भक्ति सामग्री सेभ',
    savePooja: 'पूजा मार्गदर्शन सेभ',
    clear: 'खाली',
    publishing: 'प्रकाशन हुँदै...',
  },
} as const;

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
  const [poojaForm, setPoojaForm] = useState<PoojaBidhiInput>(emptyPooja);
  const [poojaText, setPoojaText] = useState({ materials: '', steps: '', benefits: '' });
  const [storyForm, setStoryForm] = useState<HinduStoryInput>(emptyStory);
  const [categoryForm, setCategoryForm] = useState<CategoryInput>(emptyCategory);
  const [editing, setEditing] = useState<{ type: Tab; id: string } | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Record<string, boolean>>({});
  const labels = adminLabels[language];
  const ui = language === 'ne'
    ? {
        kicker: 'स्थानीय सामग्री स्टुडियो',
        title: 'Om Stotra Sagar सामग्री व्यवस्थापन',
        subtitle: 'Save ले यो ब्राउजरमा तुरुन्तै लेख्छ। Publish ले केवल वैकल्पिक backend मार्फत GitHub मा लेख्छ।',
        localActive: 'स्थानीय ब्राउजर सामग्री सक्रिय छ। तयार भएपछि export वा publish गर्नुहोस्।',
        instantSave: 'Save ले यो ब्राउजरमा तुरुन्तै अपडेट गर्छ। Publish to GitHub वैकल्पिक र अलग छ।',
        deityTitle: editing?.type === 'deities' ? 'देवता प्रोफाइल सम्पादन' : 'देवता प्रोफाइल थप्नुहोस्',
        contentTitle: editing?.type === 'content' ? 'भक्तिपूर्ण सामग्री सम्पादन' : 'भक्तिपूर्ण सामग्री थप्नुहोस्',
        poojaTitle: editing?.type === 'pooja' ? 'पूजा विधि सम्पादन' : 'पूजा विधि थप्नुहोस्',
        categoryTitle: editing?.type === 'categories' ? 'श्रेणी सम्पादन' : 'श्रेणी थप्नुहोस्',
        contentList: 'भक्तिपूर्ण सामग्री',
        poojaList: 'पूजा विधि',
        categoryList: 'श्रेणीहरू',
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
    });
  };

  const filteredContent = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return stotras;
    return stotras.filter((item) => [item.title, item.deity, item.category, item.content, item.meaning, item.nepaliMeaning, ...(item.tags || [])].some((part) => part?.toLowerCase().includes(value)));
  }, [query, stotras]);

  if (!isOpen) return null;

  const duplicateDeity = (name: string, id?: string) => deities.some((item) => item.id !== id && sameName(item.name, name));
  const duplicateCategory = (name: string, id?: string) => categories.some((item) => item.id !== id && sameName(item.name, name));

  const submitDeity = (event: FormEvent) => {
    event.preventDefault();
    const id = editing?.type === 'deities' ? editing.id : undefined;
    if (!deityForm.name.trim()) return setNotice('Name is required.');
    if (duplicateDeity(deityForm.name, id)) return setNotice('A deity with this name already exists.');
    const saved = onSaveDeity({ ...deityForm, description: deityForm.introduction || deityForm.description, tags: deityForm.tags || [] }, id);
    if (saved) {
      setDeityForm(emptyDeity);
      setEditing(null);
      setNotice('Deity profile saved locally.');
    }
  };

  const submitContent = (event: FormEvent) => {
    event.preventDefault();
    const id = editing?.type === 'content' ? editing.id : undefined;
    if (!contentForm.title.trim() || !contentForm.deity.trim() || !contentForm.category.trim() || !contentForm.content.trim()) return setNotice('Title, deity, category, and full text are required.');
    if (contentForm.title.length > 120) return setNotice('Title must be 120 characters or fewer.');
    if (contentForm.content.length > 5000) return setNotice('Content must be 5000 characters or fewer.');
    if ((contentForm.meaning || contentForm.nepaliMeaning || '').length > 3000) return setNotice('Meaning must be 3000 characters or fewer.');
    if ((contentForm.benefits || '').length > 1000) return setNotice('Benefits must be 1000 characters or fewer.');
    onSaveStotra({ ...contentForm, nepaliMeaning: contentForm.meaning || contentForm.nepaliMeaning, tags: contentForm.tags || [] }, id);
    setContentForm(emptyContent);
    setEditing(null);
    setNotice('Devotional content saved to this browser.');
  };

  const submitPooja = (event: FormEvent) => {
    event.preventDefault();
    const id = editing?.type === 'pooja' ? editing.id : undefined;
    if (!poojaForm.title.trim() || !poojaForm.deity.trim() || !poojaForm.overview.trim()) return setNotice('Title, deity, and overview are required.');
    onSavePoojaBidhi({
      ...poojaForm,
      materials: linesFromText(poojaText.materials),
      steps: linesFromText(poojaText.steps),
      benefits: linesFromText(poojaText.benefits),
    }, id);
    setPoojaForm(emptyPooja);
    setPoojaText({ materials: '', steps: '', benefits: '' });
    setEditing(null);
    setNotice('Pooja Bidhi saved to this browser.');
  };

  const submitStory = (event: FormEvent) => {
    event.preventDefault();
    const id = editing?.type === 'stories' ? editing.id : undefined;
    if (!storyForm.title.trim() || !storyForm.summary.trim() || !storyForm.story.trim()) return setNotice('Title, summary, and story are required.');
    onSaveStory(storyForm, id);
    setStoryForm(emptyStory);
    setEditing(null);
    setNotice('Story saved to this browser.');
  };

  const submitCategory = (event: FormEvent) => {
    event.preventDefault();
    const id = editing?.type === 'categories' ? editing.id : undefined;
    if (!categoryForm.name.trim()) return setNotice('Category name is required.');
    if (duplicateCategory(categoryForm.name, id)) return setNotice('A category with this name already exists.');
    const saved = onSaveCategory(categoryForm, id);
    if (saved) {
      setCategoryForm(emptyCategory);
      setEditing(null);
      setNotice('Category saved locally.');
    }
  };

  const deleteDeity = (deity: Deity) => {
    const hasRelated = stotras.some((item) => item.deity === deity.name) || poojaBidhi.some((item) => item.deity === deity.name) || stories.some((item) => item.deity === deity.name);
    const warning = hasRelated ? 'This deity has related content. Deleting it may orphan related items. Delete anyway?' : `Delete ${deity.name}?`;
    if (confirm(warning)) onDeleteDeity(deity.id);
  };

  const deleteCategory = (category: Category) => {
    const used = stotras.some((item) => item.category === category.name);
    const warning = used ? 'This category is used by devotional content. Deleting it may orphan related items. Delete anyway?' : `Delete ${category.name}?`;
    if (confirm(warning)) onDeleteCategory(category.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
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
              <Message
                tone="info"
                text={ui.instantSave}
                onDismiss={() => setDismissedAlerts((prev) => ({ ...prev, [`info:${ui.instantSave}`]: true }))}
              />
            )}
            {localContentActive && !dismissedAlerts[`neutral:${ui.localActive}`] && (
              <Message
                tone="neutral"
                text={ui.localActive}
                onDismiss={() => setDismissedAlerts((prev) => ({ ...prev, [`neutral:${ui.localActive}`]: true }))}
              />
            )}
          </div>
          {message && !dismissedAlerts[`success:${message}`] && (
            <Message tone="success" text={message} onDismiss={() => setDismissedAlerts((prev) => ({ ...prev, [`success:${message}`]: true }))} />
          )}
          {errorMessage && !dismissedAlerts[`error:${errorMessage}`] && (
            <Message tone="error" text={errorMessage} onDismiss={() => setDismissedAlerts((prev) => ({ ...prev, [`error:${errorMessage}`]: true }))} />
          )}
          {notice && !dismissedAlerts[`neutral:${notice}`] && (
            <Message tone="neutral" text={notice} onDismiss={() => setDismissedAlerts((prev) => ({ ...prev, [`neutral:${notice}`]: true }))} />
          )}

          {tab === 'deities' && (
            <div className="admin-grid compact-admin-grid">
              <form onSubmit={submitDeity} className="admin-card compact-form">
                <SectionTitle title={ui.deityTitle} />
                <input className="admin-input compact-input" placeholder="Name" value={deityForm.name} onChange={(e) => setDeityForm((p) => ({ ...p, name: e.target.value }))} />
                <select className="admin-input compact-input" value={deityForm.type || 'Other'} onChange={(e) => setDeityForm((p) => ({ ...p, type: e.target.value as Deity['type'] }))}>{deityTypes.map((type) => <option key={type}>{type}</option>)}</select>
                <input className="admin-input compact-input" placeholder="Sanskrit name" value={deityForm.sanskritName || ''} onChange={(e) => setDeityForm((p) => ({ ...p, sanskritName: e.target.value }))} />
                <input className="admin-input compact-input" placeholder="Image URL optional" value={deityForm.imageUrl || ''} onChange={(e) => setDeityForm((p) => ({ ...p, imageUrl: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={7} placeholder={labels.introduction} value={deityForm.introduction || deityForm.description || ''} onChange={(e) => setDeityForm((p) => ({ ...p, introduction: e.target.value, description: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={7} placeholder={labels.significance} value={deityForm.significance} onChange={(e) => setDeityForm((p) => ({ ...p, significance: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={3} placeholder={labels.mantra} value={deityForm.mantra || ''} onChange={(e) => setDeityForm((p) => ({ ...p, mantra: e.target.value }))} />
                <input className="admin-input compact-input" placeholder={`${labels.tags}, comma-separated`} value={tagsToText(deityForm.tags)} onChange={(e) => setDeityForm((p) => ({ ...p, tags: tagsFromText(e.target.value) }))} />
                <FormActions isSaving={isSaving} label={labels.saveDeity} clearLabel={labels.clear} onCancel={() => { setDeityForm(emptyDeity); setEditing(null); }} />
              </form>
              <RecordList title={labels.deitiesProfiles}>{deities.map((deity) => <Record key={deity.id} title={deity.name} subtitle={`${deity.type || 'Other'} - ${deity.introduction || deity.description}`} editLabel={labels.edit} onEdit={() => { setDeityForm({ ...deity, introduction: deity.introduction || deity.description }); setEditing({ type: 'deities', id: deity.id }); }} onDelete={() => deleteDeity(deity)} />)}</RecordList>
            </div>
          )}

          {tab === 'content' && (
            <div className="admin-grid compact-admin-grid">
              <form onSubmit={submitContent} className="admin-card compact-form">
                <SectionTitle title={ui.contentTitle} />
                <div className="field-group">
                  <input className={`admin-input compact-input ${contentForm.title.length > 120 ? 'field-error' : ''}`} placeholder="Title" value={contentForm.title} maxLength={170} onChange={(e) => setContentForm((p) => ({ ...p, title: e.target.value }))} />
                  <span className={`char-count ${contentForm.title.length > 120 ? 'char-count-error' : ''}`}>{contentForm.title.length} / 120</span>
                </div>
                <input className="admin-input compact-input" placeholder="Alternate title" value={contentForm.alternateTitle || ''} onChange={(e) => setContentForm((p) => ({ ...p, alternateTitle: e.target.value }))} />
                <Picker value={contentForm.deity} options={deities.map((d) => d.name)} placeholder={labels.deity} onChange={(value) => setContentForm((p) => ({ ...p, deity: value }))} onCreate={(name) => { const saved = onSaveDeity({ ...emptyDeity, name, introduction: `${name} profile introduction.`, description: `${name} profile introduction.`, significance: 'Add significance before publishing.', tags: [name.toLowerCase()] }); if (saved) setContentForm((p) => ({ ...p, deity: saved.name })); }} />
                <Picker value={contentForm.category} options={categories.map((c) => c.name)} placeholder={labels.category} onChange={(value) => setContentForm((p) => ({ ...p, category: value }))} onCreate={(name) => { const saved = onSaveCategory({ name, description: '' }); if (saved) setContentForm((p) => ({ ...p, category: saved.name })); }} />
                <input className="admin-input compact-input" placeholder="Image URL optional" value={contentForm.imageUrl || ''} onChange={(e) => setContentForm((p) => ({ ...p, imageUrl: e.target.value }))} />
                <CharCountTextarea label="Content / full text" required maxLength={5000} rows={14} placeholder="Content / full text" value={contentForm.content} onChange={(e) => setContentForm((p) => ({ ...p, content: e.target.value }))} />
                <CharCountTextarea label={labels.meaning} maxLength={3000} rows={5} placeholder={labels.meaning} value={contentForm.meaning || contentForm.nepaliMeaning || ''} onChange={(e) => setContentForm((p) => ({ ...p, meaning: e.target.value, nepaliMeaning: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={4} placeholder="Word meaning" value={contentForm.wordMeaning || ''} onChange={(e) => setContentForm((p) => ({ ...p, wordMeaning: e.target.value }))} />
                <CharCountTextarea label={labels.benefits} maxLength={1000} rows={4} placeholder={labels.benefits} value={contentForm.benefits || ''} onChange={(e) => setContentForm((p) => ({ ...p, benefits: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={4} placeholder={labels.process} value={contentForm.process || ''} onChange={(e) => setContentForm((p) => ({ ...p, process: e.target.value }))} />
                <input className="admin-input compact-input" placeholder={labels.source} value={contentForm.source || ''} onChange={(e) => setContentForm((p) => ({ ...p, source: e.target.value }))} />
                <input className="admin-input compact-input" placeholder={`${labels.tags}, comma-separated`} value={tagsToText(contentForm.tags)} onChange={(e) => setContentForm((p) => ({ ...p, tags: tagsFromText(e.target.value) }))} />
                <FormActions isSaving={isSaving} label={labels.saveContent} clearLabel={labels.clear} onCancel={() => { setContentForm(emptyContent); setEditing(null); }} />
              </form>
              <RecordList title={ui.contentList} toolbar={<input className="admin-input compact-input" placeholder={labels.search} value={query} onChange={(e) => setQuery(e.target.value)} />}>{filteredContent.map((item) => <Record key={item.id} title={item.title} subtitle={`${item.deity} - ${item.category}`} editLabel={labels.edit} onEdit={() => { setContentForm({ ...item, meaning: item.meaning || item.nepaliMeaning }); setEditing({ type: 'content', id: item.id }); }} onDelete={() => { if (confirm(`Delete ${item.title}?`)) onDeleteStotra(item.id); }} />)}</RecordList>
            </div>
          )}

          {tab === 'pooja' && (
            <div className="admin-grid compact-admin-grid">
              <form onSubmit={submitPooja} className="admin-card compact-form">
                <SectionTitle title={ui.poojaTitle} />
                <input className="admin-input compact-input" placeholder="Title" value={poojaForm.title} onChange={(e) => setPoojaForm((p) => ({ ...p, title: e.target.value }))} />
                <Picker value={poojaForm.deity} options={deities.map((d) => d.name)} placeholder={labels.deity} onChange={(value) => setPoojaForm((p) => ({ ...p, deity: value }))} onCreate={(name) => { const saved = onSaveDeity({ ...emptyDeity, name, introduction: `${name} profile introduction.`, description: `${name} profile introduction.`, significance: 'Add significance before publishing.', tags: [name.toLowerCase()] }); if (saved) setPoojaForm((p) => ({ ...p, deity: saved.name })); }} />
                <input className="admin-input compact-input" placeholder="Occasion" value={poojaForm.occasion} onChange={(e) => setPoojaForm((p) => ({ ...p, occasion: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={5} placeholder="Overview" value={poojaForm.overview} onChange={(e) => setPoojaForm((p) => ({ ...p, overview: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={7} placeholder="Materials / Samagri" value={poojaText.materials} onChange={(e) => setPoojaText((p) => ({ ...p, materials: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={8} placeholder="Steps" value={poojaText.steps} onChange={(e) => setPoojaText((p) => ({ ...p, steps: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={5} placeholder={labels.benefits} value={poojaText.benefits} onChange={(e) => setPoojaText((p) => ({ ...p, benefits: e.target.value }))} />
                <input className="admin-input compact-input" placeholder="Cautions" value={poojaForm.cautions || ''} onChange={(e) => setPoojaForm((p) => ({ ...p, cautions: e.target.value }))} />
                <input className="admin-input compact-input" placeholder={labels.source} value={poojaForm.source || ''} onChange={(e) => setPoojaForm((p) => ({ ...p, source: e.target.value }))} />
                <input className="admin-input compact-input" placeholder={`${labels.tags}, comma-separated`} value={tagsToText(poojaForm.tags)} onChange={(e) => setPoojaForm((p) => ({ ...p, tags: tagsFromText(e.target.value) }))} />
                <FormActions isSaving={isSaving} label={labels.savePooja} clearLabel={labels.clear} onCancel={() => { setPoojaForm(emptyPooja); setPoojaText({ materials: '', steps: '', benefits: '' }); setEditing(null); }} />
              </form>
              <RecordList title={ui.poojaList}>{poojaBidhi.map((item) => <Record key={item.id} title={item.title} subtitle={`${item.deity} - ${item.occasion}`} onEdit={() => { resetPoojaForm(item); setEditing({ type: 'pooja', id: item.id }); }} onDelete={() => { if (confirm(`Delete ${item.title}?`)) onDeletePoojaBidhi(item.id); }} />)}</RecordList>
            </div>
          )}

          {tab === 'categories' && (
            <div className="admin-grid compact-admin-grid">
              <form onSubmit={submitCategory} className="admin-card compact-form">
                <SectionTitle title={ui.categoryTitle} />
                <input className="admin-input compact-input" placeholder="Name" value={categoryForm.name} onChange={(e) => setCategoryForm((p) => ({ ...p, name: e.target.value }))} />
                <textarea className="admin-input compact-textarea" rows={4} placeholder="Description" value={categoryForm.description || ''} onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))} />
                <FormActions isSaving={isSaving} label={labels.saveCategory} clearLabel={labels.clear} onCancel={() => { setCategoryForm(emptyCategory); setEditing(null); }} />
              </form>
              <RecordList title={ui.categoryList}>{categories.map((category) => <Record key={category.id} title={category.name} subtitle={category.description || ''} onEdit={() => { setCategoryForm(category); setEditing({ type: 'categories', id: category.id }); }} onDelete={() => deleteCategory(category)} />)}</RecordList>
            </div>
          )}

          {tab === 'backup' && (
            <div className="admin-tools-grid">
              <div className="admin-card backup-card compact-form">
                <SectionTitle title={labels.backupPublish} />
                <BackupAction title={labels.export} text={language === 'ne' ? 'ब्याकअप मात्र। सामान्य सम्पादनका लागि export आवश्यक छैन।' : 'Backup only. Normal editing does not require export.'} button={<button onClick={() => { setJsonText(onExportAllContent()); setNotice(language === 'ne' ? 'सामग्री तलको बाकसमा export गरियो।' : 'Content exported to the box below.'); }} className="action-button">{labels.export}</button>} />
                <BackupAction title={labels.import} text={language === 'ne' ? 'यो ब्राउजरमा backup पुनर्स्थापित गर्नुहोस्।' : 'Restore a backup into this browser.'} button={<button onClick={() => onImportAllContent(jsonText) && setNotice(language === 'ne' ? 'सामग्री स्थानीय रूपमा import गरियो।' : 'Content imported locally.')} className="secondary-button">{labels.import}</button>} />
                <BackupAction title={labels.reset} text={language === 'ne' ? 'पुष्टि पछि bundled defaults पुनर्स्थापित हुन्छ।' : 'Restores bundled defaults after confirmation.'} button={<button onClick={() => { if (confirm(language === 'ne' ? 'सबै स्थानीय सामग्रीलाई default मा फर्काउने?' : 'Reset all local content to defaults?')) onResetToDefaultContent(); }} className="secondary-button danger-button">{labels.reset}</button>} />
                <BackupAction title={labels.publish} text={language === 'ne' ? 'Netlify Functions मार्फत वैकल्पिक remote publishing।' : 'Optional remote publishing through Netlify Functions.'} button={<button onClick={onPublishContent} disabled={isSaving} className="secondary-button">{isSaving ? labels.publishing : labels.publish}</button>} />
                <textarea className="admin-input admin-json compact-textarea" value={jsonText} onChange={(e) => setJsonText(e.target.value)} placeholder="Exported JSON or paste import JSON here" />
                <p className="body-copy">{language === 'ne' ? 'स्थानीय save हरू यो ब्राउजरमा तुरुन्तै देखिन्छन्। live backend का लागि तयार भएपछि मात्र Publish प्रयोग गर्नुहोस्।' : 'Local saves appear immediately in this browser. Use Publish to GitHub when the content is ready for the live site backend.'}</p>
                <p className="body-copy">{language === 'ne' ? 'Backend नभए Publish ले “Backend not configured” देखाउँछ। Export/import भने स्थानीय रूपमा काम गर्छ।' : 'If backend is missing, Publish shows: Backend not configured. Export/import still works locally.'}</p>
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

function FormActions({ isSaving, label, clearLabel, onCancel }: { isSaving: boolean; label: string; clearLabel: string; onCancel: () => void }) {
  return <div className="button-row"><button disabled={isSaving} className="action-button compact-save">{isSaving ? 'Saving...' : label}</button><button type="button" onClick={onCancel} className="secondary-button">{clearLabel}</button></div>;
}

function Picker({ value, options, placeholder, optional = false, onChange, onCreate }: { value: string; options: string[]; placeholder: string; optional?: boolean; onChange: (value: string) => void; onCreate: (value: string) => void }) {
  const hasMatchingOption = options.some((option) => sameName(option, value));
  const [isCreating, setIsCreating] = useState(false);
  const [draft, setDraft] = useState('');
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
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <div className="button-row">
        {optional && <button type="button" className="secondary-button" onClick={() => onChange('')}>No deity</button>}
        {!isCreating ? (
          <button type="button" className="secondary-button" onClick={() => { setDraft(''); setIsCreating(true); }}>
            New {placeholder}
          </button>
        ) : (
          <button type="button" className="secondary-button" onClick={() => { setDraft(''); setIsCreating(false); }}>
            Cancel
          </button>
        )}
      </div>
      {isCreating && (
        <div className="button-row compact-create-row">
          <input
            className="admin-input compact-input"
            placeholder={`Type new ${placeholder.toLowerCase()}`}
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
            Create
          </button>
        </div>
      )}
    </div>
  );
}

function RecordList({ title, toolbar, children }: { title: string; toolbar?: ReactNode; children: ReactNode }) {
  return <section className="admin-card admin-list compact-list"><div className="section-header"><SectionTitle title={title} />{toolbar}</div><div className="record-list">{children}</div></section>;
}

function Record({ title, subtitle, editLabel = 'Edit', onEdit, onDelete }: { key?: string; title: string; subtitle: string; editLabel?: string; onEdit: () => void; onDelete: () => void }) {
  return <article className="record-card compact-record"><div className="record-card-copy"><p className="record-title">{title}</p><p className="record-subtitle">{subtitle}</p></div><div className="record-actions"><button onClick={onEdit} className="secondary-button">{editLabel}</button><button onClick={onDelete} className="icon-button" aria-label={`Delete ${title}`}><Trash2 size={16} /></button></div></article>;
}

function BackupAction({ title, text, button }: { title: string; text: string; button: ReactNode }) {
  return <section className="backup-section"><div><p className="backup-title">{title}</p><p className="body-copy">{text}</p></div>{button}</section>;
}

function Message({ tone, text, onDismiss }: { tone: 'success' | 'error' | 'neutral' | 'info'; text: string; onDismiss?: () => void }) {
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
