// pages/api/checkUsage.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const today = new Date().toISOString().split('T')[0];

  const { data, count, error } = await supabase
    .from('caption_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .gte('created_at', `${today}T00:00:00+09:00`)
    .lte('created_at', `${today}T23:59:59+09:00`);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: '조회 실패' });
  }

  return res.status(200).json({ count });
}