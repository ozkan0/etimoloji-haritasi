export interface Word {
  id: number | string;
  word: string;
  originLanguage: string; // Legacy fallback
  immediateSourceLanguage?: string;
  ultimateOriginLanguage?: string;
  etymology_text?: string;
  period: string;
  source: string;
  date?: string | number;
  oldestHistory?: {
    dateSortable?: number;
    source?: {
      book?: string | null;
      name?: string | null;
      datePublished?: string | null;
      date?: string | number | null;
      isLinguistic?: boolean;
      isQuote?: boolean;
    };
    date?: string | number | null;
    excerpt?: string | null;
    quote?: string | null;
    language?: {
      name: string;
      description?: string | null;
      description2?: string | null;
    } | null;
  };
  formula?: string;
  originSourceType?: string;
  isControversial?: boolean | string;
  extraInfo?: string;
}

export interface Language {
  language: string;
  representativeCountry: string;
  boundingBox: [number, number, number, number];
  polygon?: [number, number][][];
}

export interface WordOnMap extends Word {
  coordinates: [number, number];
}