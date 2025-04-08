// ✅ 로그인 사용자의 하루 사용량 조회 API
// - Supabase 'caption_usage' 테이블에서 user_id 기준으로 오늘 생성 횟수를 조회해 제한에 사용

import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  // GET 요청만 허용
  if (req.method !== 'GET') return res.status(405).end();

  // 세션(로그인 유저) 정보 추출
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  // 오늘 날짜만 추출 (형식: YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // Supabase 쿼리: caption_usage 테이블에서 user_id + 오늘 날짜 기준 생성 횟수 조회
  const { data, count, error } = await supabase
    .from('caption_usage')
    .select('*', { count: 'exact', head: true }) // head: true → 데이터는 생략하고 count만 반환
    .eq('user_id', session.user.id)
    .gte('created_at', `${today}T00:00:00+09:00`)
    .lte('created_at', `${today}T23:59:59+09:00`);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: '조회 실패' });
  }

  // 생성 횟수 반환
  return res.status(200).json({ count });
}