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
    source?: any;
    date?: string;
    excerpt?: string;
    quote?: string;
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