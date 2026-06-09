"use client";
import Link from "next/link";
import { CATS, CAT_IMG, won } from "@/lib/const";
import { useCompare } from "@/lib/compare";

const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });

export function riskLevel(s = 0) {
  if (s >= 70) return { label: "높음", color: "#FF8A65", bg: "#FFF1EC" };
  if (s >= 45) return { label: "보통", color: "#E0922A", bg: "#FFF6E6" };
  return { label: "낮음", color: "#41C7A7", bg: "#E8F8F3" };
}

export function RiskBadge({ score, size = "sm" }) {
  const r = riskLevel(score);
  const cls = size === "lg" ? "text-sm px-3 py-1.5" : "text-xs px-2.5 py-1";
  return <span className={`inline-flex items-center gap-1 font-extrabold rounded-lg ${cls}`} style={{ color: r.color, background: r.bg }}>추가금 {r.label} {score}</span>;
}

export function RiskGauge({ score = 0 }) {
  const r = riskLevel(score);
  return (
    <div>
      <div className="flex items-end justify-between mb-1.5"><span className="text-3xl font-extrabold text-ink">{score}<span className="text-base text-muted">/100</span></span><span className="text-sm font-extrabold" style={{ color: r.color }}>{r.label}</span></div>
      <div className="h-2.5 rounded-full bg-line overflow-hidden"><div className="h-full rounded-full" style={{ width: `${score}%`, background: r.color }} /></div>
      <div className="flex justify-between text-[11px] text-muted mt-1"><span>낮음</span><span>보통</span><span>높음</span></div>
    </div>
  );
}

export function SectionHeader({ title, sub, more }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div><h3 className="text-lg md:text-[22px] font-extrabold text-ink leading-tight">{title}</h3>{sub && <p className="text-[13px] text-muted mt-0.5">{sub}</p>}</div>
      {more && <Link href={more} className="text-[13px] text-brand-600 font-bold shrink-0">전체보기 ›</Link>}
    </div>
  );
}

