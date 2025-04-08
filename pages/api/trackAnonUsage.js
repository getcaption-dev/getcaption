// ✅ 익명 사용자 사용 기록 저장 API
// - 클라이언트의 IP를 기준으로 Supabase anonymous_usage 테이블에 insert
// - 하루 최대 5회 제한을 위한 기록용

import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  // POST 메서드만 허용
  if (req.method !== 'POST') return res.status(405).end();

  // 클라이언트 IP 추출: 프록시 환경 대비 x-forwarded-for 우선 사용
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    '127.0.0.1';

  console.log('✅ trackAnonUsage API 호출됨');
  console.log('📡 익명 사용자 IP:', ip);

  try {
    // Supabase insert 요청: anonymous_usage 테이블에 IP 기록
    const { error } = await supabase.from('anonymous_usage').insert([
      {
        ip_address: ip,
        created_at: new Date().toISOString(), // 명시적 삽입
      },
    ]);

    if (error) {
      // Supabase 내부 오류 응답
      console.error('❌ Supabase insert 실패:', error);
      return res.status(500).json({ error: '익명 사용 기록 실패', detail: error.message });
    }

    // 정상 기록 완료 시 success 응답
    return res.status(200).json({ success: true });
  } catch (err) {
    // 예상치 못한 예외 발생 시
    console.error('🔥 예외 발생:', err);
    return res.status(500).json({ error: '예외 발생', detail: err.message });
  }
}