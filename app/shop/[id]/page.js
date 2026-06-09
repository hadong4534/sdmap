"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CATS, CAT_IMG, won } from "@/lib/const";
import { useCompare, recordView } from "@/lib/compare";
import Sidebar from "@/components/Sidebar";
import RiskBadge, { riskLevel } from "@/components/RiskBadge";
import AiSummaryCard from "@/components/AiSummaryCard";
import ComparisonMini from "@/components/ComparisonMini";
import TabBar from "@/components/TabBar";

const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });
const TABS = [["ai", "AI 요약"], ["price", "가격"], ["incl", "포함/미포함"], ["extra", "추가금"], ["review", "후기"], ["compare", "비교"]];
const Card = ({ title, children, accent }) => (
  <div className="rounded-2xl border border-line bg-white p-4">
    {title && <div className="font-extrabold text-ink text-sm mb-3">{title}</div>}
    {children}
  </div>
);
function diffRow(label, a, avg) {
  const d = a - avg; const sign = d > 0 ? "+" : "";
  return (
    <div className="flex items-center justify-between py-1.5 text-[13px] border-b border-line last:border-0">
      <span className="text-muted">{label}</span>
      <span className="text-right"><b className="text-ink">{won(a)}</b> <span className={d > 0 ? "text-risk" : "text-safe"}>({sign}{won(d)})</span></span>
    </div>
  );
}

