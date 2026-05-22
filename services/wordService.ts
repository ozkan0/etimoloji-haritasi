import { supabase } from '../lib/supabaseClient';
import { normalizePeriodLabel } from '../lib/constants';
import { Word } from '../types/types';
import { normalizeTurkish } from '../utils/normalizeTurkish';

interface WordsDbRow {
    id: number;
    _id?: string;
    word: string;
    originLanguage: string;
    ultimateOriginLanguage?: string | null;
    immediateLanguage?: string | null;
    immediateSourceLanguage?: string | null;
    etymology?: string | null;
    etymology_text?: string | null;
    period?: string | null;
    oldestDate?: string | number | null;
    oldest_dateSortable?: number | null;
    date?: string | number | null;
    oldest_date?: string | null;
    oldestSource?: string | null;
    source_book?: string | null;
    source_name?: string | null;
    source_datePublished?: string | null;
    source_date?: string | null;
    source_isLinguistic?: string | boolean | null;
    source_isQuote?: string | boolean | null;
    oldest_excerpt?: string | null;
    oldest_quote?: string | null;
    history_language_name?: string | null;
    history_language_description?: string | null;
    history_language_description2?: string | null;
    oldestHistory?: {
        dateSortable?: number;
        source?: {
            book?: string | null;
            name?: string | null;
            datePublished?: string | null;
            date?: string | number | null;
            isLinguistic?: boolean;
            isQuote?: boolean;
        };
        date?: string | number | null;
        excerpt?: string | null;
        quote?: string | null;
        language?: {
            name: string;
            description?: string | null;
            description2?: string | null;
        } | null;
    };
    source?: string | null;
    formula?: string | null;
    originSourceType?: string | null;
    isControversial?: boolean | string | null;
    extraInfo?: string | null;
}

function getCalculatedPeriod(dateValue: number | undefined): string {
    if (typeof dateValue === 'number') {
        if (dateValue < 1300) return 'Osmanlı Öncesi';
        if (dateValue <= 1928) return 'Osmanlı';
    }
    return 'Cumhuriyet';
}

function processWordRecord(w: WordsDbRow): Word {
    let rawDateSortable: number | undefined = (w.oldest_dateSortable !== null && w.oldest_dateSortable !== undefined) 
        ? w.oldest_dateSortable 
        : (typeof w.oldestDate === 'number' ? w.oldestDate : undefined);
    
    if (rawDateSortable === undefined && w.oldestHistory?.dateSortable) {
        rawDateSortable = w.oldestHistory.dateSortable;
    }

    const parseYear = (val: string | number | undefined | null): number | undefined => {
        if (val === undefined || val === null) return undefined;
        if (typeof val === 'number') return val;
        const match = val.match(/\d{3,4}/);
        return match ? parseInt(match[0], 10) : undefined;
    };

    if (rawDateSortable === undefined) {
        rawDateSortable = parseYear(w.oldestDate) ?? parseYear(w.date);
    }

    const calculatedPeriod = normalizePeriodLabel(w.period || getCalculatedPeriod(rawDateSortable));

    let oldestHistoryObj = w.oldestHistory;
    if (!oldestHistoryObj && (w.oldest_dateSortable != null || w.oldestDate != null)) {
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
        id: w.id || w._id || 0,
        word: w.word,
        originLanguage: w.originLanguage || w.ultimateOriginLanguage || 'Bilinmiyor',
        immediateSourceLanguage: w.immediateLanguage || w.immediateSourceLanguage || undefined,
        ultimateOriginLanguage: w.ultimateOriginLanguage || undefined,
        etymology_text: w.etymology || w.etymology_text || undefined,
        period: calculatedPeriod,
        source: w.oldestSource || w.source_book || w.oldestHistory?.source?.book || w.source || 'TDK',
        date: rawDateSortable || w.oldestDate || w.oldest_date || w.date || undefined,
        oldestHistory: oldestHistoryObj || undefined,
        formula: w.formula || undefined,
        originSourceType: w.originSourceType || undefined,
        isControversial: w.isControversial ?? undefined,
        extraInfo: w.extraInfo || undefined
    };
}

