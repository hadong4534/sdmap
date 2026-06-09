import crypto from "crypto";
export const runtime = "nodejs";

export async function POST(req) {
  const { phone, code, token } = await req.json().catch(() => ({}));
  const secret = process.env.SOLAPI_API_SECRET;
  if (!secret) return Response.json({ ok: false, error: "SMS 미설정" }, { status: 500 });
  if (!phone || !code || !token) return Response.json({ ok: false, error: "입력 누락" }, { status: 400 });

  const to = phone.replace(/[^0-9]/g, "");
  const [expStr, sig] = String(token).split(".");
  const exp = parseInt(expStr, 10);
  if (!exp || Date.now() > exp) return Response.json({ ok: false, error: "인증시간이 만료됐어요. 다시 받아주세요." }, { status: 400 });

  const expect = crypto.createHmac("sha256", secret).update(`${to}|${code}|${exp}`).digest("hex");
  if (sig !== expect) return Response.json({ ok: false, error: "인증번호가 일치하지 않아요." }, { status: 400 });
  return Response.json({ ok: true });
}
