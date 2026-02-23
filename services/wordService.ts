import { supabase } from '../lib/supabaseClient';
import { Word } from '../types/types';

export const wordService = {
    fetchSidebarWords: async (limit: number = 2000): Promise<Word[]> => {
        const { data: rawData, error: rpcError } = await supabase.rpc('get_random_words', { limit_count: limit });

        if (rpcError) throw rpcError;

        if (rawData) {
            return rawData.map((w: any) => ({
                id: w.id,
                word: w.word,
                originLanguage: w.originLanguage || w.originlanguage || w.origin_language || 'Bilinmiyor',
                period: w.period,
                source: w.source,
                date: w.date
            }));
        }
        return [];
    },

    fetchNewsItems: async (): Promise<{ id: number, text: string }[]> => {
        const { data: newsData, error: newsError } = await supabase.from('news').select('id, text');
        if (newsError) {
            console.error('News fetch error:', newsError);
            return [];
        }
        return newsData || [];
    }
};
