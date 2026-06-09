"use client";
import Link from "next/link";
import { CATS, CAT_IMG, won } from "@/lib/const";
import { riskLevel } from "./RiskBadge";
import { useCompare } from "@/lib/compare";
const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });
export default function VendorCard({ v, row }) {
  const { has, toggle } = useCompare();
  const r = riskLevel(v.risk_score || 0);
  const inC = has(v.id);
  if (row) {
    return (
      <div className="flex gap-3 bg-white border border-line rounded-2xl p-3 shadow-card">
        <Link href={`/shop/${v.id}`} className="w-28 shrink-0 rounded-xl" style={{ aspectRatio: "1/1", ...bg(v.thumbnail_url || CAT_IMG[v.category]) }} />
        <div className="flex-1 min-w-0">
          <Link href={`/shop/${v.id}`}><div className="font-extrabold text-sm text-ink truncate">{v.name}</div></Link>
          <div className="text-[12px] text-muted">{v.region} · {CATS[v.category]}</div>
          <div className="text-[12px] mt-1" style={{ color: "#E0A12E" }}>★ {v.rating} <span className="text-muted">신뢰 {v.review_trust_score}</span></div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-[13px]"><span className="text-muted text-[11px]">예상 </span><b className="text-brand-700">{won(v.estimated_final_price)}</b></div>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md" style={{ color: r.color, background: r.bg }}>위험 {v.risk_score}</span>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-card">
      <Link href={`/shop/${v.id}`}><div className="h-36" style={bg(v.thumbnail_url || CAT_IMG[v.category])} /></Link>
      <div className="p-3">
        <Link href={`/shop/${v.id}`}><div className="font-extrabold text-sm text-ink truncate">{v.name}</div></Link>
        <div className="text-[12px] text-muted mt-0.5">{v.region} · {CATS[v.category]}</div>
        <div className="flex items-center gap-2 mt-1.5 text-[12px]"><span style={{ color: "#E0A12E" }}>★ {v.rating}</span><span className="text-muted">신뢰 {v.review_trust_score}</span></div>
        <div className="mt-2 flex items-end justify-between">
          <div><div className="text-[11px] text-muted">예상 최종가</div><div className="font-extrabold text-brand-700">{won(v.estimated_final_price)}</div></div>
          <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md" style={{ color: r.color, background: r.bg }}>위험 {v.risk_score}</span>
        </div>
        <button onClick={() => toggle(v.id)} className={`w-full mt-3 h-9 rounded-lg text-[12px] font-bold border ${inC ? "bg-brand-600 text-white border-brand-600" : "bg-brand-50 text-brand-700 border-brand-100"}`}>{inC ? "비교함에 담김 ✓" : "비교함 담기"}</button>
      </div>
    </div>
  );
}
