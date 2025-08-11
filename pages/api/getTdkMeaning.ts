import type { NextApiRequest, NextApiResponse } from 'next';
const getWord = require('tdk-all-api');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { word } = req.query;

  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'A "word" query parameter is required.' });
  }

  try {
    const results = await getWord(word);
    
    const firstMeaning = results?.means?.[0]?.anlam || null;

    if (firstMeaning) {
      res.status(200).json({ meaning: firstMeaning });
    } else {
      res.status(404).json({ meaning: 'TDK sözlüğünde anlam bulunamadı.' });
    }
  } catch (error) {
    console.error('TDK API Error:', error);
    res.status(500).json({ error: 'TDK API\'sinden veri alınamadı.' });
  }
}
