"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function KakaoAuth() {
  const router = useRouter();
  const [msg, setMsg] = useState("카카오 로그인 처리 중...");

  useEffect(() => {
    (async () => {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const idToken = hash.get("id_token");
      if (!idToken) { setMsg("로그인 정보를 받지 못했어요. 다시 시도해 주세요."); return; }
      if (!supabase) { setMsg("로그인 설정 준비 중이에요."); return; }
      const { error } = await supabase.auth.signInWithIdToken({ provider: "kakao", token: idToken });
      if (error) { setMsg("로그인 실패: " + error.message); return; }
      router.replace("/home");
    })();
  }, [router]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo_icon.png" alt="스드맵" className="h-12 w-auto animate-pulse" />
      <p className="text-sm text-body">{msg}</p>
    </main>
  );
}
