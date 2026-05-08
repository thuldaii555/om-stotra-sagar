import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { BookOpen, CalendarClock, Download, Edit2, Layers, ScrollText, Sparkles, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { Category, Deity, HinduStory, PanchangContent, PoojaBidhi, Stotra } from '../../types';
import type { CategoryInput, DeityInput, HinduStoryInput, PanchangContentInput, PoojaBidhiInput, StotraInput } from '../../services/localContentService';

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
  onSavePanchangContent: (input: PanchangContentInput) => boolean;
  onExportAllContent: () => string;
  onImportAllContent: (json: string) => boolean;
  onResetToDefaultContent: () => void;
  onPublishContent: () => Promise<boolean>;
  onLogoutAdmin: () => void;
}

type AdminTab = 'stotras' | 'deities' | 'pooja' | 'stories' | 'categories' | 'panchang' | 'tools';
type AdminGroup = 'content' | 'setup' | 'backup';

const emptyStotraForm: StotraInput = {
  title: '',
  alternateTitle: '',
  deity: '',
  category: '',
  content: '',
  nepaliMeaning: '',
  wordMeaning: '',
  benefits: '',
  process: '',
  source: '',
  tags: [],
  language: '',
  script: '',
  status: 'published',
};

const emptyDeityForm: DeityInput = {
  name: '',
  sanskritName: '',
  description: '',
  significance: '',
  mantra: '',
  imageUrl: '',
  tags: [],
  theme: '',
};

const emptyPoojaForm: PoojaBidhiInput = {
  title: '',
  deity: '',
  occasion: '',
  overview: '',
  materials: [],
  steps: [],
  benefits: [],
  cautions: '',
  source: '',
  tags: [],
};

const emptyStoryForm: HinduStoryInput = {
  title: '',
  deity: '',
  summary: '',
  story: '',
  lesson: '',
  source: '',
  tags: [],
};

const emptyCategoryForm: CategoryInput = {
  name: '',
  description: '',
};

const emptyPanchangForm: PanchangContent = {
  introTitle: '',
  intro: '',
  terms: [],
  dailyNotes: [],
  disclaimer: '',
};

const normalize = (value: string) => value.trim().toLowerCase();
const fromCommaList = (value: string): string[] => value.split(',').map((item) => item.trim()).filter(Boolean);
const fromLineList = (value: string): string[] => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
const toCommaList = (items: string[]): string => items.join(', ');
const toLineList = (items: string[]): string => items.join('\n');
const fromTermList = (value: string) =>
  value
    .split('\n')
    .map((line) => {
      const [title, ...textParts] = line.split(':');
      const [description, practicalMeaning] = textParts.join(':').split('|');
      const name = title?.trim() || '';
      const cleanDescription = description?.trim() || '';
      const cleanPracticalMeaning = practicalMeaning?.trim() || '';
      return {
        name,
        title: name,
        description: cleanDescription,
        practicalMeaning: cleanPracticalMeaning || undefined,
        text: cleanPracticalMeaning ? `${cleanDescription} Practical use: ${cleanPracticalMeaning}` : cleanDescription,
      };
    })
    .filter((term) => term.name && term.description);
const toTermList = (items: { name?: string; title?: string; description?: string; text?: string; practicalMeaning?: string }[]): string =>
  items.map((item) => `${item.name || item.title}: ${item.description || item.text}${item.practicalMeaning ? ` | ${item.practicalMeaning}` : ''}`).join('\n');

