// ✅ 익명 사용자 하루 사용량 조회 API
// - 클라이언트 IP 기준으로 Supabase 'anonymous_usage' 테이블에서
//   오늘 날짜 기준 사용 횟수를 조회해 5회 제한 체크에 사용됨

import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  // 허용된 메서드는 GET만
  if (req.method !== 'GET') return res.status(405).end();

  // 클라이언트 IP 주소 추출 (x-forwarded-for → 로컬 fallback)
  const ip =
  req.headers['x-forwarded-for']?.split(',')[0] ||
  req.connection?.remoteAddress ||
  req.socket?.remoteAddress;

  // IP가 없는 경우 잘못된 요청으로 처리
  if (!ip) return res.status(400).json({ error: 'IP 확인 실패' });

  console.log('✔ 익명 사용자의 IP:', ip); // 디버깅용

  // 오늘 날짜만 추출 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Supabase 쿼리: 오늘 날짜 기준 동일 IP 사용 기록 카운트
  const { count, error } = await supabase
    .from('anonymous_usage')
    .select('*', { count: 'exact', head: true }) // head: true → row 데이터 제외, count만 반환
    .eq('ip_address', ip)
    .gte('created_at', `${today}T00:00:00+09:00`) // 하루 시작
    .lte('created_at', `${today}T23:59:59+09:00`); // 하루 끝

  if (typeof count !== 'number') {
    console.error('❌ Supabase count가 유효하지 않음:', count);
    return res.status(500).json({ error: '조회 실패: count 없음' });
  }
  
  if (error) {
    console.error('익명 사용 조회 실패:', error);
    return res.status(500).json({ error: '조회 실패' });
  }
  // 카운트를 클라이언트에 전달
  res.status(200).json({ count });
}