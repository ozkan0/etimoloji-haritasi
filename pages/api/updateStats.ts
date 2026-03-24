import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

function getCalculatedPeriod(dateValue: any): string {
    if (typeof dateValue === 'number') {
        if (dateValue < 1300) return 'Osmanlı Öncesi';
        if (dateValue <= 1928) return 'Osmanlı';
        return 'Cumhuriyet';
    }
    return 'Cumhuriyet';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        let allData: any[] = [];
        let hasMore = true;
        let lastId = 0;
        
        while (hasMore) {
            const { data, error } = await supabase
                .from('words_db')
                .select('*')
                .order('id', { ascending: true })
                .gt('id', lastId)
                .limit(1000);

            if (error) {
                throw error;
            }

            if (data && data.length > 0) {
                allData = [...allData, ...data];
                lastId = data[data.length - 1].id;
            } else {
                hasMore = false;
            }
        }

        const lCounts: Record<string, number> = {};
        const iCounts: Record<string, number> = {};

        allData.forEach((row: any) => {
            const lang = row.ultimateOriginLanguage || row.originLanguage || 'Bilinmiyor';
            lCounts[lang] = (lCounts[lang] || 0) + 1;

            const immLang = row.immediateLanguage || 'Bilinmiyor';
            iCounts[immLang] = (iCounts[immLang] || 0) + 1;
        });

        const processStats = (countsMap: Record<string, number>) => {
            let processed: Record<string, number> = { 'Diğer': 0 };
            for (const [lang, count] of Object.entries(countsMap)) {
                if (count < 5 && lang !== 'Bilinmiyor') {
                    processed['Diğer'] += count;
                } else {
                    processed[lang] = count;
                }
            }
            if (processed['Diğer'] === 0) delete processed['Diğer'];
            
            return Object.entries(processed)
                .map(([label, value]) => ({ label, value }))
                .sort((a, b) => {
                    if (a.label === 'Bilinmiyor') return 1;
                    if (b.label === 'Bilinmiyor') return -1;
                    if (a.label === 'Diğer') return 1;
                    if (b.label === 'Diğer') return -1;
                    return b.value - a.value;
                });
        };

        const sortedLangs = processStats(lCounts);
        const sortedImmediateLangs = processStats(iCounts);

        const { error: upsertError } = await supabase
            .from('cached_stats')
            .upsert({
                id: 1,
                lang_stats: sortedLangs,
                immediate_lang_stats: sortedImmediateLangs,
                updated_at: new Date().toISOString()
            });

        if (upsertError) {
            throw upsertError;
        }

        res.status(200).json({ 
            success: true, 
            message: `Stats cached successfully! Analyzed ${allData.length} records.`,
            stats: { langs: sortedLangs.length, immediateLangs: sortedImmediateLangs.length }
        });
    } catch (error: any) {
        console.error('Error computing stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
