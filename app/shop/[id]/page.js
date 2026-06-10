"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CATS, CAT_IMG, won } from "@/lib/const";
import { useCompare, recordView } from "@/lib/compare";
import Sidebar from "@/components/Sidebar";
import { AiCheckCard, PriceSummaryCard, RiskGauge, StickyCTA } from "@/components/ui";
import ComparisonMini from "@/components/ComparisonMini";

const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });
const Card = ({ title, children }) => (<div className="rounded-2xl border border-line bg-white p-4">{title && <div className="font-extrabold text-ink text-[16px] mb-3">{title}</div>}{children}</div>);

export default function Shop() {
  const { id } = useParams();
  const router = useRouter();
  const [v, setV] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [user, setUser] = useState(null);
  const [fav, setFav] = useState(false);
  const [msg, setMsg] = useState("");
  const [sheet, setSheet] = useState(null); // "price" | "risk"
  const { has, toggle } = useCompare();

  useEffect(() => {
    if (!id) return; recordView(id);
    if (!supabase) return;
    supabase.from("vendors").select("*").eq("id", id).maybeSingle().then(async ({ data }) => {
      setV(data);
      if (data) { const { data: sim } = await supabase.from("vendors").select("*").eq("category", data.category).eq("status", "active").neq("id", id).limit(4); setSimilar(sim || []); }
    });
    supabase.from("reviews").select("*").eq("vendor_id", id).order("created_at", { ascending: false }).then(({ data }) => setReviews(data || []));
    supabase.auth.getUser().then(async ({ data }) => { const u = data?.user ?? null; setUser(u); if (u) { const { data: f } = await supabase.from("favorites").select("vendor_id").eq("user_id", u.id).eq("vendor_id", id).maybeSingle(); setFav(!!f); } });
  }, [id]);

  async function toggleFav() {
    if (!user) return router.push("/login");
    if (fav) { await supabase.from("favorites").delete().eq("user_id", user.id).eq("vendor_id", id); setFav(false); }
    else { await supabase.from("favorites").insert({ user_id: user.id, vendor_id: id }); setFav(true); }
  }
  async function consult() {
    if (!user) return router.push("/login");
    const { data: prof } = await supabase.from("profiles").select("name, phone").eq("id", user.id).maybeSingle();
    const { error } = await supabase.from("bookings").insert({ user_id: user.id, vendor_id: id, status: "requested", amount: v.base_price, customer_name: prof?.name || "고객", customer_phone: prof?.phone || "", memo: "상담 신청" });
    setMsg(error ? "신청 실패: " + error.message : "상담 신청이 접수됐어요. '마이 > 내 예약/계약'에서 확인하세요.");
  }

  if (!v) return <main className="min-h-screen flex items-center justify-center text-muted">불러오는 중...</main>;
  const imgs = [v.thumbnail_url, ...(Array.isArray(v.images) ? v.images : [])].filter(Boolean);
  const incl = Array.isArray(v.included_items) ? v.included_items : [];
  const excl = Array.isArray(v.excluded_items) ? v.excluded_items : [];
  const inCompare = has(id);

  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-28 md:pb-8">
        <div className="hidden md:block px-8 pt-6 text-[13px] text-muted">홈 › 업체 탐색 › {CATS[v.category]} › <b className="text-ink">{v.name}</b></div>
        <div className="max-w-5xl mx-auto md:px-8 md:pt-4">
          <div className="grid md:grid-cols-[1.2fr_1fr] md:gap-6">
            <div>
              <div className="relative h-64 md:h-auto md:rounded-2xl overflow-hidden md:aspect-[4/3]" style={bg(v.thumbnail_url || CAT_IMG[v.category])}>
                <button onClick={() => router.back()} className="md:hidden absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-xl">‹</button>
                <div className="md:hidden absolute top-4 right-4 flex gap-2">
                  <button onClick={toggleFav} className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-brand-500 text-lg">{fav ? "♥" : "♡"}</button>
                </div>
                {imgs.length > 1 && <span className="absolute bottom-3 right-3 text-[11px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-md">1 / {imgs.length}</span>}
              </div>
              {imgs.length > 1 && <div className="hidden md:flex gap-2 mt-2">{imgs.slice(0,5).map((im,i)=>(<div key={i} className="flex-1 rounded-lg aspect-square" style={bg(im)} />))}</div>}
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
            <Card title="계약 전 꼭 물어볼 질문"><ul className="space-y-2">{(v.contract_questions||[]).map((q,i)=>(<li key={i} className="flex gap-2 text-[14px] text-body"><span className="text-brand-500 font-bold">Q{i+1}.</span>{q}</li>))}</ul></Card>
            <div className="md:col-span-2"><ComparisonMini vendors={similar.slice(0,3)} /></div>
            <div className="md:col-span-2"><Card title={`후기 ${reviews.length} · 신뢰도 ${v.review_trust_score}점`}><div className="space-y-2">{reviews.map((r)=>(<div key={r.id} className="border border-line rounded-xl p-3"><div className="font-extrabold text-[13px]" style={{color:"#E0922A"}}>{"★".repeat(r.rating)}</div><p className="text-[14px] text-body mt-1">{r.content}</p></div>))}{reviews.length===0&&<p className="text-muted text-sm">아직 후기가 없어요.</p>}</div></Card></div>
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
