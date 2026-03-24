import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { eventType, eventData, userAgent } = req.body;

  if (!eventType) {
    return res.status(400).json({ message: 'Missing eventType' });
  }

  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(/, /)[0] : req.socket.remoteAddress || 'unknown';

  const today = new Date().toISOString().split('T')[0];
  const secureSalt = process.env.NEXT_PUBLIC_SUPABASE_URL || 'salt';
  const sessionId = crypto.createHash('sha256').update(`${ip}-${userAgent}-${today}-${secureSalt}`).digest('hex').substring(0, 16);

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert([
        {
          event_type: eventType,
          event_data: eventData || {},
          session_id: sessionId,
          user_agent: userAgent,
        },
      ]);

    if (error) {
      console.error('Analytics Insert Error:', error);
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Analytics Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
