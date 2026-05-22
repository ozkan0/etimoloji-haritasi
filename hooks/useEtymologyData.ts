import { useState, useEffect, useRef, useCallback } from 'react';
import { Word } from '../types/types';
import { wordService } from '../services/wordService';

const MAP_BUFFER_SIZE = 1500;

const shuffleInPlace = <T,>(arr: T[]): void => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

export const useEtymologyData = () => {
  const [sidebarWords, setSidebarWords] = useState<Word[]>([]);
  const [mapWords, setMapWords] = useState<Word[]>([]);
  const [dailyWord, setDailyWord] = useState<Word | null>(null);
  const [newsItems, setNewsItems] = useState<{ id: number, text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordIdsRef = useRef<number[]>([]);
  const idCursorRef = useRef(0);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const count = await wordService.getWordCount();
        const ids = await wordService.fetchAllWordIds(count);
        shuffleInPlace(ids);
        wordIdsRef.current = ids;

        if (ids.length > 0) {
          const firstChunk = ids.slice(0, MAP_BUFFER_SIZE);
          const mapW = await wordService.fetchWordsByIds(firstChunk);
          setMapWords(mapW);
          setSidebarWords(mapW.slice(0, 20));
          idCursorRef.current = firstChunk.length;
        } else {
          setMapWords([]);
          setSidebarWords([]);
        }

        const daily = await wordService.fetchDailyWord();
        setDailyWord(daily);

        const news = await wordService.fetchNewsItems();
        setNewsItems(news);

      } catch (err) {
        console.error('Data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch etymology data from the server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const refreshMapWords = useCallback(async () => {
    const ids = wordIdsRef.current;
    if (ids.length === 0) return;

    setIsRefreshing(true);
    try {
      if (idCursorRef.current >= ids.length) {
        shuffleInPlace(ids);
        idCursorRef.current = 0;
      }

      const chunk = ids.slice(idCursorRef.current, idCursorRef.current + MAP_BUFFER_SIZE);
      idCursorRef.current += chunk.length;

      const nextWords = await wordService.fetchWordsByIds(chunk);
      if (nextWords.length > 0) {
        setMapWords(nextWords);
        setSidebarWords(nextWords.slice(0, 20));
      }
    } catch (err) {
      console.error('Map words refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { sidebarWords, mapWords, dailyWord, newsItems, isLoading, isRefreshing, error, refreshMapWords };
};
