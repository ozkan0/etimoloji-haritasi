import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Word } from '../types/types';

export const useEtymologyData = () => {
  const [sidebarWords, setSidebarWords] = useState<Word[]>([]);
  const [newsItems, setNewsItems] = useState<{ id: number, text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: rawData, error: rpcError } = await supabase.rpc('get_random_words', { limit_count: 2000 });
        
        if (rpcError) throw rpcError;

        if (rawData) {
          const formattedWords: Word[] = rawData.map((w: any) => ({
            id: w.id,
            word: w.word,
            originLanguage: w.originLanguage || w.originlanguage || w.origin_language || 'Bilinmiyor',
            period: w.period,
            source: w.source,
            date: w.date
          }));
          setSidebarWords(formattedWords);
        }

        const { data: newsData, error: newsError } = await supabase.from('news').select('id, text');
        
        if (newsError) {
            console.error('News fetch error:', newsError);
        } else {
            setNewsItems(newsData || []);
        }

      } catch (err: any) {
        console.error('Data fetch error:', err);
        setError(err.message);
      } finally {
        setTimeout(() => setIsLoading(false), 1500);
      }
    };

    fetchData();
  }, []);

  return { sidebarWords, newsItems, isLoading, error };
};