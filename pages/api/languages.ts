import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    let allData: any[] = [];
    let hasMore = true;
    let from = 0;
    
    while (hasMore) {
      const { data, error } = await supabase
        .from('words_db')
        .select('originLanguage, immediateLanguage')
        .range(from, from + 999);

      if (error) throw error;
      
      if (data && data.length > 0) {
        allData = allData.concat(data);
        from += 1000;
        if (data.length < 1000) hasMore = false;
      } else {
        hasMore = false;
      }
    }

    const originSet = new Set<string>();
    const immediateSet = new Set<string>();

    allData.forEach((row: any) => {
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
  } catch (error: any) {
    console.error('Error fetching distinct languages:', error);
    return res.status(500).json({ error: error.message });
  }
}
