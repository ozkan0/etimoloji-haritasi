import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { word } = req.query;

  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Word parameter is required and must be a string.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Internal server error. Missing GEMINI_API_KEY configuration.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Sen uzman bir etimologsun.
      Görev: Aşağıdaki Türkçe kelimenin köken aldığı dili tespit et.
      
      Kelime: "${word}"
      
      Kurallar:
      1. SADECE dilin adını Türkçe olarak yaz (Örn: "Almanca", "Arapça", "Farsça", "Fransızca", "Hırvatça", "Japonca", "Türkçe", "Yunanca", "Çekçe", "İngilizce", "İspanyolca", "İtalyanca").
      2. Noktalama işareti koyma.
      3. Cümle kurma.
      4. Eğer kelime anlamsızsa veya kökeni kesin olarak bilinmiyorsa sadece "Bilinmiyor" yaz.
      5. Cevap sadece bir kelime olmalı.
    `;

    const result = await model.generateContent(prompt);
    const originLanguage = result.response.text().trim();

    return res.status(200).json({ origin: originLanguage });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: `Internal server error: ${error.message || 'AI servisine ulaşılamadı.'}` });
  }
}