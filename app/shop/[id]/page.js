"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CATS, CAT_IMG, won } from "@/lib/const";
import { useCompare, recordView } from "@/lib/compare";
import Sidebar from "@/components/Sidebar";
import { AiCheckCard, PriceSummaryCard, RiskGauge, StickyCTA, InfoSheet } from "@/components/ui";
import ComparisonMini from "@/components/ComparisonMini";

const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });
const Card = ({ title, children }) => (<div className="rounded-[20px] bg-white shadow-[0_4px_16px_rgba(37,34,54,0.06)] p-4">{title && <div className="font-extrabold text-ink text-[16px] mb-3">{title}</div>}{children}</div>);

export default function Shop() {
  const { id } = useParams();
  const router = useRouter();
  const [v, setV] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [products, setProducts] = useState([]);
  const [ask, setAsk] = useState({ subject: "", content: "" });
  const [askMsg, setAskMsg] = useState("");
  const [user, setUser] = useState(null);
  const [fav, setFav] = useState(false);
  const [msg, setMsg] = useState("");
  const [sheet, setSheet] = useState(null); // "price" | "risk"
  const [gIdx, setGIdx] = useState(0);
  const [viewer, setViewer] = useState(-1);
  const [canReview, setCanReview] = useState(false);
  const [myReview, setMyReview] = useState(null);
  const [rv, setRv] = useState({ rating: 5, content: "" });
  const [rvMsg, setRvMsg] = useState("");
  const { has, toggle } = useCompare();

  useEffect(() => {
    if (!id) return; recordView(id);
    if (!supabase) return;
    supabase.from("vendors").select("*").eq("id", id).maybeSingle().then(async ({ data }) => {
      setV(data);
      if (data) { const { data: sim } = await supabase.from("vendors").select("*").eq("category", data.category).eq("status", "active").neq("id", id).limit(4); setSimilar(sim || []); }
    });
    supabase.from("reviews").select("*").eq("vendor_id", id).order("created_at", { ascending: false }).then(({ data }) => setReviews(data || []));
    supabase.from("products").select("*").eq("vendor_id", id).order("created_at").then(({ data }) => setProducts(data || []));
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user ?? null; setUser(u);
      if (u) {
        const { data: f } = await supabase.from("favorites").select("vendor_id").eq("user_id", u.id).eq("vendor_id", id).maybeSingle(); setFav(!!f);
        const [{ data: bk }, { data: mr }] = await Promise.all([
          supabase.from("bookings").select("id").eq("user_id", u.id).eq("vendor_id", id).in("status", ["confirmed", "done"]).limit(1),
          supabase.from("reviews").select("id").eq("user_id", u.id).eq("vendor_id", id).maybeSingle(),
        ]);
        setCanReview((bk || []).length > 0); setMyReview(mr);
      }
    });
  }, [id]);

  async function toggleFav() {
    if (!user) return router.push("/login");
    if (fav) { await supabase.from("favorites").delete().eq("user_id", user.id).eq("vendor_id", id); setFav(false); }
    else { await supabase.from("favorites").insert({ user_id: user.id, vendor_id: id }); setFav(true); }
  }
  async function sendAsk() {
    setAskMsg("");
    if (!user) return router.push("/login");
    if (!ask.subject || !ask.content) return setAskMsg("제목과 내용을 입력해 주세요.");
    const { error } = await supabase.from("cs_inquiries").insert({ user_id: user.id, vendor_id: id, subject: ask.subject, content: ask.content, status: "open" });
    if (error) return setAskMsg("접수 실패: " + error.message);
    setAsk({ subject: "", content: "" }); setAskMsg("문의가 접수됐어요. 답변은 알림으로 알려드릴게요.");
  }
  async function consult() {
    if (!user) return router.push("/login");
    const { data: prof } = await supabase.from("profiles").select("name, phone").eq("id", user.id).maybeSingle();
    const { error } = await supabase.from("bookings").insert({ user_id: user.id, vendor_id: id, status: "requested", amount: v.base_price, customer_name: prof?.name || "고객", customer_phone: prof?.phone || "", memo: "상담 신청" });
    setMsg(error ? "신청 실패: " + error.message : "상담 신청이 접수됐어요. '마이 > 내 예약/계약'에서 확인하세요.");
  }

  async function submitReview() {
    setRvMsg("");
    if (!rv.content.trim()) return setRvMsg("후기 내용을 적어주세요.");
    const { error } = await supabase.from("reviews").insert({ user_id: user.id, vendor_id: id, rating: rv.rating, content: rv.content.trim() });
    if (error) return setRvMsg("등록 실패: " + error.message);
    setRvMsg("후기가 등록됐어요. 감사합니다!"); setMyReview({}); setRv({ rating: 5, content: "" });
    const { data } = await supabase.from("reviews").select("*").eq("vendor_id", id).order("created_at", { ascending: false });
    setReviews(data || []);
  }

  if (!v) return <main className="min-h-screen flex items-center justify-center text-muted">불러오는 중...</main>;
  const imgs = [v.thumbnail_url, ...(Array.isArray(v.images) ? v.images : [])].filter(Boolean);
  const incl = Array.isArray(v.included_items) ? v.included_items : [];
  const excl = Array.isArray(v.excluded_items) ? v.excluded_items : [];
  const inCompare = has(id);

  return (
    <div className="min-h-screen bg-aurora md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-28 md:pb-8">
        <div className="hidden md:block px-8 pt-6 text-[13px] text-muted">홈 › 업체 탐색 › {CATS[v.category]} › <b className="text-ink">{v.name}</b></div>
        <div className="max-w-5xl mx-auto md:px-8 md:pt-4">
          <div className="grid md:grid-cols-[1.2fr_1fr] md:gap-6">
            <div>
              <div className="relative h-64 md:h-auto md:rounded-2xl overflow-hidden md:aspect-[4/3]">
                <div
                  className="md:hidden flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
                  onScroll={(e) => setGIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
                >
                  {(imgs.length ? imgs : [CAT_IMG[v.category]]).map((im, i) => (
                    <div key={i} onClick={() => setViewer(i)} className="w-full h-full shrink-0 snap-center cursor-zoom-in" style={bg(im)} />
                  ))}
                </div>
                <div className="hidden md:block w-full h-full cursor-zoom-in" onClick={() => setViewer(Math.min(gIdx, Math.max(imgs.length - 1, 0)))} style={bg(imgs[Math.min(gIdx, Math.max(imgs.length - 1, 0))] || CAT_IMG[v.category])} />
                {imgs.length > 1 && (
                  <>
                    <button onClick={() => setGIdx((gIdx - 1 + imgs.length) % imgs.length)} className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 items-center justify-center text-xl text-ink shadow">‹</button>
                    <button onClick={() => setGIdx((gIdx + 1) % imgs.length)} className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 items-center justify-center text-xl text-ink shadow">›</button>
                  </>
                )}
                <button onClick={() => router.back()} className="md:hidden absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-xl">‹</button>
                <div className="md:hidden absolute top-4 right-4 flex gap-2">
                  <button onClick={toggleFav} className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-brand-500 text-lg">{fav ? "♥" : "♡"}</button>
                </div>
                {imgs.length > 1 && (
                  <>
                    <span className="absolute bottom-3 right-3 text-[11px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-md">{Math.min(gIdx + 1, imgs.length)} / {imgs.length}</span>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {imgs.map((_, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full ${i === Math.min(gIdx, imgs.length - 1) ? "bg-white" : "bg-white/45"}`} />)}
                    </div>
                  </>
                )}
              </div>
              {imgs.length > 1 && <div className="hidden md:flex gap-2 mt-2">{imgs.slice(0, 5).map((im, i) => (<button key={i} onClick={() => setGIdx(i)} className={`flex-1 rounded-lg aspect-square border-2 ${i === Math.min(gIdx, imgs.length - 1) ? "border-brand-500" : "border-transparent opacity-80"}`} style={bg(im)} />))}</div>}
            </div>
            <div className="px-4 md:px-0 pt-4 md:pt-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">{CATS[v.category]}</span>
                {v.review_count > 200 && <span className="text-[11px] font-extrabold text-white bg-brand-500 px-2 py-0.5 rounded-md">추천</span>}
              </div>
              <h1 className="text-[24px] font-extrabold text-ink mt-1.5 leading-tight">{v.name}</h1>
              <div className="text-[14px] text-muted mt-1">★ {v.rating} · 후기 {v.review_count} · 후기 신뢰도 <b className="text-ink">{v.review_trust_score}점</b></div>
              <div className="text-[14px] text-muted mt-0.5">{v.region} · {v.type}</div>
              <div className="mt-4"><PriceSummaryCard v={v} onWhy={() => setSheet("price")} /></div>
              <button onClick={() => setSheet("ask")} className="mt-2 text-[12.5px] font-bold text-brand-600 underline underline-offset-2">업체에 직접 문의하기</button>
              <div className="hidden md:flex gap-2 mt-3">
                <button onClick={() => toggle(id)} className={`flex-1 h-12 rounded-xl font-extrabold border ${inCompare ? "bg-brand-500 text-white border-brand-500" : "bg-white text-brand-700 border-brand-200"}`}>{inCompare ? "비교함에 담김 ✓" : "비교함 담기"}</button>
                <button onClick={consult} className="flex-1 h-12 rounded-xl bg-brand-500 text-white font-extrabold">상담 요청하기</button>
              </div>
            </div>
          </div>

          <div className="px-4 md:px-0 mt-6 space-y-3 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            <div className="md:col-span-2"><AiCheckCard v={v} title="AI 체크 요약" /></div>
            <Card title="추가금 위험도"><RiskGauge score={v.risk_score} /><button onClick={() => setSheet("risk")} className="mt-3 text-[12px] font-bold text-brand-600 underline underline-offset-2">위험도는 어떻게 정해지나요?</button></Card>
            <Card title="미포함 항목 (추가금 주의)"><ul className="space-y-1.5">{excl.map((e,i)=>(<li key={i} className="flex justify-between text-[14px]"><span className="text-body">{e.name}</span><span className="font-bold text-risk">{e.label}</span></li>))}{excl.length===0&&<li className="text-muted text-sm">미포함 항목 없음</li>}</ul></Card>
            <Card title="포함 항목"><ul className="space-y-1.5">{incl.map((t,i)=>(<li key={i} className="flex gap-2 text-[14px] text-body"><span className="text-safe">✓</span>{t}</li>))}</ul></Card>
            {products.length > 0 && (
              <Card title="상품 · 패키지">
                <div className="space-y-2.5">
                  {products.map((p) => (
                    <div key={p.id} className="border border-line rounded-xl p-3.5">
                      <div className="flex items-center justify-between">
                        <b className="text-[14px] text-ink">{p.name}</b>
                        <b className="text-[15px] text-brand-700">{won(p.price)}</b>
                      </div>
                      {p.includes && <p className="text-[12.5px] text-muted mt-1">{p.includes}</p>}
                      {p.instant_bookable && <span className="inline-block mt-1.5 text-[10.5px] font-extrabold text-[#1FA888] bg-[#E8F8F3] px-2 py-0.5 rounded">즉시 예약 가능</span>}
                    </div>
                  ))}
                </div>
              </Card>
            )}
            <Card title="계약 전 꼭 물어볼 질문"><ul className="space-y-2">{(v.contract_questions||[]).map((q,i)=>(<li key={i} className="flex gap-2 text-[14px] text-body"><span className="text-brand-500 font-bold">Q{i+1}.</span>{q}</li>))}</ul></Card>
            <div className="md:col-span-2"><ComparisonMini vendors={similar.slice(0,3)} /></div>
            <div className="md:col-span-2"><Card title={`후기 ${reviews.length} · 신뢰도 ${v.review_trust_score}점`}>
              {user && canReview && !myReview && (
                <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50/50 p-3.5">
                  <div className="text-[13px] font-extrabold text-ink">계약 고객 후기 쓰기</div>
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => setRv({ ...rv, rating: n })} className={`text-[22px] leading-none ${n <= rv.rating ? "text-[#E0922A]" : "text-line"}`}>★</button>
                    ))}
                  </div>
                  <textarea value={rv.content} onChange={(e) => setRv({ ...rv, content: e.target.value })} rows={3} placeholder="상담·계약 경험을 솔직하게 남겨주세요. 추가금이 있었는지도 알려주시면 다른 커플에게 큰 도움이 돼요." className="w-full mt-2 rounded-xl border border-line px-3 py-2.5 text-sm bg-white resize-none outline-none focus:border-brand-400" />
                  <button onClick={submitReview} className="mt-2 h-10 px-5 rounded-xl bg-brand-500 text-white text-[13px] font-bold">등록하기</button>
                </div>
              )}
              {user && !canReview && !myReview && <p className="mb-3 text-[12px] text-muted">후기는 이 업체와 상담을 확정·완료한 고객만 작성할 수 있어요.</p>}
              {rvMsg && <p className="mb-3 text-[12px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{rvMsg}</p>}
              <div className="space-y-2">{reviews.map((r)=>(<div key={r.id} className="border border-line rounded-xl p-3"><div className="font-extrabold text-[13px]" style={{color:"#E0922A"}}>{"★".repeat(r.rating)}</div><p className="text-[14px] text-body mt-1">{r.content}</p></div>))}{reviews.length===0&&<p className="text-muted text-sm">아직 후기가 없어요.</p>}</div></Card></div>
          </div>
          {msg && <p className="mx-4 md:mx-0 mt-4 text-[13px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{msg}</p>}
        </div>
      </div>

      <InfoSheet open={sheet === "price"} onClose={() => setSheet(null)} title="예상 최종가 계산 내역">
        <div className="space-y-2 text-[14px]">
          <div className="flex justify-between"><span className="text-muted">기준가 (업체 공개 가격)</span><b className="text-ink">{won(v.base_price)}</b></div>
          <div className="pt-1 text-[12px] font-bold text-muted">+ 미포함 항목 (계약 시 추가될 수 있는 비용)</div>
          {excl.map((e, i) => (<div key={i} className="flex justify-between pl-2"><span className="text-body">{e.name}</span><span className="font-bold text-risk">{e.label}</span></div>))}
          {excl.length === 0 && <div className="pl-2 text-muted text-[13px]">미포함 항목 없음</div>}
          <div className="flex justify-between border-t border-line pt-2"><span className="text-muted">예상 추가금</span><b className="text-risk">+{won(v.expected_extra_fee)}</b></div>
          <div className="flex justify-between"><span className="font-extrabold text-ink">예상 최종가</span><b className="text-brand-600 text-[18px]">{won(v.estimated_final_price)}</b></div>
        </div>
      </InfoSheet>

      {viewer >= 0 && imgs.length > 0 && (
        <div className="fixed inset-0 z-[70] bg-black/95 flex flex-col" onClick={() => setViewer(-1)}>
          <div className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3 text-white">
            <span className="text-[13px] font-bold">{viewer + 1} / {imgs.length}</span>
            <button onClick={() => setViewer(-1)} className="text-2xl leading-none px-2">×</button>
          </div>
          <div className="flex-1 relative" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgs[viewer]} alt="" className="absolute inset-0 w-full h-full object-contain" />
            {imgs.length > 1 && (
              <>
                <button onClick={() => setViewer((viewer - 1 + imgs.length) % imgs.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 text-white text-2xl flex items-center justify-center">‹</button>
                <button onClick={() => setViewer((viewer + 1) % imgs.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 text-white text-2xl flex items-center justify-center">›</button>
              </>
            )}
          </div>
          <div className="flex justify-center gap-1.5 pb-[max(env(safe-area-inset-bottom),20px)] pt-3">
            {imgs.map((_, i) => <button key={i} onClick={(e) => { e.stopPropagation(); setViewer(i); }} className={`w-2 h-2 rounded-full ${i === viewer ? "bg-white" : "bg-white/35"}`} />)}
          </div>
        </div>
      )}
      <InfoSheet open={sheet === "ask"} onClose={() => setSheet(null)} title={`${v.name}에 문의하기`}>
        <div className="space-y-2">
          <input value={ask.subject} onChange={(e) => setAsk({ ...ask, subject: e.target.value })} placeholder="제목 (예: 주말 예약 가능 여부)" className="w-full h-11 rounded-xl border border-line px-3 text-sm bg-white outline-none focus:border-brand-400" />
          <textarea value={ask.content} onChange={(e) => setAsk({ ...ask, content: e.target.value })} rows={4} placeholder="문의 내용을 적어주세요" className="w-full rounded-xl border border-line px-3 py-2.5 text-sm bg-white resize-none outline-none focus:border-brand-400" />
          <button onClick={sendAsk} className="w-full h-11 rounded-xl bg-brand-500 text-white text-sm font-bold">문의 보내기</button>
          {askMsg && <p className="text-[12px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2">{askMsg}</p>}
        </div>
      </InfoSheet>
      <InfoSheet open={sheet === "risk"} onClose={() => setSheet(null)} title="추가금 위험도 산정 기준">
        <p className="text-[14px] text-body leading-relaxed">위험도 <b>{v.risk_score}점</b>은 <b>미포함(추가 비용) 항목의 개수와 금액 규모</b>를 기준으로 계산해요.</p>
        <div className="mt-3 space-y-1.5 text-[13.5px]">
          <div className="flex justify-between"><span className="text-muted">미포함 항목 수</span><b className="text-ink">{excl.length}개</b></div>
          <div className="flex justify-between"><span className="text-muted">예상 추가금 합계</span><b className="text-risk">+{won(v.expected_extra_fee)}</b></div>
          <div className="flex justify-between"><span className="text-muted">기준가 대비 추가금 비율</span><b className="text-ink">{v.base_price ? Math.round((v.expected_extra_fee / v.base_price) * 100) : 0}%</b></div>
        </div>
        <p className="text-[13px] text-body mt-3 leading-relaxed">점수가 높을수록 계약 전에 확인할 항목이 많다는 뜻이에요. ‘계약 전 꼭 물어볼 질문’을 상담에서 확인해 보세요.</p>
      </InfoSheet>
      <StickyCTA inCompare={inCompare} onCompare={() => toggle(id)} onConsult={consult} />
    </div>
  );
}