export default function Shop() {
  const { id } = useParams();
  const router = useRouter();
  const [v, setV] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [user, setUser] = useState(null);
  const [fav, setFav] = useState(false);
  const [tab, setTab] = useState("ai");
  const [msg, setMsg] = useState("");
  const { has, toggle } = useCompare();

  useEffect(() => {
    if (!id) return; recordView(id);
    if (!supabase) return;
    supabase.from("vendors").select("*").eq("id", id).maybeSingle().then(async ({ data }) => {
      setV(data);
      if (data) {
        const { data: sim } = await supabase.from("vendors").select("*").eq("category", data.category).eq("status", "active").neq("id", id).limit(5);
        setSimilar(sim || []);
      }
    });
    supabase.from("reviews").select("*").eq("vendor_id", id).order("created_at", { ascending: false }).then(({ data }) => setReviews(data || []));
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user ?? null; setUser(u);
      if (u) { const { data: f } = await supabase.from("favorites").select("vendor_id").eq("user_id", u.id).eq("vendor_id", id).maybeSingle(); setFav(!!f); }
    });
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
    setMsg(error ? "신청 실패: " + error.message : "상담 신청이 접수됐어요. '계약/일정'에서 확인하세요.");
  }

  if (!v) return <main className="min-h-screen flex items-center justify-center text-muted">불러오는 중...</main>;
  const all = [v, ...similar];
  const avg = (k) => Math.round(all.reduce((s, x) => s + (x[k] || 0), 0) / all.length);
  const incl = Array.isArray(v.included_items) ? v.included_items : [];
  const excl = Array.isArray(v.excluded_items) ? v.excluded_items : [];

  const ContentBlocks = (
    <>
      {tab === "ai" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <AiSummaryCard v={v} />
          <Card title="견적 비교 (동일 카테고리 평균 대비)">
            {diffRow("기준가", v.base_price, avg("base_price"))}
            {diffRow("예상 추가금", v.expected_extra_fee, avg("expected_extra_fee"))}
            {diffRow("예상 최종가", v.estimated_final_price, avg("estimated_final_price"))}
          </Card>
          <ComparisonMini vendors={similar.slice(0, 3)} />
          <Card title="추가금 위험도"><div className="text-3xl font-extrabold text-ink">{v.risk_score}<span className="text-base text-muted">/100</span></div><div className="mt-3"><RiskBadge score={v.risk_score} showBar /></div></Card>
          <Card title="미포함 항목">
            <ul className="space-y-1.5">{excl.map((e, i) => (<li key={i} className="flex justify-between text-[13px]"><span className="text-body">{e.name}</span><span className="font-bold text-risk">{e.label}</span></li>))}</ul>
          </Card>
          <Card title="계약 전 꼭 물어볼 질문">
            <ul className="space-y-2">{(v.contract_questions || []).map((q, i) => (<li key={i} className="flex gap-2 text-[13px] text-body"><span className="text-brand-500 font-bold">Q{i + 1}.</span>{q}</li>))}</ul>
          </Card>
        </div>
      )}
      {tab === "price" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Card title="가격 구성"><div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted">기준가</span><b>{won(v.base_price)}</b></div><div className="flex justify-between"><span className="text-muted">예상 추가금</span><b className="text-risk">+{won(v.expected_extra_fee)}</b></div><div className="flex justify-between border-t border-line pt-2 mt-1"><span className="text-muted font-bold">예상 최종가</span><b className="text-brand-700 text-lg">{won(v.estimated_final_price)}</b></div></div></Card>
          <Card title="견적 비교">{diffRow("기준가", v.base_price, avg("base_price"))}{diffRow("최종가", v.estimated_final_price, avg("estimated_final_price"))}</Card>
        </div>
      )}
      {tab === "incl" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Card title="포함 항목"><ul className="space-y-1.5">{incl.map((t, i) => (<li key={i} className="flex gap-2 text-[13px] text-body"><span className="text-safe">✓</span>{t}</li>))}</ul></Card>
          <Card title="미포함 항목 (추가금)"><ul className="space-y-1.5">{excl.map((e, i) => (<li key={i} className="flex justify-between text-[13px]"><span className="text-body">{e.name}</span><span className="font-bold text-risk">{e.label}</span></li>))}</ul></Card>
        </div>
      )}
      {tab === "extra" && (
        <Card title="추가금 체크"><div className="mb-3"><RiskBadge score={v.risk_score} showBar /></div><ul className="space-y-1.5">{excl.map((e, i) => (<li key={i} className="flex justify-between text-[13px]"><span className="text-body">{e.name}</span><span className="font-bold text-risk">{e.label}</span></li>))}</ul><div className="mt-3 text-sm">예상 추가금 합계 <b className="text-risk">{won(v.expected_extra_fee)}</b></div></Card>
      )}
      {tab === "review" && (
        <Card title={`후기 ${reviews.length} · 신뢰도 ${v.review_trust_score}점`}><div className="space-y-2">{reviews.map((r) => (<div key={r.id} className="border border-line rounded-xl p-3"><div className="text-warn font-extrabold text-[13px]" style={{ color: "#E0A12E" }}>{"★".repeat(r.rating)}</div><p className="text-[13px] text-body mt-1">{r.content}</p></div>))}{reviews.length === 0 && <p className="text-muted text-sm">아직 후기가 없어요.</p>}</div></Card>
      )}
      {tab === "compare" && <ComparisonMini vendors={similar} title="같은 카테고리 업체 비교" />}
    </>
  );

  const inCompare = has(id);
  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-8">
        {/* mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur flex items-center justify-between px-4 py-3 border-b border-line">
          <button onClick={() => router.back()} className="text-xl text-ink">‹</button>
          <div className="flex gap-3 text-lg"><button onClick={toggleFav} className="text-brand-500">{fav ? "♥" : "♡"}</button></div>
        </div>
        {/* breadcrumb (PC) */}
        <div className="hidden md:flex items-center justify-between px-8 pt-6">
          <div className="text-[13px] text-muted">홈 › 업체 탐색 › {CATS[v.category]} › <b className="text-ink">{v.name}</b></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4 md:pt-5">
          {/* HERO */}
          <div className="grid md:grid-cols-[1.2fr_1fr] gap-5 items-start">
            <div>
              <div className="rounded-2xl overflow-hidden relative" style={{ aspectRatio: "4/3", ...bg(v.thumbnail_url || CAT_IMG[v.category]) }}>
                <button onClick={toggleFav} className="hidden md:flex absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 items-center justify-center text-brand-500 text-lg">{fav ? "♥" : "♡"}</button>
              </div>
              <div className="flex gap-2 mt-2">{[0,1,2,3,4].map((i) => (<div key={i} className="flex-1 rounded-lg" style={{ aspectRatio: "1/1", ...bg(CAT_IMG[[ "studio","dress","makeup","hall","studio"][i]]) }} />))}</div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-ink">{v.name}</h1>
                {v.review_count > 200 && <span className="text-[11px] font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">인기</span>}
              </div>
              <div className="text-[13px] text-muted mt-1">★ {v.rating} · 후기 {v.review_count} · 후기 신뢰도 <b className="text-ink">{v.review_trust_score}점</b></div>
              <div className="text-[13px] text-muted mt-1">{v.region} · {CATS[v.category]} · {v.type}</div>
              <div className="mt-4 rounded-2xl border border-line bg-white p-4">
                <div className="flex justify-between text-sm"><span className="text-muted font-bold">기준가</span><b>{won(v.base_price)}</b></div>
                <div className="flex justify-between items-end mt-2"><span className="text-muted font-bold text-sm">예상 최종가</span><b className="text-2xl font-extrabold text-brand-700">{won(v.estimated_final_price)}</b></div>
                <div className="mt-2 inline-block text-xs text-risk font-bold bg-[#FFF1EC] rounded-lg px-2.5 py-1.5">추가금 예상 {Math.round((v.expected_extra_min||0)/10000)}~{Math.round((v.expected_extra_max||0)/10000)}만원</div>
              </div>
              <div className="hidden md:flex gap-2 mt-3">
                <button onClick={consult} className="flex-1 h-12 rounded-xl bg-brand-grad text-white font-extrabold">상담 신청</button>
                <button onClick={() => toggle(id)} className={`flex-1 h-12 rounded-xl font-extrabold border ${inCompare ? "bg-brand-600 text-white border-brand-600" : "bg-white text-brand-700 border-brand-200"}`}>{inCompare ? "비교함에 담김 ✓" : "비교함 담기"}</button>
              </div>
              {msg && <p className="text-[12px] text-brand-700 bg-brand-50 rounded-lg px-3 py-2 mt-2">{msg}</p>}
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-1 mt-7 border-b border-line overflow-x-auto no-scrollbar">
            {TABS.map(([k, l]) => (<button key={k} onClick={() => setTab(k)} className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 ${tab === k ? "border-brand-600 text-brand-700" : "border-transparent text-muted"}`}>{l}</button>))}
          </div>
          <div className="py-5">{ContentBlocks}</div>
        </div>
      </div>

      {/* mobile sticky CTA */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-line p-3 z-40">
        <div className="flex gap-2">
          <button onClick={() => toggle(id)} className={`flex-1 h-12 rounded-xl font-extrabold border ${inCompare ? "bg-brand-600 text-white border-brand-600" : "bg-white text-brand-700 border-brand-200"}`}>{inCompare ? "담김 ✓" : "비교함 담기"}</button>
          <button onClick={consult} className="flex-[1.4] h-12 rounded-xl bg-brand-grad text-white font-extrabold">상담 신청</button>
        </div>
      </div>
      <div className="md:hidden"><TabBar active="search" /></div>
    </div>
  );
}
