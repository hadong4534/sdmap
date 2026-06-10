"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 인트로 스플래시: 시네마틱 이미지 + 로고/카피, 약 2초 후 자동 이동 (탭 불필요)
export default function Splash() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setLeaving(true), 1700);
    const go = setTimeout(() => router.push("/login"), 2100);
    return () => { clearTimeout(fade); clearTimeout(go); };
  }, [router]);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-brand-50 transition-opacity duration-500" style={{ opacity: leaving ? 0 : 1 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/intro.jpg" alt="" className="absolute inset-0 w-full h-full object-cover intro-zoom md:hidden" />
      <img src="/images/intro_wide.jpg" alt="" className="absolute inset-0 w-full h-full object-cover intro-zoom hidden md:block" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/5 to-white/40" />
      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center pb-[24vh]">
        <div className="intro-rise flex flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo_full.png" alt="스드맵" className="w-44 max-w-[55%] h-auto drop-shadow-[0_2px_16px_rgba(255,255,255,0.95)]" />
          <p className="mt-3 text-[15px] font-extrabold text-ink tracking-tight drop-shadow-[0_1px_10px_rgba(255,255,255,0.9)]">추가금까지 미리 아는 결혼 준비</p>
        </div>
      </div>
    </main>
  );
}
