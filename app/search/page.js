"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CATS, CAT_IMG } from "@/lib/const";
import TabBar from "@/components/TabBar";

const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });
const REGIONS = ["전체", "서울", "경기", "인천", "부산", "대구", "대전"];

export default function Search() {
  const [all, setAll] = useState([]);
  const [cat, setCat] = useState("all");
  const [region, setRegion] = useState("전체");
  const [q, setQ] = useState("");

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("cat");
    if (c) setCat(c);
    if (supabase) supabase.from("vendors").select("*").eq("status", "active").order("review_count", { ascending: false }).then(({ data }) => setAll(data || []));
  }, []);

  const list = all.filter((v) =>
    (cat === "all" || v.category === cat) &&
    (region === "전체" || (v.region || "").includes(region)) &&
    (!q || v.name.includes(q))
  );

  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="sticky top-0 z-30 bg-white border-b border-line">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-3.5 py-2.5">
            <span className="text-brand-500">🔍</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="업체명 검색" className="flex-1 bg-transparent outline-none text-sm" />
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {[["all", "전체"], ...Object.entries(CATS)].map(([k, l]) => (
              <button key={k} onClick={() => setCat(k)} className={`text-[13px] font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap ${cat === k ? "bg-brand-grad text-white" : "bg-brand-50 text-brand-700"}`}>{l}</button>
            ))}
          </div>
          <div className="flex gap-2 mt-2 overflow-x-auto no-scrollbar">
            {REGIONS.map((r) => (
              <button key={r} onClick={() => setRegion(r)} className={`text-[12px] font-bold px-3 py-1 rounded-lg whitespace-nowrap border ${region === r ? "bg-brand-600 text-white border-brand-600" : "bg-white text-body border-line"}`}>{r}</button>
            ))}
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-4">
        <p className="text-xs text-muted font-bold mb-3">검색결과 {list.length}곳</p>
        <div className="space-y-3">
          {list.map((v) => (
            <Link key={v.id} href={`/shop/${v.id}`} className="flex gap-3 bg-white border border-line rounded-2xl p-3">
              <div className="w-24 h-24 rounded-xl shrink-0" style={bg(v.thumbnail_url || CAT_IMG[v.category])} />
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-sm">{v.name}</div>
                <div className="text-xs text-muted mt-0.5">{v.region} · {CATS[v.category]}</div>
                <div className="text-xs text-warn font-extrabold mt-2">★ {v.rating} <span className="text-muted font-normal">({v.review_count})</span></div>
              </div>
            </Link>
          ))}
          {list.length === 0 && <p className="text-center text-muted text-sm py-10">조건에 맞는 업체가 없어요.</p>}
        </div>
      </main>
      <TabBar active="search" />
    </div>
  );
}
