const STORAGE_KEY = 'geminiApiKey';

export const getGeminiKey = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY) ?? '';
};

export const setGeminiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

export const hasGeminiKey = (): boolean => getGeminiKey().length > 0;
