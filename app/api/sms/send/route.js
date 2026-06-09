import crypto from "crypto";
export const runtime = "nodejs";

export async function POST(req) {
  const { phone } = await req.json().catch(() => ({}));
  if (!phone) return Response.json({ error: "휴대폰 번호가 필요합니다." }, { status: 400 });

  const key = process.env.SOLAPI_API_KEY;
  const secret = process.env.SOLAPI_API_SECRET;
  const from = (process.env.SOLAPI_SENDER || "").replace(/[^0-9]/g, "");
  if (!key || !secret || !from)
    return Response.json({ error: "SMS 환경변수(SOLAPI_*)가 설정되지 않았습니다." }, { status: 500 });

  const to = phone.replace(/[^0-9]/g, "");
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const exp = Date.now() + 3 * 60 * 1000;
  const text = `[스드맵] 인증번호 [${code}] 를 입력해주세요. (3분 이내)`;

  const date = new Date().toISOString();
  const salt = crypto.randomBytes(32).toString("hex");
  const signature = crypto.createHmac("sha256", secret).update(date + salt).digest("hex");
  const auth = `HMAC-SHA256 apiKey=${key}, date=${date}, salt=${salt}, signature=${signature}`;

  const res = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ message: { to, from, text } }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return Response.json({ error: "문자 발송 실패", detail: data }, { status: 500 });

  const token = exp + "." + crypto.createHmac("sha256", secret).update(`${to}|${code}|${exp}`).digest("hex");
  return Response.json({ token });
}
