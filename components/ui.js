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
      <div className="flex items-end justify-between mb-2"><span className="text-[46px] leading-none font-black text-ink tracking-tight">{score}<span className="text-[15px] text-muted font-bold ml-1">/ 100</span></span><span className="text-sm font-extrabold px-2.5 py-1 rounded-lg" style={{ color: r.color, background: r.bg }}>{r.label}</span></div>
      <div className="h-3 rounded-full bg-line overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, background: `linear-gradient(90deg, ${r.color}88, ${r.color})` }} /></div>
      <div className="flex justify-between text-[11px] text-muted mt-1"><span>낮음</span><span>보통</span><span>높음</span></div>
    </div>
  );
}

export function SectionHeader({ title, sub, more }) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div><h3 className="text-[20px] md:text-[23px] font-extrabold text-ink leading-tight tracking-tight">{title}</h3>{sub && <p className="text-[13px] text-muted mt-0.5">{sub}</p>}</div>
      {more && <Link href={more} className="text-[13px] text-brand-600 font-bold shrink-0">전체보기 ›</Link>}
    </div>
  );
}

export function CategoryChip({ label, active, href }) {
  const C = href ? Link : "button";
  return <C href={href} className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ${active ? "bg-brand-500 text-white" : "bg-white border border-line text-body"}`}>{label}</C>;
}

export function PriceSummaryCard({ v, className = "", onWhy }) {
  return (
    <div className={`rounded-[22px] bg-white p-5 shadow-[0_10px_30px_rgba(139,111,232,0.13)] ${className}`}>
      <div className="flex items-center justify-between text-[15px]"><span className="text-muted font-bold">기본 견적</span><span className="font-bold text-ink text-lg">{won(v.base_price)}</span></div>
      <div className="flex items-center justify-between text-[15px] mt-2"><span className="text-muted font-bold">예상 추가 비용</span><span className="font-extrabold text-risk">+{won(v.expected_extra_fee)}</span></div>
      <div className="border-t border-line my-3" />
      <div className="flex items-center justify-between"><span className="text-ink font-extrabold">예상 최종가</span><span className="text-[30px] md:text-[34px] leading-none font-black text-ink whitespace-nowrap tracking-tight">{won(v.estimated_final_price)}</span></div>
      {onWhy && <button onClick={onWhy} className="mt-2.5 text-[12px] font-bold text-brand-600 underline underline-offset-2">어떻게 계산했나요?</button>}
    </div>
  );
}

export function AiCheckCard({ v, title = "AI 체크 요약" }) {
  const r = riskLevel(v.risk_score);
  const lines = Array.isArray(v.ai_summary) ? v.ai_summary : [];
  return (
    <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-4">
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
    <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] px-6 py-10 text-center">
      <div className="flex justify-center text-brand-400">{icon || (<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/></svg>)}</div>
      <div className="text-lg font-extrabold text-ink mt-3">{title}</div>
      {desc && <p className="text-[14px] text-muted mt-1.5 max-w-md mx-auto leading-relaxed">{desc}</p>}
      {ctaHref && <Link href={ctaHref} className="inline-block mt-4 h-11 leading-[44px] px-6 rounded-xl bg-brand-500 text-white font-bold text-sm">{ctaLabel}</Link>}
      {children}
    </div>
  );
}

export function VendorCard({ v, rank }) {
  const { has, toggle } = useCompare();
  const r = riskLevel(v.risk_score);
  const inC = has(v.id);
  return (
    <div className="bg-white rounded-[22px] overflow-hidden shadow-[0_10px_30px_rgba(139,111,232,0.13)] press">
      <Link href={`/shop/${v.id}`} className="block relative h-36 md:h-44" style={bg(v.thumbnail_url || CAT_IMG[v.category])}>
        {rank && <span className="absolute top-1.5 left-3 text-[30px] font-black italic text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] leading-none">{rank}</span>}
        {!rank && <span className="absolute top-2.5 left-2.5 text-[10px] font-extrabold text-brand-700 bg-white/90 px-2 py-0.5 rounded-md">{CATS[v.category]}</span>}
        <span className="absolute top-2.5 right-2.5 text-[10px] font-extrabold px-2 py-0.5 rounded-md" style={{ color: r.color, background: r.bg }}>{r.label}</span>
      </Link>
      <div className="p-3 md:p-4">
        <Link href={`/shop/${v.id}`}><div className="font-extrabold text-[14px] md:text-[17px] text-ink leading-tight truncate">{v.name}</div></Link>
        <div className="text-[11.5px] md:text-[13px] text-muted mt-1 truncate">{v.region} · ★ {v.rating} ({v.review_count})</div>
        <div className="mt-2">
          <div className="text-[11px] text-muted">예상 최종가</div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-[19px] md:text-[22px] font-extrabold text-brand-700 leading-none tracking-tight">{won(v.estimated_final_price)}</span>
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
    <div className="bg-white rounded-[20px] p-3 shadow-[0_8px_24px_rgba(139,111,232,0.11)] flex gap-3 press">
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

const _qmColor = {
  studio: { bg: "linear-gradient(135deg,#EFE9FF,#E3D8FE)", fg: "#7A5FE0" },
  dress: { bg: "linear-gradient(135deg,#FDEFF6,#F9DEEC)", fg: "#D6679F" },
  makeup: { bg: "linear-gradient(135deg,#FFF2E8,#FCE3CE)", fg: "#E08A4A" },
  hall: { bg: "linear-gradient(135deg,#EAF3FC,#D9E9F8)", fg: "#5E8FBC" },
  snap: { bg: "linear-gradient(135deg,#E9F8F3,#D7F1E8)", fg: "#2FA88C" },
  suit: { bg: "linear-gradient(135deg,#ECECFE,#DEDEFB)", fg: "#6366F1" },
  ring: { bg: "linear-gradient(135deg,#FFF7E5,#FBECC8)", fg: "#D9A21B" },
  invitation: { bg: "linear-gradient(135deg,#FFF0F0,#FBDADA)", fg: "#D66A6A" },
  honeymoon: { bg: "linear-gradient(135deg,#E8F6FB,#D2EBF6)", fg: "#3E9BC4" },
  dol: { bg: "linear-gradient(135deg,#F0FAE9,#DEF2D0)", fg: "#5FA838" },
  more: { bg: "linear-gradient(135deg,#F3F2F7,#E9E7F0)", fg: "#6E6880" },
};
const _qmIcon = {
  studio: <g key="a"><rect x="3" y="7" width="18" height="12" rx="2.5"/><circle cx="12" cy="13" r="3.2"/><path d="M8 7l1.4-2h5L16 7"/></g>,
  dress: <g key="b"><path d="M10 3l2 2 2-2M12 5v3M9 8l-3 11h12L15 8a3 3 0 00-6 0z"/></g>,
  makeup: <g key="c"><path d="M5 19l8-8M14 7l3 3M13 10l2.5-6 3.5 3.5-6 2.5"/><circle cx="7" cy="17" r="1.6"/></g>,
  hall: <g key="d"><path d="M3 21V9l9-5 9 5v12M9 21v-6h6v6"/></g>,
  snap: <g key="e"><rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.5" cy="10" r="1.6"/><path d="M21 16l-5-5L5 19"/></g>,
  suit: <g key="f"><path d="M12 3a1.8 1.8 0 00-1 3.4L4 12v3h16v-3l-7-5.6A1.8 1.8 0 0012 3z"/></g>,
  ring: <g key="g"><circle cx="12" cy="14" r="5.5"/><path d="M9 9l3-4 3 4"/></g>,
  invitation: <g key="i"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 8l9 6 9-6"/></g>,
  honeymoon: <g key="j"><path d="M2 16l20-7-9 4-2 6-2-4-7 1z"/></g>,
  dol: <g key="k"><path d="M5 21h14M6 21v-6a6 6 0 0112 0v6"/><path d="M12 9V6M10.5 4.5L12 6l1.5-1.5"/></g>,
  more: <g key="h"><circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/></g>,
};
export function IconQuickMenu({ categories = [] }) {
  const items = categories.length
    ? categories
    : [["studio","스튜디오","active"],["dress","드레스","active"],["makeup","메이크업","active"],["hall","웨딩홀","active"]].map(([key,label,status]) => ({ key, label, status }));
  return (
    <div className="grid grid-cols-4 gap-y-3.5 gap-x-1 mt-4">
      {items.map((c) => {
        const col = _qmColor[c.key] || _qmColor.more;
        const coming = c.status === "coming";
        const href = coming ? "/partner" : `/search?cat=${c.key}`;
        return (
          <Link key={c.key} href={href} className="relative flex flex-col items-center gap-1.5">
            <span className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center shadow-[0_2px_10px_rgba(139,111,232,0.10)] ${coming ? "opacity-55" : ""}`} style={{ background: col.bg, color: col.fg }}>
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{_qmIcon[c.key] || _qmIcon.more}</svg>
            </span>
            {coming && <span className="absolute -top-1 right-1 text-[8.5px] font-extrabold text-white bg-[#B7AECB] px-1 py-[1px] rounded">준비중</span>}
            <span className={`text-[11.5px] font-bold ${coming ? "text-muted" : "text-body"}`}>{c.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function InfoSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div onClick={(e)=>e.stopPropagation()} className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:rounded-2xl bg-white rounded-t-3xl p-5 pb-[max(env(safe-area-inset-bottom),20px)] max-h-[80vh] overflow-y-auto">
        <div className="mx-auto w-10 h-1 rounded-full bg-line mb-4 md:hidden" />
        <div className="flex items-center justify-between mb-3"><b className="text-[16px] text-ink">{title}</b><button onClick={onClose} className="text-muted text-xl leading-none px-1">×</button></div>
        {children}
        <p className="text-[11.5px] text-muted mt-4 leading-relaxed">스드맵의 예상치는 업체가 공개한 정보와 미포함 항목 기준으로 계산한 참고용 수치예요. 실제 금액과 조건은 상담 시 꼭 확인해 보세요. <a href="/methodology" className="text-brand-600 font-bold underline underline-offset-2">산정 방식 자세히 보기</a></p>
      </div>
    </div>
  );
}
