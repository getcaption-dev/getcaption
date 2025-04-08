// pages/api/checkAnonUsage.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

  if (!ip) return res.status(400).json({ error: 'IP 확인 실패' });

  const today = new Date().toISOString().split('T')[0];

  const { count, error } = await supabase
    .from('anonymous_usage')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('created_at', `${today}T00:00:00+09:00`)
    .lte('created_at', `${today}T23:59:59+09:00`);

  if (error) {
    console.error('익명 사용 조회 실패:', error);
    return res.status(500).json({ error: '조회 실패' });
  }

  res.status(200).json({ count });
}
