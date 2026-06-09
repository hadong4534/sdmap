import OpenAI from "openai";
export const runtime = "nodejs";
export async function POST(req) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "OPENAI_API_KEY 미설정" }, { status: 500 });
  const { vendor } = await req.json().catch(() => ({}));
  if (!vendor) return Response.json({ error: "vendor 필요" }, { status: 400 });
  const openai = new OpenAI({ apiKey: key });
  try {
    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      max_tokens: 500,
      messages: [
        { role: "system", content: "너는 결혼 준비 업체 분석가다. JSON으로만 답한다." },
        { role: "user", content: `다음 업체 데이터를 보고 예비부부에게 도움이 되는 핵심 요약 4줄과 위험 코멘트를 JSON으로 답해. {"lines":["",""]}\n데이터: ${JSON.stringify(vendor)}` },
      ],
    });
    return Response.json({ ok: true, data: JSON.parse(r.choices[0].message.content || "{}") });
  } catch (e) {
    return Response.json({ error: e?.message || "fail" }, { status: 500 });
  }
}
