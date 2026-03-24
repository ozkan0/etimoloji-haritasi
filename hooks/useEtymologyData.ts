import { useState, useEffect } from 'react';
import { Word } from '../types/types';
import { wordService } from '../services/wordService';

export const useEtymologyData = () => {
  const [sidebarWords, setSidebarWords] = useState<Word[]>([]);
  const [mapWords, setMapWords] = useState<Word[]>([]);
  const [dailyWord, setDailyWord] = useState<Word | null>(null);
  const [newsItems, setNewsItems] = useState<{ id: number, text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const sidebar = await wordService.fetchSidebarWords(20);
        setSidebarWords(sidebar);

        const mapW = await wordService.fetchSidebarWords(1500);
        setMapWords(mapW);

        const daily = await wordService.fetchDailyWord();
        setDailyWord(daily);

        const news = await wordService.fetchNewsItems();
        setNewsItems(news);

      } catch (err: any) {
        console.error('Data fetch error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { sidebarWords, mapWords, dailyWord, newsItems, isLoading, error };
};