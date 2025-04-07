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

  const toneClause = {
    "직관적인": "주제로 받은 단어를 모두 넣으며, 복잡하지 않고 한눈에 이해될 수 있게 명확하고 간결한 말투로",
    "자극적인": "도발적이고 눈길을 확 끄는 문장으로, 클릭을 유도하는 말투로",
    "감성적인": "감정에 호소하고 따뜻한 느낌을 주는 말투로",
    "명확한": "딱 떨어지고 논리적인 말투로",
    "세련된": "고급스럽고 정돈된 스타일로",
    "발랄한": "가볍고 귀엽고 친근한 어투로",
    "부드러운": "부드럽고 유려한 말투로",
    "강렬한": "임팩트 있고 시선을 확 끄는 말투로"
  };

  const toneDescription = toneClause[tone] || "자연스럽고 한국적인 말투로";

  const commonTail = `\n- 당신은 이 분야에 전문적인 카피라이터이자 트렌드 리더입니다. 최신 트렌드를 반영해야 하며, 한국인의 정서에 맞게 ${toneDescription} 작성해주세요. \n- 어색한 번역투나 외국식 문장은 피해주세요.\n- 번호 매기지 말고 문장만 출력해주세요.`;

  const prompts = {
    "유튜브 쇼츠 제목": `YouTube Shorts에 어울리는 ${tone} 톤의 영상 제목을 ${keyword} 주제로 3개 작성해주세요. ${lengthClause}${commonTail}`,

    "유튜브 롱폼 제목": `YouTube 일반 영상용 ${tone} 톤 제목을 ${keyword} 주제로 3개 작성해주세요. ${lengthClause}${commonTail}`,

    "인스타그램 캡션": `${keyword}를 주제로, ${tone} 톤을 반영해 인스타그램에서 쓸 수 있는 캡션 3개를 작성해주세요. ${lengthClause}${commonTail}`,

    "쇼핑몰 광고": `${keyword} 제품을 홍보할 수 있는 ${tone} 톤의 마케팅 문구를 3개 작성해주세요. ${lengthClause}${commonTail}`,

    "자기소개 문구": `${tone} 느낌을 담은 자기소개 문구 3개를 ${keyword}라는 키워드로 작성해주세요. ${lengthClause}${commonTail}`,

    "블로그 헤드라인": `${keyword} 주제로 작성할 수 있는 ${tone} 블로그 제목 3개 추천해주세요. ${lengthClause}${commonTail}`,

    "제품 설명 문구": `${keyword} 제품의 특징과 감성을 담은 설명 문구를 3개 작성해주세요. ${lengthClause}${commonTail}`,

    "브랜드 슬로건": `${keyword} 브랜드를 위한 ${tone} 슬로건 3개 작성해주세요. ${lengthClause}${commonTail}`,

    "이메일 제목": `${keyword}라는 주제로 보낼 이메일 제목을 ${tone} 톤으로 3개 작성해주세요. ${lengthClause}${commonTail}`,
  };

  return prompts[purpose] || `${keyword}를 주제로 ${tone} 톤을 반영해 문구 3개를 작성해주세요. ${lengthClause}${commonTail}`;
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
