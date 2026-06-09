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
  const [tab, setTab] = useState("dash");
  const [vendors, setVendors] = useState([]);
  const [apps, setApps] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ name: "", category: "studio", region: "서울", status: "active" });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      if (!supabase) { setOk(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (!prof || prof.role !== "admin") { setOk(false); return; }
      setOk(true); load();
    })();
  }, [router]);

  async function load() {
    const [{ data: v }, { data: a }, { data: b }] = await Promise.all([
      supabase.from("vendors").select("*").order("created_at", { ascending: false }),
      supabase.from("vendor_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*, vendors(name)").order("created_at", { ascending: false }).limit(200),
    ]);
    setVendors(v || []); setApps(a || []); setBookings(b || []);
  }
  async function addVendor() {
    setMsg(""); if (!form.name) return setMsg("업체명을 입력하세요.");
    const { error } = await supabase.from("vendors").insert(form);
    if (error) return setMsg("등록 실패: " + error.message);
    setForm({ name: "", category: "studio", region: "서울", status: "active" }); setMsg("업체 등록 완료"); load();
  }
  async function setStatus(id, status) { await supabase.from("vendors").update({ status }).eq("id", id); load(); }
  async function approve(app) {
    await supabase.from("vendors").insert({ name: app.business_name, category: app.category, region: app.region, phone: app.contact_phone, status: "active" });
    await supabase.from("vendor_applications").update({ status: "approved" }).eq("id", app.id); load();
  }
  async function reject(id) { await supabase.from("vendor_applications").update({ status: "rejected" }).eq("id", id); load(); }

  const revenue = bookings.filter((b) => ["confirmed", "done"].includes(b.status)).reduce((s, b) => s + (b.amount || 0), 0);
  const pendingApps = apps.filter((a) => a.status === "pending");

  if (ok === null) return <main className="min-h-screen flex items-center justify-center text-muted">불러오는 중...</main>;
  if (ok === false) return <main className="min-h-screen flex items-center justify-center text-muted text-sm">관리자 전용 페이지입니다. (권한 없음)</main>;

  const TABS = [["dash", "대시보드"], ["vendors", "업체 관리"], ["apps", `입점 신청${pendingApps.length ? ` (${pendingApps.length})` : ""}`], ["bookings", "예약 데이터"]];

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-ink text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <span className="font-extrabold text-lg">스드맵 <span className="text-brand-300">ADMIN</span></span>
          <span className="text-xs text-white/60">직원용 관리자</span>
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
          <section className="py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[["전체 업체", vendors.length], ["활성 업체", vendors.filter(v=>v.status==="active").length], ["총 예약", bookings.length], ["확정 매출", won(revenue)]].map(([l, val]) => (
              <div key={l} className="bg-white border border-line rounded-2xl p-5">
                <div className="text-xs text-muted font-bold">{l}</div>
                <div className="text-2xl font-extrabold text-brand-700 mt-1">{val}</div>
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
                <thead className="bg-brand-50 text-brand-700"><tr><th className="text-left p-3">업체명</th><th className="text-left p-3">카테고리</th><th className="text-left p-3">지역</th><th className="text-left p-3">상태</th><th className="p-3">관리</th></tr></thead>
                <tbody>
                  {vendors.map((v)=>(
                    <tr key={v.id} className="border-t border-line">
                      <td className="p-3 font-bold">{v.name}</td><td className="p-3">{CATS[v.category]}</td><td className="p-3">{v.region}</td>
                      <td className="p-3"><span className={`text-xs font-bold px-2 py-0.5 rounded ${v.status==="active"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>{v.status}</span></td>
                      <td className="p-3 text-center">
                        {v.status!=="active" && <button onClick={()=>setStatus(v.id,"active")} className="text-xs text-brand-700 font-bold mr-2">활성화</button>}
                        {v.status==="active" && <button onClick={()=>setStatus(v.id,"hidden")} className="text-xs text-muted font-bold">숨김</button>}
                      </td>
                    </tr>
                  ))}
                  {vendors.length===0 && <tr><td colSpan="5" className="p-6 text-center text-muted">등록된 업체가 없어요.</td></tr>}
                </tbody>
              </table>
            </div>
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
