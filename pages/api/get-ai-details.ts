import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../lib/supabaseClient';
import { normalizeTurkish } from '../../utils/normalizeTurkish';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { word } = req.query;

  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Word parameter is required' });
  }

  const normalizedWord = normalizeTurkish(word);

  try {
    const { data: cached } = await supabase
      .from('word_cache')
      .select('ai_details')
      .eq('word', normalizedWord)
      .single();

    if (cached && cached.ai_details) {
      return res.status(200).json({ details: cached.ai_details });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Sen uzman bir etimologsun.
      Görev: "${word}" kelimesinin detaylı etimolojik köken hikayesini anlat.
      
      Kurallar:
      1. Köken dili (asıl kökeninden itibaren türetilmeleri yolculuğu dahil), orijinal kelime hali ve orijinal anlamını belirt.
      2. Kelimenin tarihsel süreçte nasıl değiştiğini veya dilimize nasıl geçtiğini kısaca anlat.
      3. Varsa ilginç bir anekdot ekle.
      4. Maksimum 3-4 cümle olsun.
      5. Akademik ama akıcı bir Türkçe kullan.
      6. Markdown kullanma (bold vs yapma), düz metin ver.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    await supabase.from('word_cache').upsert({
      word: normalizedWord,
      ai_details: text,
      updated_at: new Date().toISOString()
    });

    res.status(200).json({ details: text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'AI analizi yapılamadı.' });
  }
}