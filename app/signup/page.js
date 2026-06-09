"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";

export default function Signup() {
  const router = useRouter();
  const [tab, setTab] = useState("email");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("method");
    if (m === "phone") setTab("phone");
  }, []);

  const guard = () => {
    if (!isSupabaseReady || !supabase) {
      setMsg("Supabase 환경변수를 먼저 설정해 주세요. (Vercel 환경변수)");
      return false;
    }
    return true;
  };

  async function sendOtp() {
    setMsg("");
    if (!guard()) return;
    if (!phone) return setMsg("휴대폰 번호를 입력해 주세요.");
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) });
    if (error) return setMsg("인증번호 발송 실패: " + error.message + " (SMS 설정 필요)");
    setSent(true);
    setMsg("인증번호를 발송했어요.");
  }

  async function verifyOtp() {
    setMsg("");
    if (!guard()) return;
    const { error } = await supabase.auth.verifyOtp({ phone: toE164(phone), token: code, type: "sms" });
    if (error) return setMsg("인증 실패: " + error.message);
    setVerified(true);
    setMsg("휴대폰 인증 완료!");
    if (tab === "phone") router.push("/home");
  }

  async function signupEmail() {
    setMsg("");
    if (!guard()) return;
    if (!verified) return setMsg("휴대폰 인증을 먼저 완료해 주세요. (필수)");
    if (!email || !pw) return setMsg("이메일과 비밀번호를 입력해 주세요.");
    const { error } = await supabase.auth.signUp({ email, password: pw });
    if (error) return setMsg("가입 실패: " + error.message);
    setMsg("가입 완료! 이메일 인증 후 로그인됩니다.");
    setTimeout(() => router.push("/home"), 1200);
  }

  const toE164 = (p) => {
    const d = p.replace(/[^0-9]/g, "");
    if (d.startsWith("0")) return "+82" + d.slice(1);
    if (d.startsWith("82")) return "+" + d;
    return "+82" + d;
  };

  const PhoneVerify = (
    <div className="space-y-2">
      <label className="text-[13px] font-bold text-ink">휴대폰 인증 <span className="text-rose">*필수</span></label>
      <div className="flex gap-2">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className="flex-1 h-12 rounded-xl border border-line px-3.5 text-sm outline-none focus:border-brand-400" />
        <button onClick={sendOtp} className="px-4 rounded-xl bg-brand-100 text-brand-700 font-bold text-[13px] whitespace-nowrap">인증번호 받기</button>
      </div>
      {sent && (
        <div className="flex gap-2">
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="인증번호 6자리" className="flex-1 h-12 rounded-xl border border-line px-3.5 text-sm outline-none focus:border-brand-400" />
          <button onClick={verifyOtp} className="px-4 rounded-xl bg-brand-grad text-white font-bold text-[13px] whitespace-nowrap">확인</button>
        </div>
      )}
      {verified && <p className="text-[12px] text-ok font-bold">✓ 인증 완료</p>}
    </div>
  );

  return (
    <main className="min-h-screen bg-surface px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo_full.png" alt="스드맵" className="w-32 h-auto mx-auto" />
        <h1 className="text-xl font-extrabold text-center mt-4 mb-6">회원가입 · 로그인</h1>

        <div className="flex bg-brand-50 rounded-xl p-1 mb-6">
          <button onClick={() => setTab("email")} className={`flex-1 h-10 rounded-lg text-[13px] font-bold ${tab === "email" ? "bg-white text-brand-700 shadow" : "text-muted"}`}>이메일(아이디)</button>
          <button onClick={() => setTab("phone")} className={`flex-1 h-10 rounded-lg text-[13px] font-bold ${tab === "phone" ? "bg-white text-brand-700 shadow" : "text-muted"}`}>휴대폰</button>
        </div>

        {tab === "email" ? (
          <div className="space-y-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일 (아이디)" className="w-full h-12 rounded-xl border border-line px-3.5 text-sm outline-none focus:border-brand-400" />
            <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="비밀번호" className="w-full h-12 rounded-xl border border-line px-3.5 text-sm outline-none focus:border-brand-400" />
            {PhoneVerify}
            <button onClick={signupEmail} className="w-full h-[52px] rounded-xl bg-brand-grad text-white font-extrabold text-sm shadow-soft mt-1">가입하기</button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] text-body">휴대폰 번호로 인증하면 바로 가입·로그인됩니다.</p>
            {PhoneVerify}
          </div>
        )}

        {msg && <p className="mt-4 text-[12px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{msg}</p>}
        <Link href="/login" className="block text-center text-muted text-[13px] font-bold mt-6">← 다른 방법으로 로그인</Link>
      </div>
    </main>
  );
}
