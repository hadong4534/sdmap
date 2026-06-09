"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CATS, CAT_IMG, won } from "@/lib/const";
import { useCompare } from "@/lib/compare";
import Sidebar from "@/components/Sidebar";
import { riskLevel } from "@/components/RiskBadge";
import TabBar from "@/components/TabBar";

const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });

export default function Compare() {
  const { ids, toggle } = useCompare();
  const [vendors, setVendors] = useState([]);
  useEffect(() => {
    if (!supabase || ids.length === 0) { setVendors([]); return; }
    supabase.from("vendors").select("*").in("id", ids).then(({ data }) => setVendors(data || []));
  }, [ids]);

  const rows = [
    ["기준가", (v) => won(v.base_price)],
    ["예상 최종가", (v) => won(v.estimated_final_price), true],
    ["추가금 예상", (v) => `${Math.round((v.expected_extra_min||0)/10000)}~${Math.round((v.expected_extra_max||0)/10000)}만원`],
    ["위험도", (v) => v.risk_score],
    ["평점", (v) => "★ " + v.rating],
    ["후기 신뢰도", (v) => (v.review_trust_score || "-") + "점"],
    ["지역", (v) => v.region],
  ];

  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-8">
        <header className="bg-white border-b border-line"><div className="max-w-6xl mx-auto px-4 md:px-8 py-4 font-extrabold text-lg">비교함 <span className="text-muted text-sm font-bold">{vendors.length}곳</span></div></header>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-5">
          {vendors.length === 0 ? (
            <div className="text-center text-muted py-16 text-sm">비교함이 비어 있어요.<br /><Link href="/search" className="text-brand-700 font-bold">업체 탐색에서 담기 →</Link></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[520px]">
                <thead>
                  <tr>
                    <th className="w-24"></th>
                    {vendors.map((v) => (
                      <th key={v.id} className="p-2 align-top">
                        <Link href={`/shop/${v.id}`}><div className="rounded-xl mb-2" style={{ aspectRatio: "4/3", ...bg(v.thumbnail_url || CAT_IMG[v.category]) }} /></Link>
                        <div className="font-extrabold text-[13px] text-ink text-center">{v.name}</div>
                        <button onClick={() => toggle(v.id)} className="block mx-auto mt-1 text-[11px] text-muted underline">빼기</button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(([label, fn, hi]) => (
                    <tr key={label} className="border-t border-line">
                      <td className="p-2 text-[12px] text-muted font-bold">{label}</td>
                      {vendors.map((v) => {
                        if (label === "위험도") { const r = riskLevel(v.risk_score); return <td key={v.id} className="p-2 text-center"><span className="text-[12px] font-extrabold px-2 py-0.5 rounded-md" style={{ color: r.color, background: r.bg }}>{v.risk_score} {r.label}</span></td>; }
                        return <td key={v.id} className={`p-2 text-center text-[13px] ${hi ? "font-extrabold text-brand-700" : "text-ink"}`}>{fn(v)}</td>;
                      })}
                    </tr>
                  ))}
                  <tr className="border-t border-line">
                    <td></td>
                    {vendors.map((v) => (<td key={v.id} className="p-2 text-center"><Link href={`/shop/${v.id}`} className="inline-block text-[12px] font-bold text-white bg-brand-grad px-3 py-2 rounded-lg">상세보기</Link></td>))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <div className="md:hidden"><TabBar active="fav" /></div>
    </div>
  );
}
