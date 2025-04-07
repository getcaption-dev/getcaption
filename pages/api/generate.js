// ✅ getcaption/pages/api/generate.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getPromptByPurpose = (purpose, keyword, tone, length) => {
  const lengthClause =
    length === "짧게"
      ? "각 문장은 15자 이상 25자 이하로 작성해주세요."
      : "각 문장은 25자 이상 45자 이하로 작성해주세요.";

  const commonTail = `\n- 당신은 이 분야에 전문적인 카피라이터입니다. 한국인의 정서에 맞도록 자연스럽게 작성해주세요.\n- 어색한 번역투나 외국식 문장은 피해주세요.\n- 번호 매기지 말고 문장만 출력해주세요.`;

  const prompts = {
    "유튜브 숏츠 제목": `YouTube Shorts에 어울리는 ${tone} 톤의 영상 제목을 ${keyword} 주제로 3개 작성해주세요. 시선을 끄는 말투로, ${lengthClause}${commonTail}`,

    "유튜브 제목": `YouTube 일반 영상용 ${tone} 톤 제목을 ${keyword} 주제로 3개 작성해주세요. 실제 유튜버가 쓸 수 있는 말투로 ${lengthClause}${commonTail}`,

    "인스타그램 캡션": `${keyword}를 주제로, ${tone} 톤을 반영해 인스타그램에서 쓸 수 있는 감성 캡션 3개를 작성해주세요. 너무 과하거나 번역투 말고, 일상에서 공감할 수 있는 말투로. ${lengthClause}${commonTail}`,

    "쇼핑몰 광고": `${keyword} 제품을 홍보할 수 있는 ${tone} 톤의 마케팅 문구를 3개 작성해주세요. 문장은 감성적이고 자연스럽게, 실제 구매를 유도할 수 있어야 하며, ${lengthClause}${commonTail}`,

    "자기소개 문구": `${tone} 느낌을 담은 자기소개 문구 3개를 ${keyword}라는 키워드로 작성해주세요. 깔끔하고 인상 깊게, 그리고 부드러운 어투로. ${lengthClause}${commonTail}`,

    "블로그 헤드라인": `${keyword} 주제로 작성할 수 있는 ${tone} 블로그 제목 3개 추천해주세요. 제목은 ${lengthClause}${commonTail}`,

    "제품 설명 문구": `${keyword} 제품의 특징과 감성을 담은 설명 문구를 3개 작성해주세요. ${tone} 톤을 반영해 진짜 쇼핑몰에 올릴 수 있을 정도로 자연스럽게. ${lengthClause}${commonTail}`,

    "브랜드 슬로건": `${keyword} 브랜드를 위한 ${tone} 슬로건 3개 작성해주세요. 간결하고 인상 깊게, 진짜 브랜드처럼. ${lengthClause}${commonTail}`,

    "이메일 제목": `${keyword}라는 주제로 보낼 이메일 제목을 ${tone} 톤으로 3개 작성해주세요. 사람의 클릭을 유도하되, 광고 느낌은 피하고 자연스럽게. ${lengthClause}${commonTail}`,
  };

  return prompts[purpose] || `${keyword}를 주제로 ${tone} 감성을 담아 문구 3개를 작성해주세요. ${lengthClause}${commonTail}`;
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { keyword, tone, purpose, length } = req.body;
  const prompt = getPromptByPurpose(purpose, keyword, tone, length);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const text = completion.choices[0].message.content;
    const lines = text.trim().split('\n').filter(Boolean);

    res.status(200).json({ captions: lines });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI 생성 실패" });
  }
}
