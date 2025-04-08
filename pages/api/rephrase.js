import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { text, tone } = req.body;

  const prompt = `다음 문장을 같은 의미로, 더 ${tone}하게 다시 표현해줘. 단, 문장 구조나 단어를 바꿔 새로운 느낌을 주도록 노력해줘:\n"${text}"`;


  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 150,
    });

    const result = completion.choices[0].message.content.trim();
    res.status(200).json({ rephrased: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Rephrasing failed" });
  }
}
