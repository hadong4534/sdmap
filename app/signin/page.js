"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";

const field = "w-full h-12 rounded-xl border border-line px-3.5 text-sm outline-none focus:border-brand-400 bg-white";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function login() {
    setMsg("");
    if (!isSupabaseReady || !supabase) return setMsg("로그인 설정 준비 중이에요.");
    if (!email || !pw) return setMsg("이메일과 비밀번호를 입력해 주세요.");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    setBusy(false);
    if (error) return setMsg("로그인 실패: " + error.message);
    router.push("/home");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-7 bg-surface">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo_full.png" alt="스드맵" className="w-36 h-auto" />
        <h1 className="text-xl font-extrabold mt-4 mb-6">로그인</h1>
        <div className="w-full space-y-3 text-left">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일 (아이디)" className={field} />
          <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="비밀번호" className={field} />
          <button onClick={login} disabled={busy} className="w-full h-[52px] rounded-xl bg-brand-grad text-white font-extrabold text-sm shadow-soft disabled:opacity-60">
            {busy ? "로그인 중..." : "로그인"}
          </button>
        </div>
        {msg && <p className="mt-4 text-[12px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{msg}</p>}
        <p className="mt-6 text-[13px] text-muted">아직 회원이 아니세요? <Link href="/signup" className="text-brand-700 font-bold">회원가입</Link></p>
        <Link href="/login" className="block text-muted text-[13px] font-bold mt-3">← 간편가입으로</Link>
      </div>
    </main>
  );
}