export default function AdminPanel({
  isOpen,
  stotras,
  categories,
  deities,
  poojaBidhi,
  stories,
  panchang,
  isSaving,
  message,
  errorMessage,
  localContentActive,
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
  onSavePanchangContent,
  onExportAllContent,
  onImportAllContent,
  onResetToDefaultContent,
  onPublishContent,
  onLogoutAdmin,
}: AdminPanelProps) {
  const [tab, setTab] = useState<AdminTab>('stotras');
  const [group, setGroup] = useState<AdminGroup>('content');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [exportText, setExportText] = useState('');
  const [stotraForm, setStotraForm] = useState<StotraInput>(emptyStotraForm);
  const [editingStotraId, setEditingStotraId] = useState<string | undefined>();
  const [deityForm, setDeityForm] = useState<DeityInput>(emptyDeityForm);
  const [editingDeityId, setEditingDeityId] = useState<string | undefined>();
  const [poojaForm, setPoojaForm] = useState<PoojaBidhiInput>(emptyPoojaForm);
  const [editingPoojaId, setEditingPoojaId] = useState<string | undefined>();
  const [storyForm, setStoryForm] = useState<HinduStoryInput>(emptyStoryForm);
  const [editingStoryId, setEditingStoryId] = useState<string | undefined>();
  const [categoryForm, setCategoryForm] = useState<CategoryInput>(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>();
  const [panchangForm, setPanchangForm] = useState<PanchangContent>(panchang || emptyPanchangForm);
  const [panchangTermsText, setPanchangTermsText] = useState(toTermList(panchang?.terms || []));
  const [panchangNotesText, setPanchangNotesText] = useState(toTermList(panchang?.dailyNotes || []));
  const [showInlineDeityForm, setShowInlineDeityForm] = useState(false);
  const [showInlineCategoryForm, setShowInlineCategoryForm] = useState(false);
  const [showInlinePoojaDeityForm, setShowInlinePoojaDeityForm] = useState(false);
  const [inlineDeityForm, setInlineDeityForm] = useState<DeityInput>(emptyDeityForm);
  const [inlinePoojaDeityForm, setInlinePoojaDeityForm] = useState<DeityInput>(emptyDeityForm);
  const [inlineCategoryForm, setInlineCategoryForm] = useState<CategoryInput>(emptyCategoryForm);

  const deityOptions = useMemo(
    () => deities.filter((deity) => !stotraForm.deity || normalize(deity.name).includes(normalize(stotraForm.deity))).slice(0, 6),
    [deities, stotraForm.deity]
  );
  const categoryOptions = useMemo(
    () => categories.filter((category) => !stotraForm.category || normalize(category.name).includes(normalize(stotraForm.category))).slice(0, 6),
    [categories, stotraForm.category]
  );
  const poojaDeityOptions = useMemo(
    () => deities.filter((deity) => !poojaForm.deity || normalize(deity.name).includes(normalize(poojaForm.deity))).slice(0, 6),
    [deities, poojaForm.deity]
  );

  useEffect(() => {
    setPanchangForm(panchang || emptyPanchangForm);
    setPanchangTermsText(toTermList(panchang?.terms || []));
    setPanchangNotesText(toTermList(panchang?.dailyNotes || []));
  }, [panchang]);

  const setNotice = (value: string) => setValidationMessage(value);
  const clearForms = () => {
    setStotraForm(emptyStotraForm);
    setEditingStotraId(undefined);
    setDeityForm(emptyDeityForm);
    setEditingDeityId(undefined);
    setPoojaForm(emptyPoojaForm);
    setEditingPoojaId(undefined);
    setStoryForm(emptyStoryForm);
    setEditingStoryId(undefined);
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(undefined);
    setPanchangForm(panchang || emptyPanchangForm);
    setPanchangTermsText(toTermList(panchang?.terms || []));
    setPanchangNotesText(toTermList(panchang?.dailyNotes || []));
    setShowInlineDeityForm(false);
    setShowInlineCategoryForm(false);
    setShowInlinePoojaDeityForm(false);
    setInlineDeityForm(emptyDeityForm);
    setInlinePoojaDeityForm(emptyDeityForm);
    setInlineCategoryForm(emptyCategoryForm);
  };

  const submitStotra = (event: FormEvent) => {
    event.preventDefault();
    if (stotraForm.title.trim().length < 2) {
      setNotice('Title must be at least 2 characters.');
      return;
    }
    if (stotraForm.content.trim().length < 10) {
      setNotice('Content must be at least 10 characters.');
      return;
    }
    if (!stotraForm.deity.trim() || !stotraForm.category.trim()) {
      setNotice('Deity and category are required.');
      return;
    }
    if (!stotraForm.source?.trim()) {
      setNotice('Source is recommended before publishing publicly.');
    }
    const saved = editingStotraId
      ? onSaveStotra({ ...stotraForm, tags: fromCommaList(toCommaList(stotraForm.tags || [])) }, editingStotraId)
      : onSaveStotra({ ...stotraForm, tags: fromCommaList(toCommaList(stotraForm.tags || [])) });
    if (saved) {
      setStotraForm(emptyStotraForm);
      setEditingStotraId(undefined);
      setValidationMessage(null);
    }
  };

  const submitDeity = (event: FormEvent) => {
    event.preventDefault();
    if (!deityForm.name.trim()) {
      setNotice('Please enter a deity name.');
      return;
    }
    if (!deityForm.description.trim() || !deityForm.significance.trim()) {
      setNotice('Description and significance are required.');
      return;
    }
    const saved = editingDeityId
      ? onSaveDeity({ ...deityForm, tags: fromCommaList(toCommaList(deityForm.tags || [])) }, editingDeityId)
      : onSaveDeity({ ...deityForm, tags: fromCommaList(toCommaList(deityForm.tags || [])) });
    if (saved) {
      setDeityForm(emptyDeityForm);
      setEditingDeityId(undefined);
      setValidationMessage(null);
    }
  };

  const submitPooja = (event: FormEvent) => {
    event.preventDefault();
    if (!poojaForm.title.trim() || !poojaForm.deity.trim() || !poojaForm.occasion.trim()) {
      setNotice('Title, deity, and occasion are required.');
      return;
    }
    if (!poojaForm.overview.trim() || poojaForm.materials.length === 0 || poojaForm.steps.length === 0 || poojaForm.benefits.length === 0) {
      setNotice('Overview, materials, steps, and benefits are required.');
      return;
    }
    const payload = {
      ...poojaForm,
      materials: fromLineList(toCommaList(poojaForm.materials || [])),
      steps: fromLineList(toCommaList(poojaForm.steps || [])),
      benefits: fromLineList(toCommaList(poojaForm.benefits || [])),
      tags: fromCommaList(toCommaList(poojaForm.tags || [])),
    };
    const saved = editingPoojaId ? onSavePoojaBidhi(payload, editingPoojaId) : onSavePoojaBidhi(payload);
    if (saved) {
      setPoojaForm(emptyPoojaForm);
      setEditingPoojaId(undefined);
      setValidationMessage(null);
    }
  };

  const submitStory = (event: FormEvent) => {
    event.preventDefault();
    if (storyForm.title.trim().length < 2 || storyForm.summary.trim().length < 5 || storyForm.story.trim().length < 10 || storyForm.lesson.trim().length < 5) {
      setNotice('Title, summary, story, and lesson are required.');
      return;
    }
    if (!storyForm.source?.trim()) {
      setNotice('Source is recommended before publishing publicly.');
    }
    const saved = editingStoryId
      ? onSaveStory({ ...storyForm, tags: fromCommaList(toCommaList(storyForm.tags || [])) }, editingStoryId)
      : onSaveStory({ ...storyForm, tags: fromCommaList(toCommaList(storyForm.tags || [])) });
    if (saved) {
      setStoryForm(emptyStoryForm);
      setEditingStoryId(undefined);
      setValidationMessage(null);
    }
  };

  const submitCategory = (event: FormEvent) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) {
      setNotice('Please enter a category name.');
      return;
    }
    const saved = editingCategoryId ? onSaveCategory(categoryForm, editingCategoryId) : onSaveCategory(categoryForm);
    if (saved) {
      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(undefined);
      setValidationMessage(null);
    }
  };

  const submitPanchang = (event: FormEvent) => {
    event.preventDefault();
    const terms = fromTermList(panchangTermsText);
    const dailyNotes = fromTermList(panchangNotesText);
    if (!panchangForm.introTitle.trim() || !panchangForm.intro.trim()) {
      setNotice('Intro title and intro copy are required.');
      return;
    }
    if (terms.length === 0 || dailyNotes.length === 0) {
      setNotice('Add at least one term and one daily note in "Title: description" format.');
      return;
    }
    const saved = onSavePanchangContent({ ...panchangForm, terms, dailyNotes });
    if (saved) setValidationMessage(null);
  };

  const createInlineDeity = (event: FormEvent) => {
    event.preventDefault();
    if (!inlineDeityForm.name.trim()) {
      setNotice('Please enter a deity name.');
      return;
    }
    if (!inlineDeityForm.description.trim() || !inlineDeityForm.significance.trim()) {
      setNotice('Description and significance are required for a new deity.');
      return;
    }
    const duplicate = deities.find((deity) => normalize(deity.name) === normalize(inlineDeityForm.name));
    if (duplicate) {
      setStotraForm((prev) => ({ ...prev, deity: duplicate.name }));
      setInlineDeityForm(emptyDeityForm);
      setShowInlineDeityForm(false);
      setNotice(`Selected existing deity "${duplicate.name}".`);
      return;
    }
    const saved = onSaveDeity({ ...inlineDeityForm, tags: fromCommaList(toCommaList(inlineDeityForm.tags || [])) });
    if (saved) {
      setStotraForm((prev) => ({ ...prev, deity: saved.name }));
      setInlineDeityForm(emptyDeityForm);
      setShowInlineDeityForm(false);
      setNotice(`Deity "${saved.name}" added and selected.`);
    }
  };

  const createInlineCategory = (event: FormEvent) => {
    event.preventDefault();
    if (!inlineCategoryForm.name.trim()) {
      setNotice('Please enter a category name.');
      return;
    }
    const duplicate = categories.find((category) => normalize(category.name) === normalize(inlineCategoryForm.name));
    if (duplicate) {
      setStotraForm((prev) => ({ ...prev, category: duplicate.name }));
      setInlineCategoryForm(emptyCategoryForm);
      setShowInlineCategoryForm(false);
      setNotice(`Selected existing category "${duplicate.name}".`);
      return;
    }
    const saved = onSaveCategory({ ...inlineCategoryForm });
    if (saved) {
      setStotraForm((prev) => ({ ...prev, category: saved.name }));
      setInlineCategoryForm(emptyCategoryForm);
      setShowInlineCategoryForm(false);
      setNotice(`Category "${saved.name}" added and selected.`);
    }
  };

  const createInlinePoojaDeity = (event: FormEvent) => {
    event.preventDefault();
    if (!inlinePoojaDeityForm.name.trim()) {
      setNotice('Please enter a deity name.');
      return;
    }
    if (!inlinePoojaDeityForm.description.trim() || !inlinePoojaDeityForm.significance.trim()) {
      setNotice('Description and significance are required for a new deity.');
      return;
    }
    const duplicate = deities.find((deity) => normalize(deity.name) === normalize(inlinePoojaDeityForm.name));
    if (duplicate) {
      setPoojaForm((prev) => ({ ...prev, deity: duplicate.name }));
      setInlinePoojaDeityForm(emptyDeityForm);
      setShowInlinePoojaDeityForm(false);
      setNotice(`Selected existing deity "${duplicate.name}".`);
      return;
    }
    const saved = onSaveDeity({ ...inlinePoojaDeityForm, tags: fromCommaList(toCommaList(inlinePoojaDeityForm.tags || [])) });
    if (saved) {
      setPoojaForm((prev) => ({ ...prev, deity: saved.name }));
      setInlinePoojaDeityForm(emptyDeityForm);
      setShowInlinePoojaDeityForm(false);
      setNotice(`Deity "${saved.name}" added and selected.`);
    }
  };

  const handleExport = () => {
    setExportText(onExportAllContent());
    setNotice('Content exported to the box below.');
  };

  const handleImport = () => {
    if (!exportText.trim()) {
      setNotice('Paste exported JSON or load a JSON file before importing.');
      return;
    }
    const imported = onImportAllContent(exportText);
    if (imported) {
      setNotice('Content imported successfully.');
    } else {
      setNotice('Import failed. Please check the JSON format.');
    }
  };

  const handleReset = () => {
    if (!confirm('Reset all local content to the default starter content?')) return;
    onResetToDefaultContent();
    clearForms();
    setExportText('');
    setValidationMessage('Local content reset to default content.');
  };

  const chooseGroup = (nextGroup: AdminGroup) => {
    setGroup(nextGroup);
    setTab(nextGroup === 'content' ? 'stotras' : nextGroup === 'setup' ? 'deities' : 'tools');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-deep-blue/72 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            className="admin-studio premium-shell admin-panel relative z-10 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden"
          >
            <header className="premium-header admin-hero">
              <div className="admin-hero-copy">
                <p className="section-kicker">Local Content Studio</p>
                <h2 className="page-title">Manage devotional content locally</h2>
                <p className="page-subtitle">Saved in this browser only. Export content to keep a backup.</p>
              </div>
              <div className="admin-hero-badges">
                <span className="badge">Local-first</span>
                <span className="badge">Export / Import</span>
                <span className="badge">Optional GitHub Publish</span>
              </div>
              <button onClick={onLogoutAdmin} className="secondary-button">
                Logout Admin
              </button>
              <button onClick={onClose} className="icon-button" aria-label="Close admin panel">
                <X size={18} />
              </button>
            </header>

            <div className="admin-tabs nav-menu">
              <TabButton active={group === 'content'} onClick={() => chooseGroup('content')} icon={<ScrollText size={16} />} label="Content" />
              <TabButton active={group === 'setup'} onClick={() => chooseGroup('setup')} icon={<Layers size={16} />} label="Library Setup" />
              <TabButton active={group === 'backup'} onClick={() => chooseGroup('backup')} icon={<Download size={16} />} label="Backup & Publish" />
            </div>

            <div className="admin-subtabs nav-menu">
              {group === 'content' && (
                <>
                  <TabButton active={tab === 'stotras'} onClick={() => setTab('stotras')} icon={<ScrollText size={16} />} label="Stotras" />
                  <TabButton active={tab === 'pooja'} onClick={() => setTab('pooja')} icon={<BookOpen size={16} />} label="Pooja Bidhi" />
                  <TabButton active={tab === 'stories'} onClick={() => setTab('stories')} icon={<BookOpen size={16} />} label="Stories" />
                </>
              )}
              {group === 'setup' && (
                <>
                  <TabButton active={tab === 'deities'} onClick={() => setTab('deities')} icon={<Sparkles size={16} />} label="Deities" />
                  <TabButton active={tab === 'categories'} onClick={() => setTab('categories')} icon={<Layers size={16} />} label="Categories" />
                  <TabButton active={tab === 'panchang'} onClick={() => setTab('panchang')} icon={<CalendarClock size={16} />} label="Panchang Guide" />
                </>
              )}
            </div>

            <div className="admin-body">
              <div className="studio-banner">
                <p>Local admin changes are saved only in this browser. Use Export Content to keep a backup.</p>
                {localContentActive && <p>Local browser content is active. Export or publish it when ready.</p>}
              </div>

              {message && <MessageBanner tone="success" text={message} />}
              {errorMessage && <MessageBanner tone="error" text={errorMessage} />}
              {validationMessage && <MessageBanner tone="neutral" text={validationMessage} />}

              {tab === 'stotras' && (
                <div className="admin-grid">
                  <form onSubmit={submitStotra} className="admin-card premium-form">
                    <div className="section-header">
                      <div>
                        <p className="section-kicker">Stotras</p>
                        <h3 className="section-heading">{editingStotraId ? 'Edit Stotra' : 'Add Stotra'}</h3>
                      </div>
                      {editingStotraId && (
                        <button type="button" onClick={() => { setEditingStotraId(undefined); setStotraForm(emptyStotraForm); }} className="secondary-button">
                          Cancel edit
                        </button>
                      )}
                    </div>

                    <SectionBand title="Basic Details">
                      <div className="form-stack">
                        <input value={stotraForm.title} onChange={(event) => setStotraForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title" className="admin-input" />
                        <input value={stotraForm.alternateTitle || ''} onChange={(event) => setStotraForm((prev) => ({ ...prev, alternateTitle: event.target.value }))} placeholder="Alternate title" className="admin-input" />
                      </div>
                    </SectionBand>

                    <SectionBand title="Deity & Category">
                      <div className="picker-grid">
                        <PickerField
                          label="Deity"
                          value={stotraForm.deity}
                          onChange={(value) => setStotraForm((prev) => ({ ...prev, deity: value }))}
                          placeholder="Search or type deity"
                          suggestions={deityOptions.map((deity) => deity.name)}
                          actionLabel={showInlineDeityForm ? 'Hide New Deity Form' : 'Add New Deity'}
                          actionOnClick={() => setShowInlineDeityForm((open) => !open)}
                        />

                        <PickerField
                          label="Category"
                          value={stotraForm.category}
                          onChange={(value) => setStotraForm((prev) => ({ ...prev, category: value }))}
                          placeholder="Search or type category"
                          suggestions={categoryOptions.map((category) => category.name)}
                          actionLabel={showInlineCategoryForm ? 'Hide New Category Form' : 'Add New Category'}
                          actionOnClick={() => setShowInlineCategoryForm((open) => !open)}
                        />
                      </div>

                      {showInlineDeityForm && (
                        <InlinePanel title="Add New Deity" onSubmit={createInlineDeity}>
                          <input value={inlineDeityForm.name} onChange={(event) => setInlineDeityForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Deity name" className="admin-input" />
                          <input value={inlineDeityForm.sanskritName || ''} onChange={(event) => setInlineDeityForm((prev) => ({ ...prev, sanskritName: event.target.value }))} placeholder="Sanskrit name (optional)" className="admin-input" />
                          <textarea value={inlineDeityForm.description} onChange={(event) => setInlineDeityForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Short description" rows={3} className="admin-input" />
                          <textarea value={inlineDeityForm.significance} onChange={(event) => setInlineDeityForm((prev) => ({ ...prev, significance: event.target.value }))} placeholder="Significance" rows={3} className="admin-input" />
                          <input value={inlineDeityForm.mantra || ''} onChange={(event) => setInlineDeityForm((prev) => ({ ...prev, mantra: event.target.value }))} placeholder="Mantra (optional)" className="admin-input" />
                          <input value={toCommaList(inlineDeityForm.tags || [])} onChange={(event) => setInlineDeityForm((prev) => ({ ...prev, tags: fromCommaList(event.target.value) }))} placeholder="Tags, comma-separated" className="admin-input" />
                          <div className="button-row">
                            <button type="submit" disabled={isSaving} className="action-button">Save deity</button>
                          </div>
                        </InlinePanel>
                      )}

                      {showInlineCategoryForm && (
                        <InlinePanel title="Add New Category" onSubmit={createInlineCategory}>
                          <input value={inlineCategoryForm.name} onChange={(event) => setInlineCategoryForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Category name" className="admin-input" />
                          <input value={inlineCategoryForm.description || ''} onChange={(event) => setInlineCategoryForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description (optional)" className="admin-input" />
                          <div className="button-row">
                            <button type="submit" disabled={isSaving} className="action-button">Save category</button>
                          </div>
                        </InlinePanel>
                      )}

                      <div className="picker-grid">
                        <input value={stotraForm.deity} onChange={(event) => setStotraForm((prev) => ({ ...prev, deity: event.target.value }))} placeholder="Selected deity" className="admin-input" />
                        <input value={stotraForm.category} onChange={(event) => setStotraForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Selected category" className="admin-input" />
                      </div>
                    </SectionBand>

                    <SectionBand title="Content">
                      <div className="form-stack">
                        <textarea value={stotraForm.content} onChange={(event) => setStotraForm((prev) => ({ ...prev, content: event.target.value }))} placeholder="Stotra text or verified excerpt" rows={16} className="admin-input" />
                        <textarea value={stotraForm.process || ''} onChange={(event) => setStotraForm((prev) => ({ ...prev, process: event.target.value }))} placeholder="How to Recite" rows={4} className="admin-input" />
                      </div>
                    </SectionBand>

                    <SectionBand title="Meaning & Benefits">
                      <div className="form-stack">
                        <textarea value={stotraForm.nepaliMeaning || ''} onChange={(event) => setStotraForm((prev) => ({ ...prev, nepaliMeaning: event.target.value }))} placeholder="Meaning" rows={5} className="admin-input" />
                        <textarea value={stotraForm.wordMeaning || ''} onChange={(event) => setStotraForm((prev) => ({ ...prev, wordMeaning: event.target.value }))} placeholder="Word meaning" rows={5} className="admin-input" />
                        <textarea value={stotraForm.benefits || ''} onChange={(event) => setStotraForm((prev) => ({ ...prev, benefits: event.target.value }))} placeholder="Benefits" rows={4} className="admin-input" />
                      </div>
                    </SectionBand>

                    <SectionBand title="Source & Tags">
                      <div className="form-stack">
                        <input value={stotraForm.source || ''} onChange={(event) => setStotraForm((prev) => ({ ...prev, source: event.target.value }))} placeholder="Source note" className="admin-input" />
                        <input value={toCommaList(stotraForm.tags || [])} onChange={(event) => setStotraForm((prev) => ({ ...prev, tags: fromCommaList(event.target.value) }))} placeholder="Tags, comma-separated" className="admin-input" />
                      </div>
                    </SectionBand>

                    <div className="button-row">
                      <button disabled={isSaving} className="action-button">
                        {isSaving ? 'Saving...' : 'Save Stotra'}
                      </button>
                    </div>
                  </form>

                  <AdminList title="Existing stotras">
                    {stotras.map((stotra) => (
                      <RecordCard key={stotra.id} title={stotra.title} subtitle={`${stotra.deity} • ${stotra.category}`} tags={stotra.tags}>
                        <button onClick={() => {
                          setEditingStotraId(stotra.id);
                          setStotraForm({
                            title: stotra.title,
                            alternateTitle: stotra.alternateTitle || '',
                            deity: stotra.deity,
                            category: stotra.category,
                            content: stotra.content,
                            nepaliMeaning: stotra.nepaliMeaning || '',
                            wordMeaning: stotra.wordMeaning || '',
                            benefits: stotra.benefits || '',
                            process: stotra.process || '',
                            source: stotra.source || '',
                            tags: stotra.tags || [],
                            language: stotra.language || '',
                            script: stotra.script || '',
                            status: stotra.status || 'published',
                          });
                          setValidationMessage(null);
                        }} className="icon-button" aria-label={`Edit ${stotra.title}`}><Edit2 size={17} /></button>
                        <button onClick={() => onDeleteStotra(stotra.id)} className="icon-button" aria-label={`Delete ${stotra.title}`}><Trash2 size={17} /></button>
                      </RecordCard>
                    ))}
                  </AdminList>
                </div>
              )}

              {tab === 'deities' && (
                <div className="admin-grid">
                  <form onSubmit={submitDeity} className="admin-card premium-form">
                    <div className="section-header">
                      <div>
                        <p className="section-kicker">Deities</p>
                        <h3 className="section-heading">{editingDeityId ? 'Edit Deity' : 'Add Deity'}</h3>
                      </div>
                      {editingDeityId && (
                        <button type="button" onClick={() => { setEditingDeityId(undefined); setDeityForm(emptyDeityForm); }} className="secondary-button">
                          Cancel edit
                        </button>
                      )}
                    </div>
                    <SectionBand title="Basic Details">
                      <div className="form-stack">
                        <input value={deityForm.name} onChange={(event) => setDeityForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Name" className="admin-input" />
                        <input value={deityForm.sanskritName || ''} onChange={(event) => setDeityForm((prev) => ({ ...prev, sanskritName: event.target.value }))} placeholder="Sanskrit name" className="admin-input" />
                      </div>
                    </SectionBand>
                    <SectionBand title="Description & Significance">
                      <div className="form-stack">
                        <textarea value={deityForm.description} onChange={(event) => setDeityForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" rows={3} className="admin-input" />
                        <textarea value={deityForm.significance} onChange={(event) => setDeityForm((prev) => ({ ...prev, significance: event.target.value }))} placeholder="Significance" rows={4} className="admin-input" />
                      </div>
                    </SectionBand>
                    <SectionBand title="Mantra & Visuals">
                      <div className="form-stack">
                        <input value={deityForm.mantra || ''} onChange={(event) => setDeityForm((prev) => ({ ...prev, mantra: event.target.value }))} placeholder="Mantra" className="admin-input" />
                        <input value={deityForm.imageUrl || ''} onChange={(event) => setDeityForm((prev) => ({ ...prev, imageUrl: event.target.value }))} placeholder="Optional image URL" className="admin-input" />
                        <input value={toCommaList(deityForm.tags || [])} onChange={(event) => setDeityForm((prev) => ({ ...prev, tags: fromCommaList(event.target.value) }))} placeholder="Tags, comma-separated" className="admin-input" />
                      </div>
                    </SectionBand>
                    <div className="button-row">
                      <button disabled={isSaving} className="action-button">{isSaving ? 'Saving...' : 'Save Deity'}</button>
                    </div>
                  </form>

                  <AdminList title="Existing deities">
                    {deities.map((deity) => (
                      <RecordCard key={deity.id} title={deity.name} subtitle={deity.description} tags={deity.tags}>
                        <button onClick={() => {
                          setEditingDeityId(deity.id);
                          setDeityForm({
                            name: deity.name,
                            sanskritName: deity.sanskritName || '',
                            description: deity.description,
                            significance: deity.significance,
                            mantra: deity.mantra || '',
                            imageUrl: deity.imageUrl || '',
                            tags: deity.tags || [],
                            theme: deity.theme || '',
                          });
                          setValidationMessage(null);
                        }} className="icon-button" aria-label={`Edit ${deity.name}`}><Edit2 size={17} /></button>
                        <button onClick={() => onDeleteDeity(deity.id)} className="icon-button" aria-label={`Delete ${deity.name}`}><Trash2 size={17} /></button>
                      </RecordCard>
                    ))}
                  </AdminList>
                </div>
              )}

              {tab === 'categories' && (
                <div className="admin-grid">
                  <form onSubmit={submitCategory} className="admin-card premium-form">
                    <div className="section-header">
                      <div>
                        <p className="section-kicker">Categories</p>
                        <h3 className="section-heading">{editingCategoryId ? 'Edit Category' : 'Add Category'}</h3>
                      </div>
                      {editingCategoryId && (
                        <button type="button" onClick={() => { setEditingCategoryId(undefined); setCategoryForm(emptyCategoryForm); }} className="secondary-button">
                          Cancel edit
                        </button>
                      )}
                    </div>
                    <SectionBand title="Category Details">
                      <div className="form-stack">
                        <input value={categoryForm.name} onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Category name" className="admin-input" />
                        <input value={categoryForm.description || ''} onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" className="admin-input" />
                      </div>
                    </SectionBand>
                    <div className="button-row">
                      <button disabled={isSaving} className="action-button">{isSaving ? 'Saving...' : 'Save Category'}</button>
                    </div>
                  </form>

                  <AdminList title="Existing categories">
                    {categories.map((category) => (
                      <RecordCard key={category.id} title={category.name} subtitle={category.description || 'No description'} tags={[]}>
                        <button onClick={() => {
                          setEditingCategoryId(category.id);
                          setCategoryForm({ name: category.name, description: category.description || '' });
                          setValidationMessage(null);
                        }} className="icon-button" aria-label={`Edit ${category.name}`}><Edit2 size={17} /></button>
                        <button onClick={() => onDeleteCategory(category.id)} className="icon-button" aria-label={`Delete ${category.name}`}><Trash2 size={17} /></button>
                      </RecordCard>
                    ))}
                  </AdminList>
                </div>
              )}

              {tab === 'pooja' && (
                <div className="admin-grid">
                  <form onSubmit={submitPooja} className="admin-card premium-form">
                    <div className="section-header">
                      <div>
                        <p className="section-kicker">Pooja Bidhi</p>
                        <h3 className="section-heading">{editingPoojaId ? 'Edit Pooja Bidhi' : 'Add Pooja Bidhi'}</h3>
                      </div>
                      {editingPoojaId && (
                        <button type="button" onClick={() => { setEditingPoojaId(undefined); setPoojaForm(emptyPoojaForm); }} className="secondary-button">
                          Cancel edit
                        </button>
                      )}
                    </div>
                    <SectionBand title="Basic Details">
                      <div className="form-stack">
                        <input value={poojaForm.title} onChange={(event) => setPoojaForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title" className="admin-input" />
                        <PickerField
                          label="Deity"
                          value={poojaForm.deity}
                          onChange={(value) => setPoojaForm((prev) => ({ ...prev, deity: value }))}
                          placeholder="Search or type deity"
                          suggestions={poojaDeityOptions.map((deity) => deity.name)}
                          actionLabel={showInlinePoojaDeityForm ? 'Hide New Deity Form' : 'Add New Deity'}
                          actionOnClick={() => setShowInlinePoojaDeityForm((open) => !open)}
                        />
                        {showInlinePoojaDeityForm && (
                          <InlinePanel title="Add New Deity" onSubmit={createInlinePoojaDeity}>
                            <input value={inlinePoojaDeityForm.name} onChange={(event) => setInlinePoojaDeityForm((prev) => ({ ...prev, name: event.target.value }))} placeholder="Deity name" className="admin-input" />
                            <input value={inlinePoojaDeityForm.sanskritName || ''} onChange={(event) => setInlinePoojaDeityForm((prev) => ({ ...prev, sanskritName: event.target.value }))} placeholder="Sanskrit name (optional)" className="admin-input" />
                            <textarea value={inlinePoojaDeityForm.description} onChange={(event) => setInlinePoojaDeityForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Short description" rows={3} className="admin-input" />
                            <textarea value={inlinePoojaDeityForm.significance} onChange={(event) => setInlinePoojaDeityForm((prev) => ({ ...prev, significance: event.target.value }))} placeholder="Significance" rows={3} className="admin-input" />
                            <input value={inlinePoojaDeityForm.mantra || ''} onChange={(event) => setInlinePoojaDeityForm((prev) => ({ ...prev, mantra: event.target.value }))} placeholder="Mantra (optional)" className="admin-input" />
                            <input value={toCommaList(inlinePoojaDeityForm.tags || [])} onChange={(event) => setInlinePoojaDeityForm((prev) => ({ ...prev, tags: fromCommaList(event.target.value) }))} placeholder="Tags, comma-separated" className="admin-input" />
                            <div className="button-row">
                              <button type="submit" disabled={isSaving} className="action-button">Save deity</button>
                            </div>
                          </InlinePanel>
                        )}
                        <input value={poojaForm.occasion} onChange={(event) => setPoojaForm((prev) => ({ ...prev, occasion: event.target.value }))} placeholder="Occasion" className="admin-input" />
                      </div>
                    </SectionBand>
                    <SectionBand title="Guide">
                      <div className="form-stack">
                        <textarea value={poojaForm.overview} onChange={(event) => setPoojaForm((prev) => ({ ...prev, overview: event.target.value }))} placeholder="Overview" rows={3} className="admin-input" />
                        <textarea value={toLineList(poojaForm.materials || [])} onChange={(event) => setPoojaForm((prev) => ({ ...prev, materials: fromLineList(event.target.value) }))} placeholder="Materials, one per line or comma separated" rows={8} className="admin-input" />
                        <textarea value={toLineList(poojaForm.steps || [])} onChange={(event) => setPoojaForm((prev) => ({ ...prev, steps: fromLineList(event.target.value) }))} placeholder="Steps, one per line or comma separated" rows={10} className="admin-input" />
                        <textarea value={toLineList(poojaForm.benefits || [])} onChange={(event) => setPoojaForm((prev) => ({ ...prev, benefits: fromLineList(event.target.value) }))} placeholder="Benefits, one per line or comma separated" rows={6} className="admin-input" />
                      </div>
                    </SectionBand>
                    <SectionBand title="Notes">
                      <div className="form-stack">
                        <input value={poojaForm.cautions || ''} onChange={(event) => setPoojaForm((prev) => ({ ...prev, cautions: event.target.value }))} placeholder="Cautions / note" className="admin-input" />
                        <input value={poojaForm.source || ''} onChange={(event) => setPoojaForm((prev) => ({ ...prev, source: event.target.value }))} placeholder="Source note (recommended)" className="admin-input" />
                        <input value={toCommaList(poojaForm.tags || [])} onChange={(event) => setPoojaForm((prev) => ({ ...prev, tags: fromCommaList(event.target.value) }))} placeholder="Tags, comma-separated" className="admin-input" />
                      </div>
                    </SectionBand>
                    <div className="button-row">
                      <button disabled={isSaving} className="action-button">{isSaving ? 'Saving...' : 'Save Pooja Bidhi'}</button>
                    </div>
                  </form>

                  <AdminList title="Existing pooja bidhi">
                    {poojaBidhi.map((item) => (
                      <RecordCard key={item.id} title={item.title} subtitle={`${item.deity} • ${item.occasion}`} tags={item.tags}>
                        <button onClick={() => {
                          setEditingPoojaId(item.id);
                          setPoojaForm({
                            title: item.title,
                            deity: item.deity,
                            occasion: item.occasion,
                            overview: item.overview,
                            materials: item.materials,
                            steps: item.steps,
                            benefits: item.benefits,
                            cautions: item.cautions || '',
                            source: item.source || '',
                            tags: item.tags || [],
                          });
                          setValidationMessage(null);
                        }} className="icon-button" aria-label={`Edit ${item.title}`}><Edit2 size={17} /></button>
                        <button onClick={() => onDeletePoojaBidhi(item.id)} className="icon-button" aria-label={`Delete ${item.title}`}><Trash2 size={17} /></button>
                      </RecordCard>
                    ))}
                  </AdminList>
                </div>
              )}

              {tab === 'stories' && (
                <div className="admin-grid">
                  <form onSubmit={submitStory} className="admin-card premium-form">
                    <div className="section-header">
                      <div>
                        <p className="section-kicker">Stories</p>
                        <h3 className="section-heading">{editingStoryId ? 'Edit Story' : 'Add Story'}</h3>
                      </div>
                      {editingStoryId && (
                        <button type="button" onClick={() => { setEditingStoryId(undefined); setStoryForm(emptyStoryForm); }} className="secondary-button">
                          Cancel edit
                        </button>
                      )}
                    </div>
                    <SectionBand title="Basic Details">
                      <div className="form-stack">
                        <input value={storyForm.title} onChange={(event) => setStoryForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title" className="admin-input" />
                        <input value={storyForm.deity || ''} onChange={(event) => setStoryForm((prev) => ({ ...prev, deity: event.target.value }))} placeholder="Linked deity (optional)" className="admin-input" />
                        <textarea value={storyForm.summary} onChange={(event) => setStoryForm((prev) => ({ ...prev, summary: event.target.value }))} placeholder="Summary" rows={3} className="admin-input" />
                      </div>
                    </SectionBand>
                    <SectionBand title="Story & Lesson">
                      <div className="form-stack">
                        <textarea value={storyForm.story} onChange={(event) => setStoryForm((prev) => ({ ...prev, story: event.target.value }))} placeholder="Story" rows={12} className="admin-input" />
                        <textarea value={storyForm.lesson} onChange={(event) => setStoryForm((prev) => ({ ...prev, lesson: event.target.value }))} placeholder="Lesson" rows={4} className="admin-input" />
                        <input value={storyForm.source || ''} onChange={(event) => setStoryForm((prev) => ({ ...prev, source: event.target.value }))} placeholder="Source note" className="admin-input" />
                        <input value={toCommaList(storyForm.tags || [])} onChange={(event) => setStoryForm((prev) => ({ ...prev, tags: fromCommaList(event.target.value) }))} placeholder="Tags, comma-separated" className="admin-input" />
                      </div>
                    </SectionBand>
                    <div className="button-row">
                      <button disabled={isSaving} className="action-button">{isSaving ? 'Saving...' : 'Save Story'}</button>
                    </div>
                  </form>

                  <AdminList title="Existing stories">
                    {stories.map((story) => (
                      <RecordCard key={story.id} title={story.title} subtitle={story.summary} tags={story.tags}>
                        <button onClick={() => {
                          setEditingStoryId(story.id);
                          setStoryForm({
                            title: story.title,
                            deity: story.deity || '',
                            summary: story.summary,
                            story: story.story,
                            lesson: story.lesson,
                            source: story.source || '',
                            tags: story.tags || [],
                          });
                          setValidationMessage(null);
                        }} className="icon-button" aria-label={`Edit ${story.title}`}><Edit2 size={17} /></button>
                        <button onClick={() => onDeleteStory(story.id)} className="icon-button" aria-label={`Delete ${story.title}`}><Trash2 size={17} /></button>
                      </RecordCard>
                    ))}
                  </AdminList>
                </div>
              )}

              {tab === 'panchang' && (
                <div className="admin-tools-grid">
                  <form onSubmit={submitPanchang} className="admin-card premium-form">
                    <div className="section-header">
                      <div>
                        <p className="section-kicker">Panchang</p>
                        <h3 className="section-heading">Edit Panchang Guide</h3>
                      </div>
                    </div>
                    <SectionBand title="Educational Intro">
                      <div className="form-stack">
                        <input value={panchangForm.introTitle} onChange={(event) => setPanchangForm((prev) => ({ ...prev, introTitle: event.target.value }))} placeholder="Intro title" className="admin-input" />
                        <textarea value={panchangForm.intro} onChange={(event) => setPanchangForm((prev) => ({ ...prev, intro: event.target.value }))} placeholder="Intro copy" rows={4} className="admin-input" />
                      </div>
                    </SectionBand>
                    <SectionBand title="Terms">
                      <textarea
                        value={panchangTermsText}
                        onChange={(event) => setPanchangTermsText(event.target.value)}
                        placeholder="Tithi: Lunar day used in Hindu calendrical tradition."
                        rows={12}
                        className="admin-input"
                      />
                    </SectionBand>
                    <SectionBand title="Daily Notes">
                      <textarea
                        value={panchangNotesText}
                        onChange={(event) => setPanchangNotesText(event.target.value)}
                        placeholder="Morning reflection: Short prayer or stotra reading."
                        rows={9}
                        className="admin-input"
                      />
                    </SectionBand>
                    <SectionBand title="Disclaimer">
                      <textarea value={panchangForm.disclaimer} onChange={(event) => setPanchangForm((prev) => ({ ...prev, disclaimer: event.target.value }))} placeholder="Disclaimer" rows={4} className="admin-input" />
                    </SectionBand>
                    <div className="button-row">
                      <button disabled={isSaving} className="action-button">{isSaving ? 'Saving...' : 'Save Panchang Guide'}</button>
                    </div>
                  </form>
                </div>
              )}

              {tab === 'tools' && (
                <div className="admin-tools-grid">
                  <div className="stats-grid">
                    <MetricCard label="Stotras" value={stotras.length} />
                    <MetricCard label="Deities" value={deities.length} />
                    <MetricCard label="Pooja Bidhi" value={poojaBidhi.length} />
                    <MetricCard label="Stories" value={stories.length} />
                    <MetricCard label="Panchang Terms" value={panchang.terms.length} />
                  </div>

                  <div className="admin-card backup-card">
                    <div className="section-header">
                      <div>
                        <p className="section-kicker">Backup &amp; Publish</p>
                        <h3 className="section-heading">Portable local content controls</h3>
                      </div>
                    </div>
                    <section className="backup-section">
                      <div>
                        <p className="backup-title">Export JSON</p>
                        <p className="body-copy">Always works locally. Use this before moving browsers or accounts.</p>
                      </div>
                      <div className="button-row">
                        <button onClick={handleExport} className="action-button">Export Content</button>
                      </div>
                    </section>
                    <section className="backup-section">
                      <div>
                        <p className="backup-title">Import JSON</p>
                        <p className="body-copy">Always works locally. Paste JSON below or load a file first.</p>
                      </div>
                      <div className="button-row">
                        <button onClick={handleImport} className="secondary-button">Import Content</button>
                      </div>
                    </section>
                    <section className="backup-section">
                      <div>
                        <p className="backup-title">Reset Defaults</p>
                        <p className="body-copy">Always works locally and asks for confirmation before clearing local edits.</p>
                      </div>
                      <div className="button-row">
                        <button onClick={handleReset} className="secondary-button danger-button">Reset Defaults</button>
                      </div>
                    </section>
                    <section className="backup-section">
                      <div>
                        <p className="backup-title">Publish to GitHub</p>
                        <p className="body-copy">Optional. Requires Netlify Functions plus server environment variables.</p>
                      </div>
                      <div className="button-row">
                        <button onClick={onPublishContent} disabled={isSaving} className="secondary-button">{isSaving ? 'Publishing...' : 'Publish to GitHub'}</button>
                      </div>
                    </section>
                    <textarea
                      value={exportText}
                      onChange={(event) => setExportText(event.target.value)}
                      className="admin-input admin-json"
                      placeholder="Exported content or paste JSON here to import"
                    />
                    <label className="file-import">
                      <input
                        type="file"
                        accept="application/json"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          setExportText(await file.text());
                        }}
                      />
                      <span>Load content from file</span>
                    </label>
                    <p className="body-copy">Local changes are saved in this browser first. Publish to GitHub only works when Netlify Functions and server environment variables are configured.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`nav-item ${active ? 'nav-item-active' : ''}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function SectionBand({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="section-band">
      <p className="section-kicker">{title}</p>
      <div className="section-band-content">{children}</div>
    </section>
  );
}

function InlinePanel({ title, onSubmit, children }: { title: string; onSubmit: (event: FormEvent) => void; children: ReactNode }) {
  return (
    <div className="inline-panel">
      <p className="section-kicker">{title}</p>
      <form onSubmit={onSubmit} className="form-stack">
        {children}
      </form>
    </div>
  );
}

function PickerField({
  label,
  value,
  onChange,
  placeholder,
  suggestions,
  actionLabel,
  actionOnClick,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  suggestions: string[];
  actionLabel: string;
  actionOnClick: () => void;
}) {
  return (
    <div className="picker-field">
      <p className="field-label">{label}</p>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="admin-input" />
      <div className="picker-actions">
        <button type="button" onClick={actionOnClick} className="secondary-button">{actionLabel}</button>
      </div>
      {suggestions.length > 0 && (
        <div className="picker-suggestions">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => onChange(suggestion)} className="picker-suggestion">
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminList({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="admin-card admin-list">
      <div className="section-header">
        <div>
          <p className="section-kicker">Library</p>
          <h3 className="section-heading">{title}</h3>
        </div>
      </div>
      <div className="record-list">{children}</div>
    </div>
  );
}

function RecordCard({ title, subtitle, tags, children }: { key?: string; title: string; subtitle?: string; tags: string[]; children: ReactNode }) {
  return (
    <div className="record-card">
      <div className="record-card-copy">
        <p className="record-title">{title}</p>
        {subtitle && <p className="record-subtitle">{subtitle}</p>}
        {tags.length > 0 && (
          <div className="tag-row">
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-chip tag-chip-muted">#{tag}</span>
            ))}
          </div>
        )}
      </div>
      <div className="record-actions">{children}</div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="metric-card">
      <p className="section-kicker">{label}</p>
      <p className="metric-value">{value}</p>
    </div>
  );
}

function MessageBanner({ tone, text }: { tone: 'success' | 'error' | 'neutral'; text: string }) {
  return <div className={`message-banner message-${tone}`}>{text}</div>;
}
