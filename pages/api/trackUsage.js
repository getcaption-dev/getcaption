// ✅ 로그인 사용자의 문구 생성 요청 기록 API
// - Supabase의 caption_usage 테이블에 user_id 기반 insert
// - 하루 5회 생성 제한을 위한 사용량 추적에 활용됨

import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  // POST 메서드만 허용
  if (req.method !== 'POST') return res.status(405).end();

  // 로그인된 사용자 세션 확인
  const session = await getServerSession(req, res, authOptions);
  console.log('[trackUsage] session:', session); 
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  // Supabase에 사용자 생성 요청 기록 insert
  const { data, error } = await supabase
    .from('caption_usage')
    .insert([{ user_id: session.user.id }]);

  if (error) {
    console.error(error);
    return res.status(500).json({ error: '기록 저장 실패' });
  }

  // 성공 응답
  return res.status(200).json({ success: true });
}