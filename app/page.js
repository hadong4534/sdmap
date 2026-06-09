"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 인트로 스플래시: 로고 1.8초 노출 후 로그인으로 이동
export default function Splash() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setLeaving(true), 1500);
    const go = setTimeout(() => router.push("/login"), 1900);
    return () => {
      clearTimeout(fade);
      clearTimeout(go);
    };
  }, [router]);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-brand-glow text-white relative overflow-hidden transition-opacity duration-500"
      style={{ opacity: leaving ? 0 : 1 }}
    >
      <div className="absolute w-[420px] h-[420px] rounded-full border border-white/15 -top-24 -right-24" />
      <div className="absolute w-[300px] h-[300px] rounded-full border border-white/10 bottom-10 -left-16" />

      <div className="w-[88px] h-[88px] rounded-[28px] bg-white flex items-center justify-center shadow-2xl">
        <span className="text-[38px] text-brand-500">♥</span>
      </div>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight">스드맵</h1>
      <p className="mt-2 text-sm tracking-[3px] text-white/85">STUDIO · DRESS · MAKE-UP MAP</p>
    </main>
  );
}
