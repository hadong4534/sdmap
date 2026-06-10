"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import TabBar from "@/components/TabBar";

const field = "w-full h-11 rounded-xl border border-line px-3 text-sm bg-white outline-none focus:border-brand-400";

export default function My() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [user, setUser] = useState(null);
  const [prof, setProf] = useState(null);
  const [partner, setPartner] = useState(null);
  // 1:1 문의
  const [inqs, setInqs] = useState([]);
  const [showInq, setShowInq] = useState(false);
  const [iq, setIq] = useState({ subject: "", content: "" });
  const [imsg, setImsg] = useState("");
  // 커플
  const [code, setCode] = useState("");
  const [inputCode, setInputCode] = useState("");
  const [cmsg, setCmsg] = useState("");
  // 계정
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState({ a: "", b: "" });
  const [amsg, setAmsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadAll(u) {
    const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
    setProf(p);
    if (p?.partner_id) {
      const { data: pt } = await supabase.from("profiles").select("name, avatar_url").eq("id", p.partner_id).maybeSingle();
      setPartner(pt);
    } else setPartner(null);
    const { data: cs } = await supabase.from("cs_inquiries").select("*").eq("user_id", u.id).order("created_at", { ascending: false });
    setInqs(cs || []);
  }
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user; if (!u) { router.replace("/login"); return; }
      setUser(u); loadAll(u);
    });
  }, [router]);

  // ── 프로필 이미지 ──
  async function onAvatar(e) {
    const f = e.target.files?.[0]; if (!f || !user) return;
    setBusy(true); setAmsg("");
    const path = `${user.id}.jpg`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, f, { upsert: true, contentType: f.type || "image/jpeg" });
    if (upErr) { setAmsg("이미지 업로드 실패: " + upErr.message); setBusy(false); return; }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    const url = pub.publicUrl + "?v=" + Date.now();
    await supabase.from("profiles").upsert({ id: user.id, avatar_url: url });
    setProf({ ...(prof || {}), avatar_url: url });
    setBusy(false);
  }

  // ── 비밀번호 변경 ──
  async function changePw() {
    setAmsg("");
    if (pw.a.length < 8) return setAmsg("비밀번호는 8자 이상이어야 해요.");
    if (pw.a !== pw.b) return setAmsg("비밀번호가 서로 달라요.");
    const { error } = await supabase.auth.updateUser({ password: pw.a });
    if (error) return setAmsg("변경 실패: " + error.message + (user?.app_metadata?.provider !== "email" ? " (소셜 로그인 계정은 비밀번호가 없을 수 있어요)" : ""));
    setPw({ a: "", b: "" }); setShowPw(false); setAmsg("비밀번호가 변경됐어요.");
  }

  // ── 회원탈퇴 ──
  async function deleteAccount() {
    if (!window.confirm("정말 탈퇴할까요? 찜·문의·예약 내역이 모두 삭제되며 되돌릴 수 없어요.")) return;
    if (!window.confirm("마지막 확인이에요. 탈퇴를 진행할까요?")) return;
    setBusy(true);
    const { error } = await supabase.rpc("delete_own_account");
    if (error) { setAmsg("탈퇴 실패: " + error.message); setBusy(false); return; }
    await supabase.auth.signOut();
    router.replace("/login");
  }

  // ── 커플 연동 ──
  async function genCode() {
    setCmsg("");
    const { data, error } = await supabase.rpc("gen_couple_code");
    if (error) return setCmsg("코드 발급 실패: " + error.message);
    setCode(data);
  }
  async function linkPartner() {
    setCmsg("");
    if (!inputCode.trim()) return setCmsg("초대 코드를 입력해 주세요.");
    const { data, error } = await supabase.rpc("link_partner", { code: inputCode });
    if (error) return setCmsg("연결 실패: " + error.message);
    if (data === "invalid_code") return setCmsg("코드가 올바르지 않거나 이미 연결된 코드예요.");
    if (data === "already_linked") return setCmsg("이미 커플이 연결돼 있어요.");
    setCmsg("커플 연결 완료!"); setInputCode(""); setCode(""); loadAll(user);
  }
  async function unlink() {
    if (!window.confirm("커플 연결을 해제할까요?")) return;
    await supabase.rpc("unlink_partner"); setCmsg(""); loadAll(user);
  }

  async function logout() { await supabase.auth.signOut(); router.replace("/login"); }
  async function submitInquiry() {
    setImsg("");
    if (!iq.subject || !iq.content) return setImsg("제목과 내용을 입력해 주세요.");
    const { error } = await supabase.from("cs_inquiries").insert({ user_id: user.id, subject: iq.subject, content: iq.content, status: "open" });
    if (error) return setImsg("접수 실패: " + error.message);
    setIq({ subject: "", content: "" }); setShowInq(false); setImsg("문의가 접수됐어요.");
    loadAll(user);
  }

  const m = user?.user_metadata || {};
  const name = prof?.name || m.name || m.full_name || m.nickname || (user?.email ? user.email.split("@")[0] : "회원");
  const menu = [["개인정보 설정", "/onboarding"], ["내 예약 / 계약", "/bookings"], ["위시리스트", "/favorites"], ["비교함", "/compare"]];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* 프로필 헤더 */}
      <div className="bg-brand-grad text-white px-6 pt-8 pb-6">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => fileRef.current?.click()} className="relative shrink-0">
            {prof?.avatar_url
              ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={prof.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white/60" />
              : <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center text-xl font-extrabold">{name.slice(0, 1)}</div>}
            <span className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white text-brand-600 flex items-center justify-center border border-line">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2L8 5h8l1.5 2h2A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/><circle cx="12" cy="13" r="3"/></svg>
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onAvatar} className="hidden" />
          <div className="min-w-0">
            <div className="text-lg font-extrabold truncate">{name}님 {partner && <span className="text-[11px] font-bold bg-white/25 px-2 py-0.5 rounded-full align-middle ml-1">♥ {partner.name || "커플"} 연결됨</span>}</div>
            <div className="text-xs opacity-90 truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-4">
        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          {menu.map(([l, h]) => (<Link key={h} href={h} className="flex items-center justify-between px-5 py-4 border-b border-line last:border-0 text-sm font-bold">{l}<span className="text-muted">›</span></Link>))}
        </div>

        {/* 커플 연동 */}
        <div className="bg-white border border-line rounded-2xl mt-3 p-5">
          <div className="flex items-center justify-between">
            <b className="text-sm text-ink">커플 계정 연동</b>
            {partner && <button onClick={unlink} className="text-[12px] text-muted underline">연결 해제</button>}
          </div>
          {partner ? (
            <div className="mt-3 flex items-center gap-3 bg-brand-50 rounded-xl p-3.5">
              {partner.avatar_url
                ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={partner.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                : <div className="w-10 h-10 rounded-full bg-brand-200 flex items-center justify-center font-extrabold text-brand-700">{(partner.name || "♥").slice(0, 1)}</div>}
              <div className="text-[13.5px] text-body"><b className="text-brand-700">{partner.name || "파트너"}</b>님과 연결돼 있어요. <Link href="/favorites" className="font-bold text-brand-600 underline underline-offset-2">커플 위시리스트 보기 →</Link></div>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              <p className="text-[13px] text-muted leading-relaxed">예비 배우자와 계정을 연결하면 서로의 찜을 한 위시리스트에서 함께 볼 수 있어요.</p>
              <div className="flex items-center gap-2">
                {code
                  ? <div className="flex-1 h-11 rounded-xl bg-brand-50 flex items-center justify-center font-extrabold tracking-[0.3em] text-brand-700 text-lg">{code}</div>
                  : <button onClick={genCode} className="flex-1 h-11 rounded-xl bg-brand-500 text-white text-sm font-bold">내 초대 코드 만들기</button>}
                {code && <button onClick={() => { navigator.clipboard?.writeText(code); setCmsg("코드를 복사했어요. 파트너에게 보내주세요!"); }} className="h-11 px-4 rounded-xl bg-brand-50 text-brand-700 text-sm font-bold shrink-0">복사</button>}
              </div>
              <div className="flex gap-2">
                <input value={inputCode} onChange={(e) => setInputCode(e.target.value.toUpperCase())} placeholder="받은 초대 코드 입력" maxLength={6} className={field + " tracking-widest"} />
                <button onClick={linkPartner} className="h-11 px-4 rounded-xl bg-brand-grad text-white text-sm font-bold shrink-0">연결</button>
              </div>
            </div>
          )}
          {cmsg && <p className="mt-2.5 text-[12px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{cmsg}</p>}
        </div>

        {/* 1:1 문의 */}
        <div className="bg-white border border-line rounded-2xl mt-3 p-5">
          <div className="flex items-center justify-between">
            <b className="text-sm text-ink">1:1 문의</b>
            <button onClick={() => setShowInq(!showInq)} className="h-9 px-4 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">{showInq ? "닫기" : "문의하기"}</button>
          </div>
          {showInq && (
            <div className="mt-3 space-y-2">
              <input value={iq.subject} onChange={(e) => setIq({ ...iq, subject: e.target.value })} placeholder="제목" className={field} />
              <textarea value={iq.content} onChange={(e) => setIq({ ...iq, content: e.target.value })} placeholder="문의 내용을 적어주세요" rows={4} className="w-full rounded-xl border border-line px-3 py-2.5 text-sm bg-white resize-none outline-none focus:border-brand-400" />
              <button onClick={submitInquiry} className="w-full h-11 rounded-xl bg-brand-500 text-white text-sm font-bold">접수하기</button>
            </div>
          )}
          {imsg && <p className="mt-2 text-[12px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{imsg}</p>}
          {inqs.length > 0 && (
            <div className="mt-3 space-y-2">
              {inqs.slice(0, 5).map((c) => (
                <div key={c.id} className="border border-line rounded-xl p-3">
                  <div className="flex items-center justify-between"><b className="text-[13px] text-ink">{c.subject}</b><span className={`text-[11px] font-bold px-2 py-0.5 rounded ${(!c.status || c.status === "open") ? "bg-[#FFF1EC] text-[#E8663C]" : "bg-[#E8F8F3] text-[#1FA888]"}`}>{(!c.status || c.status === "open") ? "답변 대기" : "답변 완료"}</span></div>
                  {c.answer && <p className="text-[12.5px] text-body mt-1.5 bg-surface rounded-lg p-2.5"><b className="text-brand-700">답변</b> · {c.answer}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 계정 설정 */}
        <div className="bg-white border border-line rounded-2xl mt-3 p-5">
          <b className="text-sm text-ink">계정 설정</b>
          <div className="mt-3 space-y-2">
            <button onClick={() => setShowPw(!showPw)} className="w-full flex items-center justify-between text-sm font-bold text-body py-2">비밀번호 변경 <span className="text-muted">{showPw ? "▴" : "›"}</span></button>
            {showPw && (
              <div className="space-y-2 pb-2">
                <input type="password" value={pw.a} onChange={(e) => setPw({ ...pw, a: e.target.value })} placeholder="새 비밀번호 (8자 이상)" className={field} />
                <input type="password" value={pw.b} onChange={(e) => setPw({ ...pw, b: e.target.value })} placeholder="새 비밀번호 확인" className={field} />
                <button onClick={changePw} className="w-full h-11 rounded-xl bg-brand-500 text-white text-sm font-bold">변경하기</button>
                {user?.app_metadata?.provider && user.app_metadata.provider !== "email" && <p className="text-[11.5px] text-muted">카카오·네이버 등 소셜 계정은 해당 서비스에서 비밀번호를 관리해요.</p>}
              </div>
            )}
          </div>
          {amsg && <p className="mt-2 text-[12px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{amsg}</p>}
        </div>

        {["admin", "manager", "cs"].includes(prof?.role) && <Link href="/admin" className="block mt-3 text-center bg-ink text-white rounded-xl py-3 text-sm font-bold">직원 관리자 페이지 →</Link>}
        {prof?.role === "vendor" && <Link href="/vendor" className="block mt-3 text-center bg-brand-600 text-white rounded-xl py-3 text-sm font-bold">내 업체 대시보드 →</Link>}
        <div className="flex justify-center gap-4 mt-4 text-[12px] text-muted">
          <Link href="/terms" className="underline underline-offset-2">이용약관</Link>
          <Link href="/privacy" className="underline underline-offset-2">개인정보처리방침</Link>
          <Link href="/methodology" className="underline underline-offset-2">산정 방식 안내</Link>
        </div>
        <button onClick={logout} className="w-full mt-3 border border-line rounded-xl py-3 text-sm font-bold text-muted">로그아웃</button>
        <button onClick={deleteAccount} disabled={busy} className="w-full mt-2 py-3 text-[12.5px] font-bold text-muted underline underline-offset-2 disabled:opacity-50">회원탈퇴</button>
      </main>
      <TabBar active="my" />
    </div>
  );
}
