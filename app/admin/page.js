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
  const [staff, setStaff] = useState([]);
  const [memberQ, setMemberQ] = useState("");
  const [sf, setSf] = useState({ email: "", password: "", name: "", role: "cs" });
  const [pf2, setPf2] = useState({ email: "", role: "manager" });
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
      const { data: st } = await supabase.rpc("list_staff");
      setStaff(st || []);
      searchMembers("");
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
    const { data: v, error } = await supabase.from("vendors").insert({ name: app.business_name, category: app.category, region: app.region, phone: app.contact_phone, status: "hidden" }).select("id").single();
    if (error) { setMsg("승인 실패: " + error.message); return; }
    const { data: code } = await supabase.rpc("issue_vendor_claim_code", { vid: v.id });
    await supabase.from("vendor_applications").update({ status: "approved" }).eq("id", app.id);
    const sms = await smsClaim(app.contact_phone, code, app.business_name);
    setMsg(`승인 완료(준비중 상태) · 연결코드 ${code} · ${sms} · 사장님 세팅 완료 후 노출 요청이 오면 활성화하세요.`);
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
  async function searchMembers(q) {
    let qy = supabase.from("profiles").select("id, name, phone, role, created_at").order("created_at", { ascending: false }).limit(50);
    if (q) qy = qy.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
    const { data } = await qy; setUsers(data || []);
  }
  async function createStaff() {
    setMsg("");
    if (!sf.email || !sf.password || !sf.name) return setMsg("이메일·비밀번호·이름을 입력하세요.");
    const { data, error } = await supabase.rpc("create_staff_account", { p_email: sf.email, p_password: sf.password, p_name: sf.name, p_role: sf.role });
    if (error || data !== "ok") return setMsg("발급 실패: " + (error?.message || ({email_exists:"이미 가입된 이메일", weak_password:"비밀번호 8자 이상", invalid_role:"잘못된 역할", forbidden:"권한 없음"})[data] || data));
    setMsg(`직원 계정 발급 완료 — ${sf.email} / 임시 비밀번호를 본인에게 전달하세요.`);
    setSf({ email: "", password: "", name: "", role: "cs" }); load();
  }
  async function promoteStaff() {
    setMsg("");
    if (!pf2.email) return setMsg("회원 이메일을 입력하세요.");
    const { data, error } = await supabase.rpc("promote_staff", { p_email: pf2.email, p_role: pf2.role });
    if (error || data !== "ok") return setMsg("승격 실패: " + (error?.message || ({not_found:"해당 이메일의 회원이 없어요", forbidden:"권한 없음"})[data] || data));
    setMsg("승격 완료 — 본인에게 알림이 발송됐어요."); setPf2({ email: "", role: "manager" }); load();
  }
  async function demoteStaff(id) {
    if (!window.confirm("직원 권한을 해제할까요? (일반회원으로 전환)")) return;
    const { data, error } = await supabase.rpc("demote_staff", { p_user_id: id });
    if (error || data !== "ok") setMsg("해제 실패: " + (error?.message || data)); load();
  }
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
    ["staff", "직원 관리", ["admin"]],
    ["users", "회원 조회", ["admin"]],
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
        <nav className="flex gap-1 border-b border-line overflow-x-auto no-scrollbar">
          {TABS.map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`shrink-0 whitespace-nowrap px-4 py-3 text-sm font-bold border-b-2 ${tab === k ? "border-brand-600 text-brand-700" : "border-transparent text-muted"}`}>{label}</button>
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
                      <td className="p-3"><span className={`text-xs font-bold px-2 py-0.5 rounded ${v.status==="active"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>{({active:"공개",hidden:"준비중"})[v.status] || v.status}</span></td>
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

        {tab === "staff" && (
          <section className="py-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white border border-line rounded-2xl p-5">
                <h3 className="font-extrabold mb-1">직원 계정 발급</h3>
                <p className="text-[12px] text-muted mb-3">본사에서 직접 생성해 임시 비밀번호를 전달하세요.</p>
                <div className="space-y-2">
                  <input className={field + " w-full"} placeholder="이메일" value={sf.email} onChange={(e)=>setSf({...sf,email:e.target.value})} />
                  <input className={field + " w-full"} placeholder="임시 비밀번호 (8자 이상)" value={sf.password} onChange={(e)=>setSf({...sf,password:e.target.value})} />
                  <div className="flex gap-2">
                    <input className={field + " flex-1"} placeholder="이름" value={sf.name} onChange={(e)=>setSf({...sf,name:e.target.value})} />
                    <select className={field} value={sf.role} onChange={(e)=>setSf({...sf,role:e.target.value})}>
                      <option value="cs">CS담당자</option><option value="manager">입점관리자</option><option value="admin">최고관리자</option>
                    </select>
                  </div>
                  <button onClick={createStaff} className="w-full h-11 rounded-lg bg-brand-grad text-white font-bold text-sm">계정 발급</button>
                </div>
              </div>
              <div className="bg-white border border-line rounded-2xl p-5">
                <h3 className="font-extrabold mb-1">기존 회원 승격</h3>
                <p className="text-[12px] text-muted mb-3">이미 가입한 회원을 이메일로 직원으로 지정해요.</p>
                <div className="space-y-2">
                  <input className={field + " w-full"} placeholder="회원 이메일" value={pf2.email} onChange={(e)=>setPf2({...pf2,email:e.target.value})} />
                  <select className={field + " w-full"} value={pf2.role} onChange={(e)=>setPf2({...pf2,role:e.target.value})}>
                    <option value="manager">입점관리자</option><option value="cs">CS담당자</option><option value="admin">최고관리자</option>
                  </select>
                  <button onClick={promoteStaff} className="w-full h-11 rounded-lg bg-brand-500 text-white font-bold text-sm">승격</button>
                </div>
              </div>
            </div>
            <div className="bg-white border border-line rounded-2xl overflow-x-auto">
              <div className="px-5 pt-4 font-extrabold">직원 목록 <span className="text-muted text-sm font-bold">{staff.length}명</span></div>
              <table className="w-full text-sm min-w-[560px]">
                <thead><tr className="text-left text-muted text-xs border-b border-line"><th className="px-5 py-2.5">이름</th><th className="px-4 py-2.5">이메일</th><th className="px-4 py-2.5">역할</th><th className="px-4 py-2.5">관리</th></tr></thead>
                <tbody>
                  {staff.map((u) => (
                    <tr key={u.id} className="border-b border-line/60">
                      <td className="px-5 py-2.5 font-bold">{u.name || "-"}</td>
                      <td className="px-4 py-2.5 text-muted">{u.email}</td>
                      <td className="px-4 py-2.5"><span className={`text-xs font-extrabold px-2 py-0.5 rounded ${u.role==="admin"?"bg-ink text-white":u.role==="manager"?"bg-brand-50 text-brand-700":"bg-[#FFF6E8] text-[#C9821B]"}`}>{({admin:"최고관리자",manager:"입점관리자",cs:"CS담당자"})[u.role]}</span></td>
                      <td className="px-4 py-2.5"><button onClick={()=>demoteStaff(u.id)} className="text-xs text-muted font-bold underline">권한 해제</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "users" && (
          <section className="py-6">
            <div className="flex gap-2 mb-4">
              <input className={field + " flex-1 max-w-sm"} placeholder="이름·연락처 검색" value={memberQ} onChange={(e)=>setMemberQ(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&searchMembers(memberQ)} />
              <button onClick={()=>searchMembers(memberQ)} className="h-10 px-5 rounded-lg bg-brand-500 text-white text-sm font-bold">검색</button>
            </div>
            <div className="bg-white border border-line rounded-2xl overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead><tr className="text-left text-muted text-xs border-b border-line"><th className="px-5 py-2.5">이름</th><th className="px-4 py-2.5">연락처</th><th className="px-4 py-2.5">가입일</th><th className="px-4 py-2.5">역할</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-line/60">
                      <td className="px-5 py-2.5 font-bold">{u.name || "-"}</td>
                      <td className="px-4 py-2.5 text-muted">{u.phone || "-"}</td>
                      <td className="px-4 py-2.5 text-muted">{u.created_at ? new Date(u.created_at).toLocaleDateString("ko-KR") : "-"}</td>
                      <td className="px-4 py-2.5"><span className="text-xs font-bold text-body">{({customer:"일반회원",vendor:"입점업체",cs:"CS담당자",manager:"입점관리자",admin:"최고관리자"})[u.role] || "일반회원"}</span></td>
                    </tr>
                  ))}
                  {users.length===0 && <tr><td colSpan="4" className="px-5 py-8 text-center text-muted">검색 결과가 없어요.</td></tr>}
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-muted mt-2.5">직원 지정·해제는 <b>직원 관리</b> 탭에서, 입점업체 연결은 <b>업체 관리</b>의 연결코드로 처리해요.</p>
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
