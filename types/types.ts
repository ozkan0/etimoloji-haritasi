export interface Word {
  id: number;
  word: string;
  originLanguage: string;
  period: string;
  source: string;
  date?: string | number;
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