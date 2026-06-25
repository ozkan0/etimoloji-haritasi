import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '../../lib/supabaseClient';
import { normalizeTurkish } from '../../utils/normalizeTurkish';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { word } = req.query;

  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Word parameter is required and must be a string.' });
  }

  const normalizedWord = normalizeTurkish(word);

  const userKey = req.headers['x-gemini-key'];
  const usingUserKey = typeof userKey === 'string' && userKey.trim().length > 0;

  try {
    const { data: cached } = await supabase
      .from('word_cache')
      .select('ai_details')
      .eq('word', normalizedWord)
      .single();

    if (cached && cached.ai_details) {
      return res.status(200).json({ details: cached.ai_details });
    }

    const apiKey = (usingUserKey ? (userKey as string).trim() : '') || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({
        error: 'Sunucuda API anahtarı tanımlı değil. Ayarlardan kendi Gemini anahtarınızı girerek deneyebilirsiniz.',
        code: 'NO_API_KEY',
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
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

  } catch (error: any) {
    console.error('Gemini API Error:', error);

    const status: number | undefined = error?.status;
    const reason: string | undefined = Array.isArray(error?.errorDetails)
      ? error.errorDetails.find((d: any) => d?.reason)?.reason
      : undefined;
    const rawMessage: string = error?.message || '';

    const keySource = usingUserKey ? 'Girdiğiniz API anahtarı' : 'Sunucu API anahtarı';

    if (/api key expired/i.test(rawMessage)) {
      return res.status(401).json({
        error: `${keySource} süresi dolmuş. Lütfen anahtarı yenileyin.`,
        code: 'API_KEY_EXPIRED',
      });
    }

    if (reason === 'API_KEY_INVALID' || /api key not valid/i.test(rawMessage)) {
      return res.status(401).json({
        error: `${keySource} geçersiz veya süresi dolmuş. Lütfen anahtarı kontrol edin.`,
        code: 'API_KEY_INVALID',
      });
    }

    if (reason === 'PERMISSION_DENIED' || status === 403) {
      return res.status(403).json({
        error: `${keySource} bu işlem için yetkili değil. Anahtarın Gemini API erişimini kontrol edin.`,
        code: 'PERMISSION_DENIED',
      });
    }

    if (reason === 'RESOURCE_EXHAUSTED' || status === 429 || /quota|rate limit/i.test(rawMessage)) {
      return res.status(429).json({
        error: usingUserKey
          ? 'API anahtarınızın kullanım limitine ulaşıldı. Kotanızı kontrol edin veya bir süre sonra tekrar deneyin.'
          : 'Sunucunun kullanım limitine ulaşıldı. Kendi API anahtarınızı girerek devam edebilir veya sonra tekrar deneyebilirsiniz.',
        code: 'RATE_LIMIT',
      });
    }

    return res.status(502).json({
      error: 'AI analizi şu anda yapılamadı. Lütfen biraz sonra tekrar deneyin.',
      code: 'AI_ERROR',
    });
  }
}