import { supabase } from '../lib/supabaseClient';
import { Word } from '../types/types';

function getCalculatedPeriod(dateValue: any): string {
    if (typeof dateValue === 'number') {
        if (dateValue < 1300) return 'Osmanlı Öncesi';
        if (dateValue <= 1928) return 'Osmanlı';
        return 'Cumhuriyet';
    }
    return 'Cumhuriyet';
}

function processWordRecord(w: any): Word {
    let rawDateSortable = w.oldestDate || w.oldest_dateSortable;
    if (rawDateSortable === undefined && w.oldestHistory?.dateSortable) {
        rawDateSortable = w.oldestHistory.dateSortable;
    }

    // Parse to int just in case CSV imported it as string
    if (typeof rawDateSortable === 'string') {
        const match = rawDateSortable.match(/\d{3,4}/);
        if (match) {
            rawDateSortable = parseInt(match[0], 10);
        } else {
            rawDateSortable = parseInt(rawDateSortable, 10);
        }
    }

    if (rawDateSortable === undefined || isNaN(rawDateSortable)) {
        if (w.date) {
            if (typeof w.date === 'string') {
                const match = w.date.match(/\d{3,4}/);
                if (match) rawDateSortable = parseInt(match[0], 10);
            } else if (typeof w.date === 'number') {
                rawDateSortable = w.date;
            }
        }
    }

    const calculatedPeriod = w.period || getCalculatedPeriod(rawDateSortable);

    // Reconstruct oldestHistory object for frontend compatibility if missing
    let oldestHistoryObj = w.oldestHistory;
    if (!oldestHistoryObj && (w.oldest_dateSortable !== undefined || w.oldestDate !== undefined)) {
        oldestHistoryObj = {
            dateSortable: rawDateSortable,
            source: {
                book: w.oldestSource || w.source_book || null,
                name: w.source_name || null,
                datePublished: w.source_datePublished || null,
                date: w.oldestDate || w.source_date || null,
                isLinguistic: w.source_isLinguistic === 'true' || w.source_isLinguistic === true,
                isQuote: w.source_isQuote === 'true' || w.source_isQuote === true
            },
            date: w.oldestDate || w.oldest_date || null,
            excerpt: w.oldestSource || w.oldest_excerpt || null,
            quote: w.oldest_quote || null,
            language: w.history_language_name ? {
                name: w.history_language_name,
                description: w.history_language_description,
                description2: w.history_language_description2
            } : null
        };
    }

    return {
        id: w.id || w._id,
        word: w.word,
        originLanguage: w.originLanguage || w.ultimateOriginLanguage || 'Bilinmiyor',
        immediateSourceLanguage: w.immediateLanguage || w.immediateSourceLanguage,
        ultimateOriginLanguage: w.ultimateOriginLanguage,
        etymology_text: w.etymology || w.etymology_text,
        period: calculatedPeriod,
        source: w.oldestSource || w.source_book || w.oldestHistory?.source?.book || w.source || 'TDK',
        // The user specifically requested `date` (label) to reflect oldest_dateSortable
        date: rawDateSortable || w.oldestDate || w.oldest_date || w.date,
        oldestHistory: oldestHistoryObj,
        formula: w.formula,
        originSourceType: w.originSourceType,
        isControversial: w.isControversial,
        extraInfo: w.extraInfo
    };
}

export const wordService = {
    fetchSidebarWords: async (limit: number = 20): Promise<Word[]> => {
        // Simple logic for a short duration: fetch a random chunk by taking advantage of a random offset.
        // Assuming ~12000 words in the db.
        const randomOffset = Math.floor(Math.random() * 14000);

        const { data: rawData, error } = await supabase
            .from('words_db')
            .select('*')
            .range(randomOffset, randomOffset + limit - 1);

        if (error) {
            console.error('Error fetching words:', error);
            return [];
        }

        if (rawData) {
            const shuffled = rawData.sort(() => 0.5 - Math.random()).slice(0, limit);
            return shuffled.map(processWordRecord);
        }
        return [];
    },

    searchWords: async (query: string): Promise<Word[]> => {
        if (!query || query.trim() === '') return [];

        const { data: rawData, error } = await supabase
            .from('words_db')
            .select('*')
            .ilike('word', `%${query.trim()}%`)
            .limit(50);

        if (error) {
            console.error('Error searching words:', error);
            return [];
        }

        if (rawData) {
            return rawData.map(processWordRecord);
        }
        return [];
    },

    fetchFilteredWords: async (language: string, period: string, languageMode: 'origin' | 'immediate', limit: number = 300): Promise<Word[]> => {
        let query = supabase.from('words_db').select('*');

        if (language !== 'Tüm Diller') {
            if (languageMode === 'immediate') {
                query = query.eq('immediateLanguage', language);
            } else {
                query = query.eq('originLanguage', language);
            }
        }

        query = query.limit(limit);

        const { data: rawData, error } = await query;

        if (error) {
            console.error('Error fetching filtered words:', error);
            return [];
        }

        if (rawData) {
            let processed = rawData.map(processWordRecord);
            if (period !== 'Tüm Dönemler') {
                processed = processed.filter(w => w.period === period);
            }
            return processed;
        }
        return [];
    },

    fetchDailyWord: async (): Promise<Word | null> => {
        const today = new Date();
        const seed = today.getDate() + (today.getMonth() + 1) * 100 + today.getFullYear() * 10000;

        const pseudoRandom = Math.abs(Math.sin(seed));
        const offset = Math.floor(pseudoRandom * 14000);

        const { data: rawData, error } = await supabase
            .from('words_db')
            .select('*')
            .range(offset, offset)
            .limit(1)
            .single();

        if (error || !rawData) {
            console.error('Error fetching daily word:', error);
            return null;
        }

        return processWordRecord(rawData);
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