export const wordService = {
    getWordCount: async (): Promise<number> => {
        const { count, error } = await supabase
            .from('words_db')
            .select('*', { count: 'exact', head: true });

        if (error || !count) {
            console.error(`Supabase error in getWordCount: ${error?.message}`);
            return 0;
        }
        return count;
    },

    fetchAllWordIds: async (count: number): Promise<number[]> => {
        const PAGE = 1000;
        const numPages = Math.ceil(count / PAGE);

        const pages = await Promise.all(
            [...Array(numPages).keys()].map(async (p) => {
                const { data, error } = await supabase
                    .from('words_db')
                    .select('id')
                    .order('id', { ascending: true })
                    .range(p * PAGE, p * PAGE + PAGE - 1);

                if (error) {
                    console.error(`Supabase error in fetchAllWordIds: ${error.message}`);
                    return [] as number[];
                }
                return (data || []).map((r: any) => r.id as number);
            })
        );
        return pages.flat();
    },

    fetchWordsByIds: async (ids: number[]): Promise<Word[]> => {
        if (ids.length === 0) return [];

        const BATCH = 500;
        const batches: number[][] = [];
        for (let i = 0; i < ids.length; i += BATCH) {
            batches.push(ids.slice(i, i + BATCH));
        }

        const results = await Promise.all(
            batches.map(async (batch) => {
                const { data, error } = await supabase
                    .from('words_db')
                    .select('*')
                    .in('id', batch);

                if (error) {
                    console.error(`Supabase error in fetchWordsByIds: ${error.message}`);
                    return [];
                }
                return data || [];
            })
        );

        const flat = results.flat();
        flat.sort(() => 0.5 - Math.random());
        return flat.map((w: any) => processWordRecord(w as WordsDbRow));
    },

    searchWords: async (query: string): Promise<Word[]> => {
        const trimmedQuery = query?.trim();
        if (!trimmedQuery) return [];

        const normalized = normalizeTurkish(trimmedQuery);
        if (!normalized) return [];

        const { data: rawData, error } = await supabase
            .rpc('search_words_ranked', {
                raw_query: trimmedQuery,
                search_query: normalized
            })
            .limit(50);

        if (error) {
            console.error(`Supabase error in searchWords: ${error.message}`);
            return [];
        }

        if (rawData) {
            return rawData.map((w: any) => processWordRecord(w as WordsDbRow));
        }
        return [];
    },

    fetchWordByExact: async (word: string): Promise<Word | null> => {
        const trimmedWord = word?.trim();
        if (!trimmedWord) return null;

        const { data: rawData, error } = await supabase
            .from('words_db')
            .select('*')
            .ilike('word', trimmedWord)
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error(`Supabase error in fetchWordByExact: ${error.message}`);
            return null;
        }

        return rawData ? processWordRecord(rawData as WordsDbRow) : null;
    },

    fetchFilteredWords: async (language: string, period: string, languageMode: 'origin' | 'immediate', limit: number = 300): Promise<Word[]> => {
        let query = supabase.from('words_db').select('*');

        if (language !== 'Tüm Diller') {
            query = query.eq(languageMode === 'immediate' ? 'immediateLanguage' : 'originLanguage', language);
        }

        const { data: rawData, error } = await query.limit(limit);

        if (error) {
            console.error(`Supabase error in fetchFilteredWords: ${error.message}`);
            return [];
        }

        if (rawData) {
            let processed = rawData.map((w: any) => processWordRecord(w as WordsDbRow));
            if (period !== 'Tüm Dönemler') {
                const normalizedPeriod = normalizePeriodLabel(period);
                processed = processed.filter(w => normalizePeriodLabel(w.period) === normalizedPeriod);
            }
            return processed;
        }
        return [];
    },

    fetchDailyWord: async (): Promise<Word | null> => {
        const today = new Date();
        const seed = today.getDate() + (today.getMonth() + 1) * 100 + today.getFullYear() * 10000;

        const pseudoRandom = Math.abs(Math.sin(seed));

        const { count, error: countError } = await supabase
            .from('words_db')
            .select('*', { count: 'exact', head: true });

        if (countError || !count) {
            console.error(`Supabase error in fetchDailyWord (count): ${countError?.message}`);
            return null;
        }

        const offset = Math.floor(pseudoRandom * count);

        const { data: rawData, error } = await supabase
            .from('words_db')
            .select('*')
            .range(offset, offset)
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error(`Supabase error in fetchDailyWord: ${error.message}`);
            return null;
        }

        return rawData ? processWordRecord(rawData as WordsDbRow) : null;
    },

    fetchNewsItems: async (): Promise<{ id: number, text: string }[]> => {
        const { data: newsData, error } = await supabase.from('news').select('id, text');
        if (error) {
            console.error(`Supabase error in fetchNewsItems: ${error.message}`);
            return [];
        }
        return newsData || [];
    }
};
