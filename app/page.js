"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 인트로: 여백형 브랜드 백드롭 위에 로고·카피가 직접 얹히는 구조 (박스 없음, 약 2초 자동 전환)
export default function Splash() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setLeaving(true), 1700);
    const go = setTimeout(() => router.push("/login"), 2100);
    return () => { clearTimeout(fade); clearTimeout(go); };
  }, [router]);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#F3EEFF] transition-opacity duration-500" style={{ opacity: leaving ? 0 : 1 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/brand_v.jpg" alt="" className="absolute inset-0 w-full h-full object-cover intro-zoom md:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/brand_w.jpg" alt="" className="absolute inset-0 w-full h-full object-cover intro-zoom hidden md:block" />

      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center pb-[16vh] md:pb-[8vh]">
        <div className="intro-rise flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo_full.png" alt="스드맵" className="w-56 md:w-80 max-w-[66vw] h-auto" />
          <p className="mt-4 md:mt-6 text-[17px] md:text-[25px] font-extrabold text-ink/90 tracking-tight">추가금까지 미리 아는 결혼 준비</p>
          <p className="mt-1.5 text-[12.5px] md:text-[15px] font-bold text-[#7B748C]">예상 최종가 비교 · AI 견적 분석 · 커플 비교함</p>
        </div>
      </div>

      {/* 하단 진행 점 */}
      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex gap-1.5 intro-rise">
        <span className="w-5 h-1.5 rounded-full bg-brand-400" /><span className="w-1.5 h-1.5 rounded-full bg-brand-200" />
      </div>
    </main>
  );
}
