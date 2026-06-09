import OpenAI from "openai";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ error: "OPENAI_API_KEY가 설정되지 않았어요. Vercel 환경변수에 등록해 주세요." }, { status: 500 });
  const { image } = await req.json().catch(() => ({}));
  if (!image) return Response.json({ error: "견적서 이미지가 필요해요." }, { status: 400 });

  const openai = new OpenAI({ apiKey: key });
  try {
    const r = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      max_tokens: 1300,
      messages: [
        { role: "system", content: "너는 한국 결혼 준비(스드메·웨딩홀) 견적서 분석 전문가다. 사진 속 견적서를 분석해 반드시 JSON으로만 답한다." },
        { role: "user", content: [
          { type: "text", text: "이 견적서를 분석해서 아래 JSON 스키마로만 답해. 금액은 숫자(원)만. 모르면 0 또는 빈배열.\n{\"vendorName\":\"\",\"total\":0,\"extraEstimate\":0,\"riskScore\":0,\"includedItems\":[\"\"],\"missingItems\":[{\"name\":\"\",\"reason\":\"\"}],\"contractQuestions\":[\"\"],\"summary\":\"한 줄 요약\"}\nmissingItems는 원본비·헬퍼비·주말추가·야간·출장비 등 추가금이 붙을 가능성이 있는데 견적서에 명시 안 된 항목. riskScore는 추가금 위험 0~100." },
          { type: "image_url", image_url: { url: image } },
        ] },
      ],
    });
    const data = JSON.parse(r.choices[0].message.content || "{}");
    return Response.json({ ok: true, data });
  } catch (e) {
    return Response.json({ error: "분석 실패: " + (e?.message || "unknown") }, { status: 500 });
  }
}
