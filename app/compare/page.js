"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CATS, CAT_IMG, won } from "@/lib/const";
import { useCompare } from "@/lib/compare";
import Sidebar from "@/components/Sidebar";
import { riskLevel, VendorCard, EmptyState } from "@/components/ui";
import TabBar from "@/components/TabBar";

const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });

export default function Compare() {
  const { ids, toggle } = useCompare();
  const [vendors, setVendors] = useState([]);
  const [recommend, setRecommend] = useState([]);

  useEffect(() => {
    if (!supabase) return;
    if (ids.length) supabase.from("vendors").select("*").in("id", ids).then(({ data }) => setVendors(data || []));
    else { setVendors([]); supabase.from("vendors").select("*").eq("status", "active").order("review_count", { ascending: false }).limit(3).then(({ data }) => setRecommend(data || [])); }
  }, [ids]);

  const rows = [
    ["기본 견적", (v) => won(v.base_price)],
    ["예상 최종가", (v) => won(v.estimated_final_price), true],
    ["추가금 위험", (v) => v],
    ["후기 평점", (v) => "★ " + v.rating],
    ["후기 신뢰도", (v) => (v.review_trust_score || "-") + "점"],
    ["지역", (v) => v.region],
    ["촬영/유형", (v) => v.type || "-"],
  ];

  const cheapest = vendors.length ? vendors.reduce((a, b) => (a.estimated_final_price <= b.estimated_final_price ? a : b)) : null;
  const safest = vendors.length ? vendors.reduce((a, b) => (a.risk_score <= b.risk_score ? a : b)) : null;
  const balance = vendors.length ? vendors.reduce((a, b) => ((a.estimated_final_price / 100000 + a.risk_score) <= (b.estimated_final_price / 100000 + b.risk_score) ? a : b)) : null;

  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-8">
        <header className="bg-white border-b border-line"><div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between"><span className="font-extrabold text-[20px]">비교 보드 <span className="text-muted text-sm font-bold">{vendors.length}/4</span></span>{vendors.length > 0 && <button onClick={() => navigator.share?.({ title: "스드맵 비교", url: location.href }).catch(()=>{})} className="text-[13px] font-bold text-brand-700 bg-brand-50 px-3 py-2 rounded-lg">공유하기</button>}</div></header>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5">
          {vendors.length === 0 ? (
            <>
              <EmptyState title="아직 비교 중인 업체가 없어요" desc="마음에 드는 업체를 비교함에 담으면 가격·추가금·후기 신뢰도를 한눈에 비교할 수 있어요." ctaLabel="업체 탐색하기" ctaHref="/search" />
              <div className="mt-6"><div className="font-extrabold text-ink mb-3">이런 업체는 어때요?</div><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{recommend.map((v) => <VendorCard key={v.id} v={v} />)}</div></div>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-line bg-white p-4 mb-4">
                <div className="flex items-center gap-2 font-extrabold text-ink mb-3"><span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9z"/></svg></span>AI 비교 요약</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {cheapest && <div className="rounded-xl bg-brand-50 p-3"><div className="text-[12px] text-muted font-bold">가격이 가장 합리적</div><div className="font-extrabold text-ink mt-0.5">{cheapest.name}</div><div className="text-[13px] text-brand-700 font-bold">{won(cheapest.estimated_final_price)}</div></div>}
                  {safest && <div className="rounded-xl p-3" style={{ background: "#E8F8F3" }}><div className="text-[12px] text-muted font-bold">추가금 위험이 가장 낮음</div><div className="font-extrabold text-ink mt-0.5">{safest.name}</div><div className="text-[13px] font-bold" style={{ color: "#41C7A7" }}>위험 {safest.risk_score}점</div></div>}
                  {balance && <div className="rounded-xl bg-surface p-3"><div className="text-[12px] text-muted font-bold">가격·안전 밸런스 추천</div><div className="font-extrabold text-ink mt-0.5">{balance.name}</div><div className="text-[13px] text-muted font-bold">종합 균형</div></div>}
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-line bg-white">
                <table className="w-full border-collapse min-w-[480px]">
                  <thead><tr><th className="w-24 p-2"></th>{vendors.map((v) => (<th key={v.id} className="p-2 align-top"><Link href={`/shop/${v.id}`}><div className="rounded-xl mb-2" style={{ aspectRatio: "4/3", ...bg(v.thumbnail_url || CAT_IMG[v.category]) }} /></Link><div className="font-extrabold text-[13px] text-center">{v.name}</div><button onClick={() => toggle(v.id)} className="block mx-auto mt-1 text-[11px] text-muted underline">빼기</button></th>))}</tr></thead>
                  <tbody>
                    {rows.map(([label, fn, hi]) => (
                      <tr key={label} className="border-t border-line">
                        <td className="p-2.5 text-[12.5px] text-muted font-bold">{label}</td>
                        {vendors.map((v) => {
                          if (label === "추가금 위험") { const r = riskLevel(v.risk_score); return <td key={v.id} className="p-2.5 text-center"><span className="text-[12px] font-extrabold px-2 py-0.5 rounded-md" style={{ color: r.color, background: r.bg }}>{r.label} {v.risk_score}</span></td>; }
                          return <td key={v.id} className={`p-2.5 text-center text-[13.5px] ${hi ? "font-extrabold text-brand-600" : "text-ink"}`}>{fn(v)}</td>;
                        })}
                      </tr>
                    ))}
                    <tr className="border-t border-line"><td></td>{vendors.map((v) => (<td key={v.id} className="p-2.5 text-center"><Link href={`/shop/${v.id}`} className="inline-block text-[12px] font-bold text-white bg-brand-500 px-3 py-2 rounded-lg">상세보기</Link></td>))}</tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      <TabBar active="compare" />
    </div>
  );
}
