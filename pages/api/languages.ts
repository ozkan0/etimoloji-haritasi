import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    interface LanguageRow {
      originLanguage: string | null;
      immediateLanguage: string | null;
    }
    let allData: LanguageRow[] = [];
    let hasMore = true;
    let from = 0;
    
    while (hasMore) {
      const { data, error } = await supabase
        .from('words_db')
        .select('originLanguage, immediateLanguage')
        .range(from, from + 999);

      if (error) throw error;
      
      if (data && data.length > 0) {
        allData = allData.concat(data as LanguageRow[]);
        from += 1000;
        if (data.length < 1000) hasMore = false;
      } else {
        hasMore = false;
      }
    }

    const originSet = new Set<string>();
    const immediateSet = new Set<string>();

    allData.forEach((row) => {
      const origin = row.originLanguage;
      const immediate = row.immediateLanguage;

      if (origin && origin !== 'Bilinmiyor') originSet.add(origin.trim());
      if (immediate && immediate !== 'Bilinmiyor') immediateSet.add(immediate.trim());
    });

    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200');

    return res.status(200).json({
      origins: Array.from(originSet).sort((a, b) => a.localeCompare(b, 'tr')),
      immediates: Array.from(immediateSet).sort((a, b) => a.localeCompare(b, 'tr')),
    });
  } catch (error) {
    console.error('Error fetching distinct languages:', error);
    const message = error instanceof Error ? error.message : 'Error fetching languages';
    return res.status(500).json({ error: `Internal server error: ${message}` });
  }
}
