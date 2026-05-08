export interface Stotra {
  id: string;
  title: string;
  alternateTitle?: string;
  deity: string;
  category: string;
  content: string;
  nepaliMeaning?: string;
  wordMeaning?: string;
  benefits?: string;
  process?: string;
  source?: string;
  tags: string[];
  language?: string;
  script?: string;
  status?: 'draft' | 'published';
}

export interface Deity {
  id: string;
  name: string;
  sanskritName?: string;
  description: string;
  significance: string;
  mantra?: string;
  imageUrl?: string;
  tags: string[];
  theme?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface PoojaBidhi {
  id: string;
  title: string;
  deity: string;
  occasion: string;
  overview: string;
  materials: string[];
  steps: string[];
  benefits: string[];
  cautions?: string;
  source?: string;
  tags: string[];
}

export interface HinduStory {
  id: string;
  title: string;
  deity?: string;
  summary: string;
  story: string;
  lesson: string;
  source?: string;
  tags: string[];
}

export interface PanchangTerm {
  name?: string;
  description?: string;
  practicalMeaning?: string;
  title?: string;
  text?: string;
}

export interface PanchangContent {
  introTitle: string;
  intro: string;
  terms: PanchangTerm[];
  dailyNotes: PanchangTerm[];
  disclaimer: string;
}

export interface HistoryItem {
  id: string;
  stotraId: string;
  stotraTitle: string;
  visitedAt: string;
}

export interface ContentBundle {
  stotras: Stotra[];
  deities: Deity[];
  categories: Category[];
  poojaBidhi: PoojaBidhi[];
  stories: HinduStory[];
  panchang: PanchangContent;
}
