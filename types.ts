// types.ts

// Kelime verisinin temel yapısı
export interface Word {
  id: number;
  word: string;
  originLanguage: string;
  period: 'Osmanlı Öncesi' | 'Osmanlı' | 'Cumhuriyet';
  exampleSentence: string;
  source: string;
  references?: string;
}

// Dil ve harita verisinin yapısı
export interface Language {
  language: string;
  representativeCountry: string;
  boundingBox: [number, number, number, number];
}

// Haritada gösterilecek bir kelimenin, kendi verisine ek olarak koordinatlarını da içeren yapısı
export interface WordOnMap extends Word {
  coordinates: [number, number];
}