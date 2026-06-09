import { createClient } from "@supabase/supabase-js";
export const runtime = "nodejs";

const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || "sEEZUV6Af91nPvG1EmGo";

export async function GET(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";
  if (!code) return Response.redirect(`${origin}/login?e=naver_no_code`, 302);

  const secret = process.env.NAVER_CLIENT_SECRET;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaSecret = process.env.SUPABASE_SECRET_KEY;
  if (!secret || !supaUrl || !supaSecret) {
    return Response.redirect(`${origin}/login?e=naver_env`, 302);
  }

  // 1) code -> access_token
  const tokenUrl = `https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=${NAVER_CLIENT_ID}&client_secret=${secret}&code=${code}&state=${encodeURIComponent(state)}`;
  const tRes = await fetch(tokenUrl);
  const tJson = await tRes.json().catch(() => ({}));
  if (!tJson.access_token) return Response.redirect(`${origin}/login?e=naver_token`, 302);

  // 2) access_token -> profile
  const pRes = await fetch("https://openapi.naver.com/v1/nid/me", {
    headers: { Authorization: `Bearer ${tJson.access_token}` },
  });
  const pJson = await pRes.json().catch(() => ({}));
  const p = pJson.response;
  if (!p || !p.id) return Response.redirect(`${origin}/login?e=naver_profile`, 302);

  const email = p.email || `naver_${p.id}@naver.sdmap.app`;
  const name = p.name || p.nickname || "네이버회원";

  // 3) Supabase 사용자 생성/확인 (서버 비밀키)
  const admin = createClient(supaUrl, supaSecret, { auth: { autoRefreshToken: false, persistSession: false } });
  await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name, provider: "naver", naver_id: p.id, profile_image: p.profile_image || null },
  }).catch(() => {});

  // 4) 매직링크 토큰 발급 -> 클라이언트에서 세션 생성
  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = data && data.properties ? data.properties.hashed_token : null;
  if (error || !tokenHash) return Response.redirect(`${origin}/login?e=naver_link`, 302);

  return Response.redirect(`${origin}/auth/naver#token_hash=${encodeURIComponent(tokenHash)}`, 302);
}
