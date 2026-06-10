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
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#F3EEFF]">
      {/* 백드롭: 모바일 세로 / PC 가로 — 화면 전체가 한 장의 이미지 */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/brand_v.jpg" alt="" className="absolute inset-0 w-full h-full object-cover md:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/brand_w.jpg" alt="" className="absolute inset-0 w-full h-full object-cover hidden md:block" />
      {/* 버튼 영역만 부드럽게 밝아지는 그라데이션 (경계 없는 화이트 페이드) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/35 to-white/85 md:bg-gradient-to-r md:from-transparent md:via-white/30 md:to-white/90" />

      <div className="relative z-10 min-h-[100dvh] flex flex-col md:flex-row">
        {/* 브랜드 카피 — 이미지 위에 직접 */}
        <div className="flex-1 flex flex-col justify-end md:justify-center px-8 pt-14 pb-6 md:pl-[7vw] md:pb-0">
          <div className="md:max-w-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo_full.png" alt="스드맵" className="w-36 md:w-52 h-auto" />
            <p className="mt-4 md:mt-6 text-[21px] md:text-[30px] font-extrabold leading-[1.35] text-ink tracking-tight">숨은 추가금까지,<br />계약 전에 미리 확인하세요</p>
            <p className="mt-2 text-[13px] md:text-[15px] font-bold text-[#7B748C]">예상 최종가 비교 · AI 견적 분석 · 커플 비교함</p>
          </div>
        </div>

        {/* 로그인 액션 — 시트/카드 없이 떠 있는 버튼 */}
        <div className="md:w-[420px] flex flex-col justify-start md:justify-center px-7 pb-12 md:pr-[6vw] md:pb-0">
          <div className="w-full max-w-sm mx-auto space-y-2.5">
            <button onClick={() => oauth("kakao")} className="relative w-full h-[52px] rounded-2xl bg-[#FEE500] text-[#191600] font-bold text-[15px] flex items-center justify-center shadow-[0_4px_18px_rgba(37,34,54,0.10)]">
              <span className="absolute left-5"><KakaoIcon /></span> 카카오로 시작하기
            </button>
            <button onClick={() => oauth("naver")} className="relative w-full h-[52px] rounded-2xl bg-[#03C75A] text-white font-bold text-[15px] flex items-center justify-center shadow-[0_4px_18px_rgba(37,34,54,0.10)]">
              <span className="absolute left-5"><NaverIcon /></span> 네이버로 시작하기
            </button>
            <button onClick={() => oauth("google")} className="relative w-full h-[52px] rounded-2xl bg-white text-[#1F1F1F] font-bold text-[15px] flex items-center justify-center shadow-[0_4px_18px_rgba(37,34,54,0.10)]">
              <span className="absolute left-5"><GoogleIcon /></span> Google로 시작하기
            </button>

            <div className="flex items-center gap-3 w-full pt-1.5 pb-0.5 text-[#7B748C] text-[11px]">
              <span className="flex-1 h-px bg-[#252236]/10" /> 또는 <span className="flex-1 h-px bg-[#252236]/10" />
            </div>

            <div className="w-full flex gap-2">
              <Link href="/signin" className="flex-1 h-11 rounded-2xl bg-brand-grad text-white font-bold text-sm flex items-center justify-center shadow-[0_4px_18px_rgba(139,111,232,0.25)]">로그인</Link>
              <Link href="/signup" className="flex-1 h-11 rounded-2xl bg-white/80 backdrop-blur text-brand-700 font-bold text-sm flex items-center justify-center">회원가입</Link>
            </div>

            <Link href="/home" className="block w-full text-center pt-3 text-[13.5px] font-bold text-[#564F6B] underline underline-offset-4 decoration-[#B7A6F0]">로그인 없이 둘러보기</Link>
            <Link href="/partner" className="block w-full text-center pt-1 text-[12px] font-bold text-[#7B748C]">사장님이신가요? 입점 신청하기</Link>
            {msg && <p className="mt-2 text-[12px] text-brand-700 bg-white/80 rounded-lg px-3 py-2">{msg}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
