"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);
const KakaoIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="#000000" aria-hidden><path d="M12 3C6.48 3 2 6.58 2 10.96c0 2.84 1.93 5.33 4.83 6.73-.21.74-.77 2.73-.88 3.15-.14.53.19.52.4.38.17-.11 2.68-1.82 3.76-2.56.6.09 1.23.13 1.89.13 5.52 0 10-3.58 10-7.96S17.52 3 12 3z"/></svg>);
const NaverIcon = () => (<svg width="14" height="14" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden><path d="M16.27 12.84 7.95 1H1v22h6.73V11.16L16.05 23H23V1h-6.73z"/></svg>);

const KAKAO_CLIENT_ID = "3a5653c45c10d757fa65b9e36d946b35";
const NAVER_CLIENT_ID = "sEEZUV6Af91nPvG1EmGo";

export default function Login() {
  const [msg, setMsg] = useState("");

  function kakaoLogin() {
    const r = encodeURIComponent(window.location.origin + "/api/auth/kakao/callback");
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${r}&response_type=code&scope=openid`;
  }
  function naverLogin() {
    const r = encodeURIComponent(window.location.origin + "/api/auth/naver/callback");
    const s = Math.random().toString(36).slice(2);
    window.location.href = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${r}&state=${s}`;
  }
  async function oauth(provider) {
    if (provider === "kakao") return kakaoLogin();
    if (provider === "naver") return naverLogin();
    if (!isSupabaseReady || !supabase) { setMsg("로그인 설정 준비 중이에요."); return; }
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin + "/home" } });
    if (error) setMsg(error.message);
  }

  return (
    <main className="h-[100dvh] flex flex-col items-center justify-center px-7 bg-surface overflow-hidden">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo_full.png" alt="스드맵" className="w-36 h-auto" />
        <p className="mt-3 text-[15px] font-bold text-ink">웨딩부터 신혼·출산까지, 한 곳에서</p>
        <p className="mt-1 text-[12px] text-muted">정찰제 비교 · 즉시예약 · 커플 위시리스트</p>

        <div className="w-full mt-6 space-y-2">
          <button onClick={() => oauth("kakao")} className="relative w-full h-12 rounded-xl bg-[#FEE500] text-[#191600] font-bold text-sm flex items-center justify-center">
            <span className="absolute left-4"><KakaoIcon /></span> 카카오로 시작하기
          </button>
          <button onClick={() => oauth("naver")} className="relative w-full h-12 rounded-xl bg-[#03C75A] text-white font-bold text-sm flex items-center justify-center">
            <span className="absolute left-4"><NaverIcon /></span> 네이버로 시작하기
          </button>
          <button onClick={() => oauth("google")} className="relative w-full h-12 rounded-xl bg-white border border-line text-[#1F1F1F] font-bold text-sm flex items-center justify-center">
            <span className="absolute left-4"><GoogleIcon /></span> Google로 시작하기
          </button>
        </div>

        <div className="flex items-center gap-3 w-full my-3 text-muted text-[11px]">
          <span className="flex-1 h-px bg-line" /> 또는 <span className="flex-1 h-px bg-line" />
        </div>

        <div className="w-full flex gap-2">
          <Link href="/signin" className="flex-1 h-11 rounded-xl bg-brand-grad text-white font-bold text-sm flex items-center justify-center">로그인</Link>
          <Link href="/signup" className="flex-1 h-11 rounded-xl bg-brand-50 text-brand-700 font-bold text-sm flex items-center justify-center">회원가입</Link>
        </div>

        <Link href="/home" className="text-muted text-[12px] font-bold mt-3">먼저 둘러보기</Link>
        {msg && <p className="mt-3 text-[12px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{msg}</p>}
      </div>
    </main>
  );
}
