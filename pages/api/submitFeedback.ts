import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { type, category, description, wordId, wordName, userAgent } = req.body;

  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(/, /)[0] : req.socket.remoteAddress;

  try {
    const { data, error } = await supabase
      .from('submissions')
      .insert([
        {
          type,
          category,
          description,
          word_id: wordId,
          word_name: wordName,
          user_ip: ip,
          user_agent: userAgent,
        },
      ]);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Feedback Error:', error);
    return res.status(500).json({ error: error.message });
  }
}