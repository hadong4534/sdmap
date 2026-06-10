import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";

// 입점 연결코드 SMS 발송 — 입점관리자 이상만 호출 가능
export async function POST(req) {
  const { phone, code, vendorName } = await req.json().catch(() => ({}));
  const authHeader = req.headers.get("authorization") || "";
  if (!phone || !code) return Response.json({ error: "phone, code가 필요합니다." }, { status: 400 });

  // 호출자 권한 확인 (사용자 JWT로 본인 프로필 조회)
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user } } = await supa.auth.getUser(authHeader.replace("Bearer ", ""));
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { data: prof } = await supa.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!prof || !["admin", "manager"].includes(prof.role)) return Response.json({ error: "권한이 없습니다." }, { status: 403 });

  const key = process.env.SOLAPI_API_KEY, secret = process.env.SOLAPI_API_SECRET;
  const from = (process.env.SOLAPI_SENDER || "").replace(/[^0-9]/g, "");
  if (!key || !secret || !from) return Response.json({ error: "SMS 환경변수(SOLAPI_*) 미설정 — 코드를 수동으로 전달해주세요." }, { status: 500 });

  const to = phone.replace(/[^0-9]/g, "");
  const text = `[스드맵] ${vendorName || "입점 업체"} 연결코드는 [${code}] 입니다. 스드맵 가입 후 마이 > 업체 대시보드에서 입력해 주세요.`;
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(32).toString("hex");
  const signature = crypto.createHmac("sha256", secret).update(date + salt).digest("hex");
  const res = await fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: { Authorization: `HMAC-SHA256 apiKey=${key}, date=${date}, salt=${salt}, signature=${signature}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: { to, from, text } }),
  });
  if (!res.ok) return Response.json({ error: "문자 발송 실패 — 코드를 수동으로 전달해주세요." }, { status: 500 });
  return Response.json({ ok: true });
}
