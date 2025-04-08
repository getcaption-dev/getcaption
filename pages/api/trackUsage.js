// pages/api/trackUsage.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('caption_usage')
    .insert([{ user_id: session.user.id }]);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: '기록 저장 실패' });
  }

  return res.status(200).json({ success: true });
}