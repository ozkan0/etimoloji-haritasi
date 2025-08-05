export interface Word {
  id: number;
  word: string;
  meaning: string;
  originLanguage: string;
  period: 'Osmanlı Öncesi' | 'Osmanlı' | 'Cumhuriyet';
  exampleSentence: string;
  source: string;
  references?: string;
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