import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { word } = req.query;

  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'A "word" query parameter is required.' });
  }

  try {
    // We fetch directly from the official TDK endpoint
    // This removes the need for 'tdk-all-api' and fixes the axios security issues
    const response = await fetch(`https://sozluk.gov.tr/gts?ara=${encodeURIComponent(word)}`);
    
    // TDK returns JSON, but sometimes the content-type header is missing or plain text
    // so we handle the parsing carefully
    const data = await response.json();

    // Check if we got a valid array (TDK standard response for found words)
    if (Array.isArray(data) && data.length > 0) {
      // The data structure is: [ { anlamlarListe: [ { anlam: "..." } ] } ]
      const firstEntry = data[0];
      
      // Safety check for 'anlamlarListe'
      if (firstEntry.anlamlarListe && firstEntry.anlamlarListe.length > 0) {
        const firstMeaning = firstEntry.anlamlarListe[0].anlam;
        return res.status(200).json({ meaning: firstMeaning });
      }
    }

    // If data is not an array or has no meanings
    return res.status(404).json({ meaning: 'TDK sözlüğünde anlam bulunamadı.' });

  } catch (error) {
    console.error('TDK API Error:', error);
    return res.status(500).json({ error: 'TDK API\'sinden veri alınamadı.' });
  }
}