import { useState, useEffect } from 'react';
import { Word } from '../types/types';
import { wordService } from '../services/wordService';

export const useEtymologyData = () => {
  const [sidebarWords, setSidebarWords] = useState<Word[]>([]);
  const [newsItems, setNewsItems] = useState<{ id: number, text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const words = await wordService.fetchSidebarWords(2000);
        setSidebarWords(words);

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

  return { sidebarWords, newsItems, isLoading, error };
};