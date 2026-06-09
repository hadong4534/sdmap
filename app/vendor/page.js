"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const CATS = { studio: "스튜디오", dress: "드레스", makeup: "메이크업", hall: "웨딩홀" };
const won = (n) => (n || 0).toLocaleString() + "원";
const STATUS_KO = { requested: "예약요청", confirmed: "확정", cancelled: "취소", done: "완료" };
const field = "w-full h-11 rounded-lg border border-line px-3 text-sm outline-none focus:border-brand-400 bg-white";

export default function Vendor() {
  const router = useRouter();
  const [ok, setOk] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [tab, setTab] = useState("dash");
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [msg, setMsg] = useState("");

  // store edit form
  const [store, setStore] = useState({ name: "", region: "", phone: "", description: "", thumbnail_url: "" });
  // product form
  const [pf, setPf] = useState({ name: "", price: "", includes: "", instant_bookable: true });
  const [editId, setEditId] = useState(null);
  // cs answer drafts
  const [answers, setAnswers] = useState({});

  const loadAll = useCallback(async (vid) => {
    const [{ data: p }, { data: b }, { data: r }, { data: c }] = await Promise.all([
      supabase.from("products").select("*").eq("vendor_id", vid).order("created_at"),
      supabase.from("bookings").select("*").eq("vendor_id", vid).order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").eq("vendor_id", vid).order("created_at", { ascending: false }),
      supabase.from("cs_inquiries").select("*").eq("vendor_id", vid).order("created_at", { ascending: false }),
    ]);
    setProducts(p || []); setBookings(b || []); setReviews(r || []); setInquiries(c || []);
  }, []);

  useEffect(() => {
    (async () => {
      if (!supabase) { setOk(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data: v } = await supabase.from("vendors").select("*").eq("owner_id", user.id).maybeSingle();
      if (!v) { setOk(false); return; }
      setVendor(v);
      setStore({ name: v.name || "", region: v.region || "", phone: v.phone || "", description: v.description || "", thumbnail_url: v.thumbnail_url || "" });
      setOk(true);
      loadAll(v.id);
    })();
  }, [router, loadAll]);

  async function saveStore() {
    setMsg(""); const { error } = await supabase.from("vendors").update(store).eq("id", vendor.id);
    setMsg(error ? "저장 실패: " + error.message : "매장 정보 저장 완료");
  }
  async function saveProduct() {
    setMsg(""); if (!pf.name || !pf.price) return setMsg("상품명과 가격을 입력하세요.");
    const payload = { vendor_id: vendor.id, name: pf.name, price: parseInt(pf.price, 10) || 0, includes: pf.includes, instant_bookable: pf.instant_bookable };
    const { error } = editId ? await supabase.from("products").update(payload).eq("id", editId) : await supabase.from("products").insert(payload);
    if (error) return setMsg("저장 실패: " + error.message);
    setPf({ name: "", price: "", includes: "", instant_bookable: true }); setEditId(null); loadAll(vendor.id);
  }
  function editProduct(p) { setEditId(p.id); setPf({ name: p.name, price: String(p.price), includes: p.includes || "", instant_bookable: p.instant_bookable }); setTab("products"); }
  async function delProduct(id) { await supabase.from("products").delete().eq("id", id); loadAll(vendor.id); }
  async function setBookingStatus(id, status) { await supabase.from("bookings").update({ status }).eq("id", id); loadAll(vendor.id); }
  async function answerCs(id) {
    const a = answers[id]; if (!a) return;
    await supabase.from("cs_inquiries").update({ answer: a, status: "answered", answered_at: new Date().toISOString() }).eq("id", id);
    loadAll(vendor.id);
  }

  if (ok === null) return <main className="min-h-screen flex items-center justify-center text-muted">불러오는 중...</main>;
  if (ok === false) return <main className="min-h-screen flex flex-col items-center justify-center text-muted text-sm gap-2"><p>연결된 입점 매장이 없어요.</p><a href="/home" className="text-brand-700 font-bold">← 홈으로</a></main>;

  const revenue = bookings.filter((b) => ["confirmed", "done"].includes(b.status)).reduce((s, b) => s + (b.amount || 0), 0);
  const pending = bookings.filter((b) => b.status === "requested").length;
  const openCs = inquiries.filter((c) => c.status === "open").length;
  const customers = Object.values(bookings.reduce((acc, b) => { const k = (b.customer_phone || b.customer_name || b.id); acc[k] = acc[k] || { name: b.customer_name, phone: b.customer_phone, count: 0, last: b.booking_date }; acc[k].count++; return acc; }, {}));

  const TABS = [["dash", "대시보드"], ["bookings", `예약${pending ? ` (${pending})` : ""}`], ["customers", "고객"], ["products", "상품"], ["store", "매장정보"], ["cs", `문의${openCs ? ` (${openCs})` : ""}`], ["reviews", "리뷰"]];

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-brand-grad text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <span className="font-extrabold text-lg">스드맵 파트너</span>
          <span className="text-sm text-white/85">{vendor.name} · {CATS[vendor.category]}</span>
          <a href="/home" className="ml-auto text-xs text-white/80 underline">고객 화면 →</a>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-6">
        <nav className="flex gap-1 border-b border-line overflow-x-auto">
          {TABS.map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-3 text-sm font-bold whitespace-nowrap border-b-2 ${tab === k ? "border-brand-600 text-brand-700" : "border-transparent text-muted"}`}>{label}</button>
          ))}
        </nav>

        {tab === "dash" && (
          <section className="py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[["진행 예약", pending + "건"], ["전체 예약", bookings.length + "건"], ["누적 매출", won(revenue)], ["평점", "★ " + (vendor.rating || 0)]].map(([l, v]) => (
              <div key={l} className="bg-white border border-line rounded-2xl p-5"><div className="text-xs text-muted font-bold">{l}</div><div className="text-2xl font-extrabold text-brand-700 mt-1">{v}</div></div>
            ))}
            <div className="col-span-2 md:col-span-4 bg-white border border-line rounded-2xl p-5">
              <div className="text-sm font-extrabold mb-2">처리할 일</div>
              <div className="text-sm text-body">· 새 예약요청 <b className="text-brand-700">{pending}</b>건 · 미답변 문의 <b className="text-brand-700">{openCs}</b>건</div>
            </div>
          </section>
        )}

        {tab === "bookings" && (
          <section className="py-6 bg-white border border-line rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-brand-50 text-brand-700"><tr><th className="text-left p-3">고객</th><th className="text-left p-3">일시</th><th className="text-right p-3">금액</th><th className="text-left p-3">상태</th><th className="p-3">처리</th></tr></thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-t border-line">
                    <td className="p-3 font-bold">{b.customer_name}<div className="text-xs text-muted font-normal">{b.customer_phone}</div></td>
                    <td className="p-3">{b.booking_date} {b.booking_time}</td>
                    <td className="p-3 text-right font-bold text-brand-700">{won(b.amount)}</td>
                    <td className="p-3"><span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700">{STATUS_KO[b.status]}</span></td>
                    <td className="p-3 text-center whitespace-nowrap">
                      {b.status === "requested" && <button onClick={() => setBookingStatus(b.id, "confirmed")} className="text-xs text-brand-700 font-bold mr-2">확정</button>}
                      {b.status === "confirmed" && <button onClick={() => setBookingStatus(b.id, "done")} className="text-xs text-green-600 font-bold mr-2">완료</button>}
                      {b.status !== "cancelled" && b.status !== "done" && <button onClick={() => setBookingStatus(b.id, "cancelled")} className="text-xs text-rose font-bold">취소</button>}
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-muted">예약이 없어요.</td></tr>}
              </tbody>
            </table>
          </section>
        )}

        {tab === "customers" && (
          <section className="py-6 bg-white border border-line rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-50 text-brand-700"><tr><th className="text-left p-3">고객명</th><th className="text-left p-3">연락처</th><th className="text-center p-3">예약 건수</th><th className="text-left p-3">최근 예약일</th></tr></thead>
              <tbody>
                {customers.map((c, i) => (<tr key={i} className="border-t border-line"><td className="p-3 font-bold">{c.name}</td><td className="p-3">{c.phone}</td><td className="p-3 text-center">{c.count}</td><td className="p-3">{c.last}</td></tr>))}
                {customers.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-muted">고객이 없어요.</td></tr>}
              </tbody>
            </table>
          </section>
        )}

        {tab === "products" && (
          <section className="py-6">
            <div className="bg-white border border-line rounded-2xl p-5 mb-5">
              <h3 className="font-extrabold mb-3">{editId ? "상품 수정" : "상품 추가"}</h3>
              <div className="space-y-2">
                <input className={field} placeholder="상품명 (예: 본식+야외 풀패키지)" value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })} />
                <input className={field} placeholder="정찰가 (숫자)" value={pf.price} onChange={(e) => setPf({ ...pf, price: e.target.value })} />
                <input className={field} placeholder="포함 구성" value={pf.includes} onChange={(e) => setPf({ ...pf, includes: e.target.value })} />
                <label className="flex items-center gap-2 text-sm text-body"><input type="checkbox" checked={pf.instant_bookable} onChange={(e) => setPf({ ...pf, instant_bookable: e.target.checked })} /> 즉시예약 허용</label>
                <div className="flex gap-2">
                  <button onClick={saveProduct} className="h-10 px-5 rounded-lg bg-brand-grad text-white font-bold text-sm">{editId ? "수정 저장" : "추가"}</button>
                  {editId && <button onClick={() => { setEditId(null); setPf({ name: "", price: "", includes: "", instant_bookable: true }); }} className="h-10 px-4 rounded-lg bg-brand-50 text-brand-700 font-bold text-sm">취소</button>}
                </div>
                {msg && <p className="text-xs text-brand-700">{msg}</p>}
              </div>
            </div>
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="bg-white border border-line rounded-xl p-4 flex items-center gap-3">
                  <div className="flex-1"><div className="font-bold text-sm">{p.name} {p.instant_bookable && <span className="text-[10px] text-ok font-bold">즉시예약</span>}</div><div className="text-xs text-muted">{p.includes}</div></div>
                  <div className="font-extrabold text-brand-700">{won(p.price)}</div>
                  <button onClick={() => editProduct(p)} className="text-xs text-brand-700 font-bold">수정</button>
                  <button onClick={() => delProduct(p.id)} className="text-xs text-rose font-bold">삭제</button>
                </div>
              ))}
              {products.length === 0 && <p className="text-center text-muted text-sm py-6">등록된 상품이 없어요.</p>}
            </div>
          </section>
        )}

        {tab === "store" && (
          <section className="py-6 bg-white border border-line rounded-2xl p-5 max-w-xl">
            <h3 className="font-extrabold mb-3">매장 정보</h3>
            <div className="space-y-3">
              <input className={field} placeholder="매장명" value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} />
              <input className={field} placeholder="지역" value={store.region} onChange={(e) => setStore({ ...store, region: e.target.value })} />
              <input className={field} placeholder="전화번호" value={store.phone} onChange={(e) => setStore({ ...store, phone: e.target.value })} />
              <textarea className={field + " h-24 py-2"} placeholder="소개" value={store.description} onChange={(e) => setStore({ ...store, description: e.target.value })} />
              <input className={field} placeholder="대표 이미지 URL" value={store.thumbnail_url} onChange={(e) => setStore({ ...store, thumbnail_url: e.target.value })} />
              <button onClick={saveStore} className="h-11 px-6 rounded-lg bg-brand-grad text-white font-bold text-sm">저장</button>
              {msg && <p className="text-xs text-brand-700">{msg}</p>}
            </div>
          </section>
        )}

        {tab === "cs" && (
          <section className="py-6 space-y-3">
            {inquiries.map((c) => (
              <div key={c.id} className="bg-white border border-line rounded-xl p-4">
                <div className="flex items-center justify-between"><div className="font-bold text-sm">{c.subject || "문의"}</div><span className={`text-xs font-bold px-2 py-0.5 rounded ${c.status === "open" ? "bg-rose/10 text-rose" : "bg-brand-50 text-brand-700"}`}>{c.status === "open" ? "미답변" : "답변완료"}</span></div>
                <p className="text-sm text-body mt-1">{c.content}</p>
                {c.answer ? <p className="text-sm text-brand-700 mt-2 bg-brand-50 rounded-lg p-2">답변: {c.answer}</p> : (
                  <div className="flex gap-2 mt-2">
                    <input className={field} placeholder="답변 입력" value={answers[c.id] || ""} onChange={(e) => setAnswers({ ...answers, [c.id]: e.target.value })} />
                    <button onClick={() => answerCs(c.id)} className="h-11 px-4 rounded-lg bg-brand-grad text-white font-bold text-sm whitespace-nowrap">답변</button>
                  </div>
                )}
              </div>
            ))}
            {inquiries.length === 0 && <p className="text-center text-muted text-sm py-6">문의가 없어요.</p>}
          </section>
        )}

        {tab === "reviews" && (
          <section className="py-6 space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-line rounded-xl p-4">
                <div className="text-warn font-extrabold text-sm">{"★".repeat(r.rating)}<span className="text-muted font-normal"> {r.rating}.0</span></div>
                <p className="text-sm text-body mt-1">{r.content}</p>
              </div>
            ))}
            {reviews.length === 0 && <p className="text-center text-muted text-sm py-6">리뷰가 없어요.</p>}
          </section>
        )}
      </div>
    </div>
  );
}
