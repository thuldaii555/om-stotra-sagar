export interface Stotra {
  id: string;
  title: string;
  titleNe?: string;
  alternateTitle?: string;
  alternateTitleNe?: string;
  deity: string;
  deityNe?: string;
  category: string;
  categoryNe?: string;
  imageUrl?: string;
  content: string;
  romanizedContent?: string;
  meaning?: string;
  meaningNe?: string;
  nepaliMeaning?: string;
  wordMeaning?: string;
  wordMeaningNe?: string;
  benefits?: string;
  benefitsNe?: string;
  process?: string;
  processNe?: string;
  source?: string;
  sourceNe?: string;
  sourcePdfName?: string;
  sourcePdfDataUrl?: string;
  sourcePdfUrl?: string;
  tags: string[];
  language?: string;
  script?: string;
  status?: 'draft' | 'published';
}

export interface ImageCrop {
  x: number;
  y: number;
  scale: number;
}

export interface Deity {
  id: string;
  name: string;
  nameNe?: string;
  type?: 'God' | 'Goddess' | 'Form' | 'Other';
  typeNe?: string;
  sanskritName?: string;
  introduction?: string;
  introductionNe?: string;
  description: string;
  significance: string;
  significanceNe?: string;
  mantra?: string;
  imageUrl?: string;
  imageDataUrl?: string;
  imageSrc?: string;
  imageCrop?: ImageCrop;
  imageFit?: string;
  imagePositionX?: number;
  imagePositionY?: number;
  imageScale?: number;
  tags: string[];
  theme?: string;
}

export interface Category {
  id: string;
  name: string;
  nameNe?: string;
  description?: string;
  descriptionNe?: string;
}

export interface PoojaBidhi {
  id: string;
  title: string;
  titleNe?: string;
  deity: string;
  deityNe?: string;
  occasion: string;
  occasionNe?: string;
  overview: string;
  overviewNe?: string;
  materials: string[];
  materialsNe?: string[];
  steps: string[];
  stepsNe?: string[];
  benefits: string[];
  benefitsNe?: string[];
  cautions?: string;
  cautionsNe?: string;
  source?: string;
  sourceNe?: string;
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

export interface PanchangRequest {
  date: string;
  lat: number;
  lng: number;
  timezone: string;
  language?: 'ne' | 'en';
}

export interface PanchangField {
  name: string;
  start?: string;
  end?: string;
}

export interface PanchangLocation {
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
}

export interface PanchangResult {
  configured: boolean;
  provider?: string;
  date: string;
  location?: PanchangLocation;
  sunrise?: PanchangField | null;
  sunset?: PanchangField | null;
  tithi?: PanchangField | null;
  nakshatra?: PanchangField | null;
  yoga?: PanchangField | null;
  karana?: PanchangField | null;
  paksha?: PanchangField | null;
  lunarMonth?: PanchangField | null;
  rahuKaal?: PanchangField | null;
  rawSummary?: string;
  message?: string;
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
  devotionalContent?: Stotra[];
  deities: Deity[];
  categories: Category[];
  poojaBidhi: PoojaBidhi[];
  stories: HinduStory[];
  panchang: PanchangContent;
  updatedAt?: string;
  lastPublishedAt?: string;
  sourceVersion?: string;
}