export function CategoryChip({ label, active, href }) {
  const C = href ? Link : "button";
  return <C href={href} className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${active ? "bg-brand-500 text-white" : "bg-white border border-line text-body"}`}>{label}</C>;
}

export function PriceSummaryCard({ v, className = "" }) {
  return (
    <div className={`rounded-2xl border border-line bg-white p-4 ${className}`}>
      <div className="flex items-center justify-between text-[15px]"><span className="text-muted font-bold">기본 견적</span><span className="font-bold text-ink text-lg">{won(v.base_price)}</span></div>
      <div className="flex items-center justify-between text-[15px] mt-2"><span className="text-muted font-bold">예상 추가 비용</span><span className="font-extrabold text-risk">+{won(v.expected_extra_fee)}</span></div>
      <div className="border-t border-line my-3" />
      <div className="flex items-center justify-between"><span className="text-ink font-extrabold">예상 최종가</span><span className="text-[28px] leading-none font-extrabold text-brand-600">{won(v.estimated_final_price)}</span></div>
    </div>
  );
}

export function AiCheckCard({ v, title = "AI 체크 요약" }) {
  const r = riskLevel(v.risk_score);
  const lines = Array.isArray(v.ai_summary) ? v.ai_summary : [];
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-extrabold text-ink"><span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-sm">✦</span>{title}</div>
        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg" style={{ color: r.color, background: r.bg }}>위험 {r.label}</span>
      </div>
      <div className="text-[15px] font-bold text-ink">{v.risk_score >= 70 ? "추가비용 확인이 필요해요." : v.risk_score >= 45 ? "추가비용을 미리 확인하세요." : "추가비용 위험이 낮아요."}</div>
      <ul className="mt-2 space-y-1.5">{lines.slice(0, 3).map((t, i) => (<li key={i} className="flex gap-2 text-[14px] text-body leading-relaxed"><span className="text-brand-400 mt-0.5">·</span>{t}</li>))}</ul>
    </div>
  );
}

export function EmptyState({ icon = "🗂", title, desc, ctaLabel, ctaHref, children }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center">
      <div className="text-4xl">{icon}</div>
      <div className="text-lg font-extrabold text-ink mt-3">{title}</div>
      {desc && <p className="text-[14px] text-muted mt-1.5 max-w-md mx-auto leading-relaxed">{desc}</p>}
      {ctaHref && <Link href={ctaHref} className="inline-block mt-4 h-11 leading-[44px] px-6 rounded-xl bg-brand-500 text-white font-bold text-sm">{ctaLabel}</Link>}
      {children}
    </div>
  );
}

export function VendorCard({ v }) {
  const { has, toggle } = useCompare();
  const r = riskLevel(v.risk_score);
  const inC = has(v.id);
  return (
    <div className="bg-white border border-line rounded-[20px] overflow-hidden shadow-card">
      <Link href={`/shop/${v.id}`} className="block relative h-44" style={bg(v.thumbnail_url || CAT_IMG[v.category])}>
        <span className="absolute top-3 left-3 text-[11px] font-extrabold text-brand-700 bg-white/90 px-2 py-0.5 rounded-md">{CATS[v.category]}</span>
        {v.review_count > 200 && <span className="absolute top-3 right-3 text-[11px] font-extrabold text-white bg-brand-500/90 px-2 py-0.5 rounded-md">추천</span>}
      </Link>
      <div className="p-4">
        <Link href={`/shop/${v.id}`}><div className="font-extrabold text-[18px] text-ink leading-tight truncate">{v.name}</div></Link>
        <div className="text-[13px] text-muted mt-1">{v.region} · ★ {v.rating} <span className="text-muted">({v.review_count}) · 신뢰 {v.review_trust_score}</span></div>
        <div className="mt-3 flex items-center justify-between">
          <div><div className="text-[12px] text-muted">예상 최종가</div><div className="text-[22px] font-extrabold text-brand-600 leading-tight">{won(v.estimated_final_price)}</div><div className="text-[12px] text-muted line-through">{won(v.base_price)}</div></div>
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg" style={{ color: r.color, background: r.bg }}>추가금 {r.label}</span>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => toggle(v.id)} className={`flex-1 h-10 rounded-xl text-[13px] font-bold border ${inC ? "bg-brand-500 text-white border-brand-500" : "bg-brand-50 text-brand-700 border-brand-100"}`}>{inC ? "담김 ✓" : "비교함 담기"}</button>
          <Link href={`/shop/${v.id}`} className="flex-1 h-10 rounded-xl bg-white border border-line text-body text-[13px] font-bold flex items-center justify-center">상세 보기</Link>
        </div>
      </div>
    </div>
  );
}

export function VendorListItem({ v }) {
  const { has, toggle } = useCompare();
  const r = riskLevel(v.risk_score);
  const inC = has(v.id);
  return (
    <div className="bg-white border border-line rounded-[20px] p-3 shadow-card flex gap-3.5">
      <Link href={`/shop/${v.id}`} className="w-32 shrink-0 rounded-2xl relative" style={{ aspectRatio: "1/1", ...bg(v.thumbnail_url || CAT_IMG[v.category]) }}>
        <span className="absolute top-2 left-2 text-[10px] font-extrabold text-brand-700 bg-white/90 px-1.5 py-0.5 rounded">{CATS[v.category]}</span>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/shop/${v.id}`}><div className="font-extrabold text-[17px] text-ink truncate">{v.name}</div></Link>
        <div className="text-[12.5px] text-muted mt-0.5">{v.region} · ★ {v.rating} ({v.review_count})</div>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-[12px] text-muted">기본 {won(v.base_price)}</span>
          <span className="text-xs font-extrabold px-2 py-0.5 rounded-md" style={{ color: r.color, background: r.bg }}>추가금 {r.label}</span>
        </div>
        <div className="flex items-end justify-between mt-1.5">
          <div><span className="text-[11px] text-muted">예상 최종가 </span><b className="text-[19px] text-brand-600">{won(v.estimated_final_price)}</b></div>
          <button onClick={() => toggle(v.id)} className={`h-8 px-3 rounded-lg text-[12px] font-bold border ${inC ? "bg-brand-500 text-white border-brand-500" : "bg-brand-50 text-brand-700 border-brand-100"}`}>{inC ? "담김 ✓" : "비교"}</button>
        </div>
      </div>
    </div>
  );
}

export function StickyCTA({ onCompare, onConsult, inCompare }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-line p-3 pb-[max(env(safe-area-inset-bottom),12px)] z-50 md:hidden">
      <div className="max-w-2xl mx-auto flex gap-2">
        <button onClick={onCompare} className={`flex-1 h-13 min-h-[52px] rounded-xl font-extrabold text-[15px] border ${inCompare ? "bg-brand-500 text-white border-brand-500" : "bg-white text-brand-700 border-brand-200"}`}>{inCompare ? "비교함에 담김 ✓" : "비교함 담기"}</button>
        <button onClick={onConsult} className="flex-[1.3] h-13 min-h-[52px] rounded-xl bg-brand-500 text-white font-extrabold text-[15px]">상담 요청하기</button>
      </div>
    </div>
  );
}
