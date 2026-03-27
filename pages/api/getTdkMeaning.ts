import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';
import { normalizeTurkish } from '../../utils/normalizeTurkish';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { word } = req.query;

  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Kelime parametresi eksik.' });
  }

  const normalizedWord = normalizeTurkish(word);

  try {
    const { data: cached } = await supabase
      .from('word_cache')
      .select('tdk_meaning, tdk_example')
      .eq('word', normalizedWord)
      .single();

    if (cached && cached.tdk_meaning) {
      let meanings = [];
      try {
        const parsed = JSON.parse(cached.tdk_meaning);
        if (Array.isArray(parsed)) {
          meanings = parsed;
        } else {
          meanings = [{ text: cached.tdk_meaning }];
        }
      } catch (e) {
        meanings = [{ text: cached.tdk_meaning }];
      }
      return res.status(200).json({ meanings, example: cached.tdk_example });
    }

    const tdkUrl = `https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`;

    const response = await fetch(tdkUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://sozluk.gov.tr/',
        'Connection': 'keep-alive'
      }
    });

    if (!response.ok) {
      throw new Error(`TDK Sunucu Hatası: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const firstEntry = data[0];

      let meanings: any[] = [];
      let example = null;

      if (firstEntry.anlamlarListe && firstEntry.anlamlarListe.length > 0) {
        for (const anlam of firstEntry.anlamlarListe) {
          let typeStr = '';
          if (anlam.ozelliklerListe && anlam.ozelliklerListe.length > 0) {
            typeStr = anlam.ozelliklerListe.map((oz: any) => oz.tam_adi).join(', ');
          }
          meanings.push({ type: typeStr, text: anlam.anlam });

          if (!example && anlam.orneklerListe && Array.isArray(anlam.orneklerListe) && anlam.orneklerListe.length > 0) {
            const candidate = anlam.orneklerListe[0].ornek;
            if (candidate && candidate.trim() !== '') {
              example = candidate;
            }
          }
        }
      }

      if (meanings.length === 0) {
        meanings.push({ text: 'Anlam bulunamadı.' });
      }

      if (meanings[0].text !== 'Anlam bulunamadı.') {
        await supabase.from('word_cache').upsert({
          word: normalizedWord,
          tdk_meaning: JSON.stringify(meanings),
          tdk_example: example,
          updated_at: new Date().toISOString()
        });
      }

      return res.status(200).json({ meanings, example });
    }

    return res.status(404).json({ meanings: [{ text: 'TDK sözlüğünde kayıt bulunamadı.' }], example: null });

  } catch (error) {
    console.error('TDK API Proxy Hatası:', error);
    return res.status(500).json({ meanings: [{ text: 'Bağlantı hatası.' }], example: null });
  }
}