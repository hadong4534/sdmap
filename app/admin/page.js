"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const CATS = { studio: "스튜디오", dress: "드레스", makeup: "메이크업", hall: "웨딩홀" };
const won = (n) => (n || 0).toLocaleString() + "원";
const field = "h-10 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-400 bg-white";

export default function Admin() {
  const router = useRouter();
  const [ok, setOk] = useState(null);
  const [myRole, setMyRole] = useState("");
  const [tab, setTab] = useState("dash");
  const [vendors, setVendors] = useState([]);
  const [apps, setApps] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", category: "studio", region: "서울", status: "active" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      if (!supabase) { setOk(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (!prof || !["admin","manager","cs"].includes(prof.role)) { setOk(false); return; }
      setMyRole(prof.role); setOk(true); load(prof.role);
    })();
  }, [router]);

  async function load(role) {
    const r = role || myRole;
    const [{ data: v }, { data: a }, { data: b }, { data: cs }] = await Promise.all([
      supabase.from("vendors").select("*").order("created_at", { ascending: false }),
      supabase.from("vendor_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*, vendors(name)").order("created_at", { ascending: false }).limit(200),
      supabase.from("cs_inquiries").select("*, vendors(name)").order("created_at", { ascending: false }).limit(200),
    ]);
    setVendors(v || []); setApps(a || []); setBookings(b || []); setInquiries(cs || []);
    if (r === "admin") {
      const { data: u } = await supabase.from("profiles").select("id, name, phone, role, created_at").order("created_at", { ascending: false }).limit(300);
      setUsers(u || []);
    }
  }
  async function addVendor() {
    setMsg(""); if (!form.name) return setMsg("업체명을 입력하세요.");
    const { error } = await supabase.from("vendors").insert(form);
    if (error) return setMsg("등록 실패: " + error.message);
    setForm({ name: "", category: "studio", region: "서울", status: "active" }); setMsg("업체 등록 완료"); load();
  }
  async function setStatus(id, status) { await supabase.from("vendors").update({ status }).eq("id", id); load(); }
  async function approve(app) {
    const { data: v, error } = await supabase.from("vendors").insert({ name: app.business_name, category: app.category, region: app.region, phone: app.contact_phone, status: "active" }).select("id").single();
    if (error) { setMsg("승인 실패: " + error.message); return; }
    const { data: code } = await supabase.rpc("issue_vendor_claim_code", { vid: v.id });
    await supabase.from("vendor_applications").update({ status: "approved" }).eq("id", app.id);
    const sms = await smsClaim(app.contact_phone, code, app.business_name);
    setMsg(`승인 완료 · 연결코드 ${code} · ${sms}`);
    load();
  }
  async function smsClaim(phone, code, vendorName) {
    if (!phone) return "연락처 없음 — 수동 전달 필요";
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const r = await fetch("/api/sms/claim", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ phone, code, vendorName }) });
      const j = await r.json();
      return r.ok ? "SMS 발송 완료" : (j.error || "발송 실패 — 수동 전달 필요");
    } catch { return "발송 실패 — 수동 전달 필요"; }
  }
  async function reviewPricing(v, approve) {
    const p = v.pending_update || {};
    const summary = `기준가: ${(p.base_price ?? v.base_price)?.toLocaleString()}원\n예상 추가금: ${(p.expected_extra_fee ?? v.expected_extra_fee)?.toLocaleString()}원\n미포함 항목: ${(p.excluded_items || []).map((e) => e.name).join(", ") || "변경 없음"}`;
    if (!window.confirm(`${v.name} 변경 요청 ${approve ? "승인" : "반려"}\n\n${summary}`)) return;
    const { data, error } = await supabase.rpc("review_vendor_pricing", { vid: v.id, approve });
    setMsg(error ? "검수 실패: " + error.message : data === "ok" ? (approve ? "승인·반영 완료" : "반려 완료") : data);
    load();
  }
  async function reissueCode(vid) {
    const { data: code, error } = await supabase.rpc("issue_vendor_claim_code", { vid });
    if (error) setMsg("코드 발급 실패: " + error.message);
    else { setMsg(`연결코드 발급: ${code} (클립보드 복사됨)`); try { navigator.clipboard.writeText(code); } catch {} }
    load();
  }
  async function reject(id) { await supabase.from("vendor_applications").update({ status: "rejected" }).eq("id", id); load(); }
  async function answerInquiry(id) {
    const a = window.prompt("답변 내용을 입력하세요"); if (!a) return;
    const { error } = await supabase.from("cs_inquiries").update({ answer: a, status: "answered", answered_at: new Date().toISOString() }).eq("id", id);
    if (error) setMsg("답변 실패: " + error.message); load();
  }
  async function changeRole(id, role) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) setMsg("역할 변경 실패: " + error.message); else load();
  }

  const revenue = bookings.filter((b) => ["confirmed", "done"].includes(b.status)).reduce((s, b) => s + (b.amount || 0), 0);
  const pendingApps = apps.filter((a) => a.status === "pending");

  if (ok === null) return <main className="min-h-screen flex items-center justify-center text-muted">불러오는 중...</main>;
  if (ok === false) return <main className="min-h-screen flex items-center justify-center text-muted text-sm">관리자 전용 페이지입니다. (권한 없음)</main>;

  const openCs = inquiries.filter((c) => c.status === "open" || !c.status).length;
  const ALL_TABS = [
    ["dash", "대시보드", ["admin","manager","cs"]],
    ["vendors", "업체 관리", ["admin","manager"]],
    ["apps", `입점 신청${pendingApps.length ? ` (${pendingApps.length})` : ""}`, ["admin","manager"]],
    ["bookings", "예약 데이터", ["admin","manager"]],
    ["cs", `CS 문의${openCs ? ` (${openCs})` : ""}`, ["admin","cs"]],
    ["users", "회원·역할", ["admin"]],
  ];
  const TABS = ALL_TABS.filter(([,,roles]) => roles.includes(myRole)).map(([k,l]) => [k,l]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-ink text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <span className="font-extrabold text-lg">스드맵 <span className="text-brand-300">ADMIN</span></span>
          <span className="text-xs text-white/60">{({admin:"최고관리자",manager:"입점관리자",cs:"CS담당자"})[myRole]}</span>
          <a href="/home" className="ml-auto text-xs text-white/70 underline">고객 화면 →</a>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6">
        <nav className="flex gap-1 border-b border-line">
          {TABS.map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-3 text-sm font-bold border-b-2 ${tab === k ? "border-brand-600 text-brand-700" : "border-transparent text-muted"}`}>{label}</button>
          ))}
        </nav>

        {tab === "dash" && (
          <section className="py-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[["전체 업체", vendors.length], ["활성 업체", vendors.filter(v=>v.status==="active").length], ["입점 신청 대기", pendingApps.length, "apps"], ["미답변 문의", openCs, "cs"], ["총 예약", bookings.length, "bookings"], ["확정 매출", won(revenue)]].map(([l, val, go]) => (
              <div key={l} onClick={() => go && setTab(go)} className={`bg-white border rounded-2xl p-5 ${go ? "cursor-pointer hover:border-brand-300" : ""} ${(l === "입점 신청 대기" && val > 0) || (l === "미답변 문의" && val > 0) ? "border-[#FFD8C9] bg-[#FFFAF7]" : "border-line"}`}>
                <div className="text-xs text-muted font-bold">{l}{go && " ›"}</div>
                <div className={`text-2xl font-extrabold mt-1 ${(l === "입점 신청 대기" || l === "미답변 문의") && val > 0 ? "text-[#E8663C]" : "text-brand-700"}`}>{val}</div>
              </div>
            ))}
          </section>
        )}

        {tab === "vendors" && (
          <section className="py-6">
            <div className="bg-white border border-line rounded-2xl p-5 mb-5">
              <h3 className="font-extrabold mb-3">업체 직접 등록</h3>
              <div className="flex flex-wrap gap-2 items-center">
                <input className={field + " flex-1 min-w-[160px]"} placeholder="업체명" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
                <select className={field} value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>{Object.entries(CATS).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
                <input className={field + " w-28"} placeholder="지역" value={form.region} onChange={(e)=>setForm({...form,region:e.target.value})} />
                <select className={field} value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}><option value="active">활성</option><option value="hidden">숨김</option></select>
                <button onClick={addVendor} className="h-10 px-5 rounded-lg bg-brand-grad text-white font-bold text-sm">등록</button>
              </div>
              {msg && <p className="text-xs text-brand-700 mt-2">{msg}</p>}
            </div>
            <div className="bg-white border border-line rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-brand-50 text-brand-700"><tr><th className="text-left p-3">업체명</th><th className="text-left p-3">카테고리</th><th className="text-left p-3">지역</th><th className="text-left p-3">상태</th><th className="text-left p-3">계정 연결</th><th className="p-3">관리</th></tr></thead>
                <tbody>
                  {vendors.map((v)=>(
                    <tr key={v.id} className="border-t border-line">
                      <td className="p-3 font-bold">{v.name}</td><td className="p-3">{CATS[v.category]}</td><td className="p-3">{v.region}</td>
                      <td className="p-3"><span className={`text-xs font-bold px-2 py-0.5 rounded ${v.status==="active"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>{v.status}</span></td>
                      <td className="p-3">
                        {v.owner_id
                          ? <span className="text-xs font-bold text-[#1FA888] bg-[#E8F8F3] px-2 py-0.5 rounded">계정 연결됨</span>
                          : v.claim_code
                            ? <span className="text-xs font-bold text-brand-700">코드 <b className="tracking-widest">{v.claim_code}</b> <button onClick={()=>reissueCode(v.id)} className="ml-1 underline text-muted">재발급</button></span>
                            : <button onClick={()=>reissueCode(v.id)} className="text-xs font-bold text-brand-700 underline">연결코드 발급</button>}
                      </td>
                      <td className="p-3 text-center">
                        {v.pending_update && (
                          <span className="inline-flex items-center gap-1.5 mr-2">
                            <span className="text-[11px] font-extrabold text-[#E8663C] bg-[#FFF1EC] px-2 py-0.5 rounded">검수 대기</span>
                            <button onClick={()=>reviewPricing(v, true)} className="text-xs text-brand-700 font-bold underline">승인</button>
                            <button onClick={()=>reviewPricing(v, false)} className="text-xs text-muted font-bold underline">반려</button>
                          </span>
                        )}
                        {v.status!=="active" && <button onClick={()=>setStatus(v.id,"active")} className="text-xs text-brand-700 font-bold mr-2">활성화</button>}
                        {v.status==="active" && <button onClick={()=>setStatus(v.id,"hidden")} className="text-xs text-muted font-bold">숨김</button>}
                      </td>
                    </tr>
                  ))}
                  {vendors.length===0 && <tr><td colSpan="6" className="p-6 text-center text-muted">등록된 업체가 없어요.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "cs" && (
          <section className="py-6 space-y-3">
            {inquiries.map((c) => (
              <div key={c.id} className="bg-white border border-line rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm">{c.subject || "문의"} <span className="text-muted font-normal">· {c.vendors?.name || "플랫폼 일반 문의"}</span></div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${(!c.status || c.status === "open") ? "bg-[#FFF1EC] text-[#E8663C]" : "bg-brand-50 text-brand-700"}`}>{(!c.status || c.status === "open") ? "미답변" : "답변완료"}</span>
                </div>
                <p className="text-sm text-body mt-2 whitespace-pre-wrap">{c.content}</p>
                {c.answer && <div className="mt-2 bg-surface rounded-lg p-3 text-sm text-body"><b className="text-brand-700">답변</b> · {c.answer}</div>}
                {(!c.status || c.status === "open") && <button onClick={() => answerInquiry(c.id)} className="mt-3 h-9 px-4 rounded-lg bg-brand-500 text-white text-xs font-bold">답변하기</button>}
                <div className="text-[11px] text-muted mt-2">{new Date(c.created_at).toLocaleString("ko-KR")}</div>
              </div>
            ))}
            {inquiries.length === 0 && <p className="text-center text-muted text-sm py-10">접수된 문의가 없어요.</p>}
          </section>
        )}

        {tab === "users" && (
          <section className="py-6 bg-white border border-line rounded-2xl mt-6 overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead><tr className="text-left text-muted text-xs border-b border-line"><th className="px-4 py-2">이름</th><th className="px-4 py-2">연락처</th><th className="px-4 py-2">가입일</th><th className="px-4 py-2">역할</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-line/60">
                    <td className="px-4 py-2.5 font-bold">{u.name || "-"}</td>
                    <td className="px-4 py-2.5 text-muted">{u.phone || "-"}</td>
                    <td className="px-4 py-2.5 text-muted">{u.created_at ? new Date(u.created_at).toLocaleDateString("ko-KR") : "-"}</td>
                    <td className="px-4 py-2.5">
                      <select value={u.role || "user"} onChange={(e) => changeRole(u.id, e.target.value)} className="h-9 rounded-lg border border-line px-2 text-xs bg-white">
                        <option value="user">일반회원</option>
                        <option value="vendor">입점업체</option>
                        <option value="cs">CS담당자</option>
                        <option value="manager">입점관리자</option>
                        <option value="admin">최고관리자</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {tab === "apps" && (
          <section className="py-6 bg-white border border-line rounded-2xl overflow-hidden mt-0">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-brand-700"><tr><th className="text-left p-3">업체명</th><th className="text-left p-3">카테고리</th><th className="text-left p-3">연락처</th><th className="text-left p-3">상태</th><th className="p-3">처리</th></tr></thead>
              <tbody>
                {apps.map((a)=>(
                  <tr key={a.id} className="border-t border-line">
                    <td className="p-3 font-bold">{a.business_name}</td><td className="p-3">{CATS[a.category]||a.category}</td><td className="p-3">{a.contact_name} {a.contact_phone}</td>
                    <td className="p-3">{a.status}</td>
                    <td className="p-3 text-center">
                      {a.status==="pending" && <><button onClick={()=>approve(a)} className="text-xs text-brand-700 font-bold mr-2">승인</button><button onClick={()=>reject(a.id)} className="text-xs text-rose font-bold">거절</button></>}
                    </td>
                  </tr>
                ))}
                {apps.length===0 && <tr><td colSpan="5" className="p-6 text-center text-muted">입점 신청이 없어요.</td></tr>}
              </tbody>
            </table>
          </section>
        )}

        {tab === "bookings" && (
          <section className="py-6 bg-white border border-line rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-brand-700"><tr><th className="text-left p-3">업체</th><th className="text-left p-3">고객</th><th className="text-left p-3">일시</th><th className="text-left p-3">상태</th><th className="text-right p-3">금액</th></tr></thead>
              <tbody>
                {bookings.map((b)=>(
                  <tr key={b.id} className="border-t border-line">
                    <td className="p-3 font-bold">{b.vendors?.name||"-"}</td><td className="p-3">{b.customer_name||"-"} {b.customer_phone||""}</td>
                    <td className="p-3">{b.booking_date||"-"} {b.booking_time||""}</td><td className="p-3">{b.status}</td><td className="p-3 text-right font-bold text-brand-700">{won(b.amount)}</td>
                  </tr>
                ))}
                {bookings.length===0 && <tr><td colSpan="5" className="p-6 text-center text-muted">예약 데이터가 없어요.</td></tr>}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}
