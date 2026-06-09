"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const PATHS = ["검색(구글/네이버)", "지인 추천", "인스타그램 / SNS 광고", "유튜브", "블로그 / 카페", "앱스토어", "웨딩박람회", "기타"];
const field = "w-full h-12 rounded-xl border border-line px-3.5 text-sm outline-none focus:border-brand-400 bg-white";

export default function Onboarding() {
  const router = useRouter();
  const [user, setUser] = useState(null);
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
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user ?? null;
      if (!u) { router.replace("/login"); return; }
      setUser(u);
      const m = u.user_metadata || {};
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
      setName(p?.name || m.name || m.full_name || m.nickname || m.preferred_username || "");
      if (p) { setPhone(p.phone || ""); setPostcode(p.postcode || ""); setAddress(p.address || ""); setAddrDetail(p.address_detail || ""); setPath(p.signup_path || ""); if (p.phone) setVerified(true); }
    });
  }, [router]);

  function openPostcode() {
    if (typeof window === "undefined" || !window.daum || !window.daum.Postcode) { setMsg("주소 검색 모듈 로딩 중이에요. 잠시 후 다시."); return; }
    new window.daum.Postcode({ oncomplete: (d) => { setPostcode(d.zonecode); setAddress(d.roadAddress || d.jibunAddress); } }).open();
  }
  async function sendCode() {
    setMsg(""); if (!phone) return setMsg("휴대폰 번호를 입력해 주세요.");
    setBusy(true);
    const r = await fetch("/api/sms/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (!r.ok) return setMsg(j.error || "인증번호 발송 실패");
    setToken(j.token); setSent(true); setMsg("인증번호를 발송했어요. (3분 이내)");
  }
  async function verify() {
    setMsg(""); setBusy(true);
    const r = await fetch("/api/sms/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, code, token }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (!j.ok) return setMsg(j.error || "인증 실패");
    setVerified(true); setMsg("휴대폰 인증 완료!");
  }
  async function submit() {
    setMsg("");
    if (!user || !supabase) return;
    if (!name) return setMsg("이름을 입력해 주세요.");
    setBusy(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id, name, phone: phone.replace(/[^0-9]/g, ""),
      postcode, address, address_detail: addrDetail, signup_path: path,
    });
    setBusy(false);
    if (error) return setMsg("저장 실패: " + error.message);
    setMsg("저장됐어요!"); setTimeout(() => router.replace("/my"), 800);
  }

  return (
    <main className="min-h-screen bg-surface px-6 py-10 flex flex-col items-center">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo_full.png" alt="스드맵" className="w-32 h-auto mx-auto" />
        <h1 className="text-xl font-extrabold text-center mt-4">개인정보 설정</h1>
        <p className="text-[13px] text-muted text-center mt-1 mb-6">이름·연락처·주소를 설정하면 예약·상담이 편해져요. (선택 입력)</p>

        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" className={field} />
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-ink">휴대폰 <span className="text-muted text-[11px]">(인증 시 SMS 알림)</span></label>
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
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-ink">주소</label>
            <div className="flex gap-2">
              <input value={postcode} readOnly placeholder="우편번호" className={field + " bg-brand-50"} />
              <button onClick={openPostcode} className="px-4 rounded-xl bg-brand-100 text-brand-700 font-bold text-[13px] whitespace-nowrap">주소 검색</button>
            </div>
            <input value={address} readOnly placeholder="기본 주소" className={field + " bg-brand-50"} />
            <input value={addrDetail} onChange={(e) => setAddrDetail(e.target.value)} placeholder="상세 주소" className={field} />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-ink">가입 경로</label>
            <select value={path} onChange={(e) => setPath(e.target.value)} className={field + " appearance-none"}>
              <option value="">스드맵을 어떻게 알게 되셨나요?</option>
              {PATHS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button onClick={submit} disabled={busy} className="w-full h-[52px] rounded-xl bg-brand-grad text-white font-extrabold text-sm shadow-soft mt-1 disabled:opacity-60">
            {busy ? "저장 중..." : "저장하기"}
          </button>
        </div>
        {msg && <p className="mt-4 text-[12px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{msg}</p>}
      </div>
    </main>
  );
}
