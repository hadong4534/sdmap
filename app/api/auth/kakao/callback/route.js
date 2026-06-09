export const runtime = "nodejs";

const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "3a5653c45c10d757fa65b9e36d946b35";

export async function GET(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  if (!code) return Response.redirect(`${origin}/login?e=kakao_no_code`, 302);

  const secret = process.env.KAKAO_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/kakao/callback`;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: KAKAO_CLIENT_ID,
    redirect_uri: redirectUri,
    code,
  });
  if (secret) body.set("client_secret", secret);

  const r = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body,
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.id_token) {
    return Response.redirect(`${origin}/login?e=kakao_token`, 302);
  }
  // id_token을 프래그먼트로 전달 → 클라이언트에서 Supabase 세션 생성
  return Response.redirect(`${origin}/auth/kakao#id_token=${encodeURIComponent(j.id_token)}`, 302);
}
