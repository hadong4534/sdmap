"use client";

import Link from "next/link";

// 로그인 / 회원가입 화면
export default function Login() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-7 bg-surface">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <div className="w-[74px] h-[74px] rounded-3xl bg-brand-grad flex items-center justify-center text-white text-3xl shadow-soft">
          ♥
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-ink">스드맵</h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          결혼 준비의 시작과 끝,
          <br />
          스드메·웨딩홀을 한 곳에서
        </p>

        <div className="mt-9 w-full space-y-3">
          <button className="w-full h-[50px] rounded-xl bg-[#FEE500] text-[#3A1D1D] font-extrabold text-sm flex items-center justify-center gap-2">
            <span>💬</span> 카카오로 3초 시작하기
          </button>
          <button className="w-full h-[50px] rounded-xl bg-brand-grad text-white font-extrabold text-sm shadow-soft">
            휴대폰 번호로 시작
          </button>
          <Link
            href="/home"
            className="w-full h-[50px] rounded-xl bg-white border border-line text-body font-bold text-sm flex items-center justify-center"
          >
            먼저 둘러보기
          </Link>
        </div>

        <p className="mt-5 text-[11px] text-muted leading-relaxed">
          가입 시 이용약관 및 개인정보 처리방침에
          <br />
          동의하는 것으로 간주됩니다.
        </p>
      </div>
    </main>
  );
}
