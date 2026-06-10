"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseReady } from "@/lib/supabaseClient";

const PATHS = ["검색(구글/네이버)", "지인 추천", "인스타그램 / SNS 광고", "유튜브", "블로그 / 카페", "앱스토어", "웨딩박람회", "기타"];

const field = "w-full h-12 rounded-xl border border-line px-3.5 text-sm outline-none focus:border-brand-400 bg-white";

export default function Signup() {
  const router = useRouter();
  const [who, setWho] = useState("customer"); // customer | vendor
  const [agree, setAgree] = useState(false);
  const [tab, setTab] = useState("email");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [postcode, setPostcode] = useState("");
  const [address, setAddress] = useState("");
  const [addrDetail, setAddrDetail] = useState("");
  const [path, setPath] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("method");
    if (m === "phone") setTab("phone");
  }, []);

  function openPostcode() {
    if (typeof window === "undefined" || !window.daum || !window.daum.Postcode) {
      setMsg("주소 검색 모듈을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    new window.daum.Postcode({
      oncomplete: (data) => {
        setPostcode(data.zonecode);
        setAddress(data.roadAddress || data.jibunAddress);
      },
    }).open();
  }

  async function sendCode() {
    setMsg("");
    if (!phone) return setMsg("휴대폰 번호를 입력해 주세요.");
    setBusy(true);
    const r = await fetch("/api/sms/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) return setMsg(j.error || "인증번호 발송 실패");
    setToken(j.token); setSent(true); setMsg("인증번호를 발송했어요. (3분 이내 입력)");
  }

  async function verify() {
    setMsg("");
    setBusy(true);
    const r = await fetch("/api/sms/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code, token }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!j.ok) return setMsg(j.error || "인증 실패");
    setVerified(true); setMsg("휴대폰 인증 완료!");
    if (tab === "phone") setMsg("휴대폰 인증 완료! 이름·주소를 입력 후 가입을 완료해 주세요.");
  }

  async function submit() {
    setMsg("");
    if (!isSupabaseReady || !supabase) return setMsg("Supabase 환경변수를 먼저 설정해 주세요.");
    if (!verified) return setMsg("휴대폰 인증을 먼저 완료해 주세요. (필수)");
    if (!name) return setMsg("이름을 입력해 주세요.");
    if (!address) return setMsg("주소를 입력해 주세요.");
    if (!path) return setMsg("가입 경로를 선택해 주세요.");
    if (!agree) return setMsg("이용약관과 개인정보처리방침에 동의해 주세요.");
    if (tab === "email" && (!email || !pw)) return setMsg("이메일과 비밀번호를 입력해 주세요.");

    setBusy(true);
    let userId = null;
    if (tab === "email") {
      const { data, error } = await supabase.auth.signUp({ email, password: pw });
      if (error) { setBusy(false); return setMsg("가입 실패: " + error.message); }
      userId = data.user ? data.user.id : null;
    }
    // 프로필 저장 (로그인 세션이 있을 때만 RLS 통과)
    if (userId) {
      await supabase.from("profiles").insert({
        id: userId, name, phone: phone.replace(/[^0-9]/g, ""),
        postcode, address, address_detail: addrDetail, signup_path: path,
      });
    }
    setBusy(false);
    setMsg(who === "vendor" ? "가입 완료! 업체 연결 화면으로 이동해요." : "가입이 완료됐어요!");
    setTimeout(() => router.push(who === "vendor" ? "/vendor" : "/home"), 1200);
  }

  return (
    <main className="min-h-screen bg-aurora px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo_full.png" alt="스드맵" className="w-32 h-auto mx-auto" />
        <h1 className="text-xl font-extrabold text-center mt-4 mb-4">회원가입</h1>
        <div className="flex gap-2 mb-5">
          <button type="button" onClick={() => setWho("customer")} className={`flex-1 h-12 rounded-xl text-sm font-bold border ${who === "customer" ? "bg-brand-500 text-white border-brand-500" : "bg-white text-body border-line"}`}>예비부부 (고객)</button>
          <button type="button" onClick={() => setWho("vendor")} className={`flex-1 h-12 rounded-xl text-sm font-bold border ${who === "vendor" ? "bg-brand-500 text-white border-brand-500" : "bg-white text-body border-line"}`}>사장님 (입점업체)</button>
        </div>
        {who === "vendor" && <p className="text-[12.5px] text-body bg-brand-50 rounded-xl px-3.5 py-2.5 mb-4 leading-relaxed">가입 후 <b>업체 연결 코드</b>를 입력하면 업체 대시보드가 열려요. 아직 입점 전이라면 가입 후 입점 신청부터 진행해 주세요.</p>}

        <div className="flex bg-brand-50 rounded-xl p-1 mb-6">
          <button onClick={() => setTab("email")} className={`flex-1 h-10 rounded-lg text-[13px] font-bold ${tab === "email" ? "bg-white text-brand-700 shadow" : "text-muted"}`}>이메일(아이디)</button>
          <button onClick={() => setTab("phone")} className={`flex-1 h-10 rounded-lg text-[13px] font-bold ${tab === "phone" ? "bg-white text-brand-700 shadow" : "text-muted"}`}>휴대폰</button>
        </div>

        <div className="space-y-3">
          {tab === "email" && (
            <>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일 (아이디)" className={field} />
              <input value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="비밀번호" className={field} />
            </>
          )}

          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" className={field} />

          {/* 휴대폰 인증 */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-ink">휴대폰 인증 <span className="text-rose">*필수</span></label>
            <div className="flex gap-2">
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" className={field} />
              <button onClick={sendCode} disabled={busy} className="px-4 rounded-xl bg-brand-100 text-brand-700 font-bold text-[13px] whitespace-nowrap">인증번호 받기</button>
            </div>
            {sent && !verified && (
              <div className="flex gap-2">
                <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="인증번호 6자리" className={field} />
                <button onClick={verify} disabled={busy} className="px-4 rounded-xl bg-brand-grad text-white font-bold text-[13px] whitespace-nowrap">확인</button>
              </div>
            )}
            {verified && <p className="text-[12px] text-ok font-bold">✓ 인증 완료</p>}
          </div>

          {/* 주소 (다음 우편번호) */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-ink">주소</label>
            <div className="flex gap-2">
              <input value={postcode} readOnly placeholder="우편번호" className={field + " bg-brand-50"} />
              <button onClick={openPostcode} className="px-4 rounded-xl bg-brand-100 text-brand-700 font-bold text-[13px] whitespace-nowrap">주소 검색</button>
            </div>
            <input value={address} readOnly placeholder="기본 주소" className={field + " bg-brand-50"} />
            <input value={addrDetail} onChange={(e) => setAddrDetail(e.target.value)} placeholder="상세 주소" className={field} />
          </div>

          {/* 가입 경로 */}
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-ink">가입 경로</label>
            <select value={path} onChange={(e) => setPath(e.target.value)} className={field + " appearance-none"}>
              <option value="">스드맵을 어떻게 알게 되셨나요?</option>
              {PATHS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <label className="flex items-start gap-2.5 mt-1 cursor-pointer">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 w-4.5 h-4.5 accent-[#8B6FE8]" />
            <span className="text-[12.5px] text-body leading-relaxed">(필수) <a href="/terms" target="_blank" className="font-bold text-brand-600 underline underline-offset-2">이용약관</a> 및 <a href="/privacy" target="_blank" className="font-bold text-brand-600 underline underline-offset-2">개인정보처리방침</a>에 동의합니다.</span>
          </label>


          <button onClick={submit} disabled={busy} className="w-full h-[52px] rounded-xl bg-brand-grad text-white font-extrabold text-sm shadow-soft mt-1 disabled:opacity-60">
            {busy ? "처리 중..." : "가입 완료"}
          </button>
        </div>

        {msg && <p className="mt-4 text-[12px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{msg}</p>}
        <Link href="/login" className="block text-center text-muted text-[13px] font-bold mt-6">← 다른 방법으로 로그인</Link>
      </div>
    </main>
  );
}
