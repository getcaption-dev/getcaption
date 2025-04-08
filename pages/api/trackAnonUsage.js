import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    //'unknown';
    '127.0.0.1';

  console.log('✅ 익명 IP 주소:', ip); // ✅ 1단계 디버그

  try {
    const { error } = await supabase.from('anonymous_usage').insert([
      {
        ip_address: ip,
      },
    ]);

    if (error) {
      console.error('❌ Supabase insert 실패:', error); // ✅ 2단계 디버그
      return res.status(500).json({ error: '익명 사용 기록 실패', detail: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('🔥 예외 발생:', err); // ✅ 3단계 디버그
    return res.status(500).json({ error: '예외 발생', detail: err.message });
  }
}