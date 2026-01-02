import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { word } = req.query;

  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Kelime parametresi eksik.' });
  }

  try {
    const agent = new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true
    });

    const tdkUrl = `https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`;
    
    const response = await fetch(tdkUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://sozluk.gov.tr/',
        'Connection': 'keep-alive'
      },
      // @ts-ignore
      agent: agent 
    });
    
    if (!response.ok) {
        throw new Error(`TDK Sunucu Hatası: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const firstEntry = data[0];
      
      let meaning = 'Anlam bulunamadı.';
      let example = null; 

      if (firstEntry.anlamlarListe && firstEntry.anlamlarListe.length > 0) {
        meaning = firstEntry.anlamlarListe[0].anlam;

        for (const anlam of firstEntry.anlamlarListe) {
            if (anlam.orneklerListe && Array.isArray(anlam.orneklerListe) && anlam.orneklerListe.length > 0) {
                const candidate = anlam.orneklerListe[0].ornek;
                
                if (candidate && candidate.trim() !== '') {
                    example = candidate;
                    break; 
                }
            }
        }
      }

      return res.status(200).json({ meaning, example });
    }

    return res.status(404).json({ meaning: 'TDK sözlüğünde kayıt bulunamadı.', example: null });

  } catch (error) {
    console.error('TDK API Proxy Hatası:', error);
    return res.status(500).json({ meaning: 'Bağlantı hatası.', example: null });
  }
}