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
      <div className="flex items-center justify-between"><span className="text-ink font-extrabold">예상 최종가</span><span className="text-[22px] md:text-[28px] leading-none font-extrabold text-brand-600 whitespace-nowrap">{won(v.estimated_final_price)}</span></div>
    </div>
  );
}

export function AiCheckCard({ v, title = "AI 체크 요약" }) {
  const r = riskLevel(v.risk_score);
  const lines = Array.isArray(v.ai_summary) ? v.ai_summary : [];
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-extrabold text-ink"><span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9z"/></svg></span>{title}</div>
        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg" style={{ color: r.color, background: r.bg }}>위험 {r.label}</span>
      </div>
      <div className="text-[15px] font-bold text-ink">{v.risk_score >= 70 ? "추가비용 확인이 필요해요." : v.risk_score >= 45 ? "추가비용을 미리 확인하세요." : "추가비용 위험이 낮아요."}</div>
      <ul className="mt-2 space-y-1.5">{lines.slice(0, 3).map((t, i) => (<li key={i} className="flex gap-2 text-[14px] text-body leading-relaxed"><span className="text-brand-400 mt-0.5">·</span>{t}</li>))}</ul>
    </div>
  );
}

export function EmptyState({ icon, title, desc, ctaLabel, ctaHref, children }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center">
      <div className="flex justify-center text-brand-400">{icon || (<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>)}</div>
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
    <div className="bg-white border border-line rounded-[18px] overflow-hidden shadow-card">
      <Link href={`/shop/${v.id}`} className="block relative h-36 md:h-44" style={bg(v.thumbnail_url || CAT_IMG[v.category])}>
        <span className="absolute top-2.5 left-2.5 text-[10px] font-extrabold text-brand-700 bg-white/90 px-2 py-0.5 rounded-md">{CATS[v.category]}</span>
        <span className="absolute top-2.5 right-2.5 text-[10px] font-extrabold px-2 py-0.5 rounded-md" style={{ color: r.color, background: r.bg }}>{r.label}</span>
      </Link>
      <div className="p-3 md:p-4">
        <Link href={`/shop/${v.id}`}><div className="font-extrabold text-[14px] md:text-[17px] text-ink leading-tight truncate">{v.name}</div></Link>
        <div className="text-[11.5px] md:text-[13px] text-muted mt-1 truncate">{v.region} · ★ {v.rating} ({v.review_count})</div>
        <div className="mt-2">
          <div className="text-[11px] text-muted">예상 최종가</div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[17px] md:text-[21px] font-extrabold text-brand-600 leading-none">{won(v.estimated_final_price)}</span>
            <span className="text-[11px] text-muted line-through">{won(v.base_price)}</span>
          </div>
        </div>
        <div className="flex gap-1.5 mt-2.5">
          <button onClick={() => toggle(v.id)} className={`flex-1 h-9 rounded-lg text-[12px] font-bold border ${inC ? "bg-brand-500 text-white border-brand-500" : "bg-brand-50 text-brand-700 border-brand-100"}`}>{inC ? "담김 ✓" : "비교"}</button>
          <Link href={`/shop/${v.id}`} className="flex-1 h-9 rounded-lg bg-white border border-line text-body text-[12px] font-bold flex items-center justify-center">상세</Link>
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
    <div className="bg-white border border-line rounded-[18px] p-3 shadow-card flex gap-3">
      <Link href={`/shop/${v.id}`} className="w-28 shrink-0 rounded-2xl relative" style={{ aspectRatio: "1/1", ...bg(v.thumbnail_url || CAT_IMG[v.category]) }}>
        <span className="absolute top-2 left-2 text-[10px] font-extrabold text-brand-700 bg-white/90 px-1.5 py-0.5 rounded">{CATS[v.category]}</span>
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/shop/${v.id}`}><div className="font-extrabold text-[15px] text-ink truncate">{v.name}</div></Link>
        <div className="text-[12px] text-muted mt-0.5 truncate">{v.region} · ★ {v.rating} ({v.review_count})</div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[11px] text-muted">기본 {won(v.base_price)}</span>
          <span className="text-[10.5px] font-extrabold px-1.5 py-0.5 rounded" style={{ color: r.color, background: r.bg }}>추가금 {r.label}</span>
        </div>
        <div className="flex items-end justify-between mt-1 whitespace-nowrap">
          <div><span className="text-[10.5px] text-muted">예상 </span><b className="text-[16px] text-brand-600">{won(v.estimated_final_price)}</b></div>
          <button onClick={() => toggle(v.id)} className={`h-7 px-2.5 rounded-lg text-[11px] font-bold border ${inC ? "bg-brand-500 text-white border-brand-500" : "bg-brand-50 text-brand-700 border-brand-100"}`}>{inC ? "담김 ✓" : "비교"}</button>
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
