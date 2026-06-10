"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CATS, CAT_IMG, won } from "@/lib/const";
import { VendorListItem, VendorCard } from "@/components/ui";
import { useCompare } from "@/lib/compare";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";

const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });
const REGIONS = ["전체","서울","경기","인천","부산","대구","대전"];
const SORTS = [["recommend","추천순"],["priceAsc","예상가 낮은순"],["priceDesc","예상가 높은순"],["rating","평점순"],["riskAsc","위험 낮은순"]];
const PRICES = [["all","전체"],["u120","120만 이하"],["120to180","120~180만"],["o180","180만 이상"]];
const RISKS = [["all","전체"],["low","낮음"],["mid","보통"],["high","높음"]];
const BASE_CATS = [["all","전체"],["studio","스튜디오"],["dress","드레스"],["makeup","메이크업"],["hall","웨딩홀"]];
const SHEETS = { cat:{title:"카테고리",opts:BASE_CATS}, region:{title:"지역",opts:REGIONS.map(r=>[r,r])}, price:{title:"가격대 (예상 최종가)",opts:PRICES}, risk:{title:"추가금 위험",opts:RISKS}, sort:{title:"정렬",opts:SORTS} };

export default function Search() {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [catOpts, setCatOpts] = useState(BASE_CATS);
  const [region, setRegion] = useState("전체");
  const [price, setPrice] = useState("all");
  const [risk, setRisk] = useState("all");
  const [sort, setSort] = useState("recommend");
  const [sheet, setSheet] = useState(null);
  const { ids } = useCompare();
  const [compareV, setCompareV] = useState([]);

  useEffect(() => { const sp = new URLSearchParams(window.location.search); const c = sp.get("cat"); if (c) setCat(c); const qq = sp.get("q"); if (qq) setQ(qq); if (supabase) {
      supabase.from("vendors").select("*").eq("status","active").then(({data})=>setAll(data||[]));
      supabase.from("categories").select("key,label").eq("status","active").order("sort").then(({data})=>{ if (data?.length) setCatOpts([["all","전체"], ...data.map((c)=>[c.key,c.label])]); });
    } }, []);
  useEffect(() => { if (supabase && ids.length) supabase.from("vendors").select("*").in("id", ids).then(({data})=>setCompareV(data||[])); else setCompareV([]); }, [ids]);

  const val = { cat, region, price, risk, sort };
  const setVal = { cat:setCat, region:setRegion, price:setPrice, risk:setRisk, sort:setSort };
  const sheetOpts = (k) => (k === "cat" ? catOpts : SHEETS[k].opts);
  const labelOf = (k) => sheetOpts(k).find(o=>o[0]===val[k])?.[1];

  let list = all.filter(v =>
    (cat==="all"||v.category===cat) && (region==="전체"||(v.region||"").includes(region)) && (!q || [v.name, v.region, v.type, v.description, JSON.stringify(v.tags || [])].join(" ").toLowerCase().includes(q.toLowerCase())) &&
    (price==="all"||(price==="u120"?v.estimated_final_price<=1200000:price==="120to180"?v.estimated_final_price>1200000&&v.estimated_final_price<=1800000:v.estimated_final_price>1800000)) &&
    (risk==="all"||(risk==="low"?v.risk_score<45:risk==="mid"?v.risk_score>=45&&v.risk_score<70:v.risk_score>=70)));
  list = [...list].sort((a,b)=> sort==="priceAsc"?a.estimated_final_price-b.estimated_final_price : sort==="priceDesc"?b.estimated_final_price-a.estimated_final_price : sort==="rating"?b.rating-a.rating : sort==="riskAsc"?a.risk_score-b.risk_score : b.review_count-a.review_count);

  const filterBtns = [["cat","카테고리"],["region","지역"],["price","가격"],["risk","추가금 위험"],["sort","정렬"]];

  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-20 md:pb-8">
        <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur border-b border-line">
          <div className="max-w-6xl mx-auto px-4 md:px-8 pt-3 pb-2.5">
            <div className="flex items-center gap-2 bg-white border border-line rounded-2xl px-3.5 h-11 md:max-w-xl">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-brand-500"><circle cx="11" cy="11" r="7"/><path d="M21 21l-3.5-3.5"/></svg>
              <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="업체명, 키워드 검색" className="flex-1 bg-transparent outline-none text-[15px]" />
            </div>
            <div className="flex gap-2 mt-2.5 overflow-x-auto no-scrollbar">
              {filterBtns.map(([k,l])=>{ const on=val[k]!==(k==="region"?"전체":k==="sort"?"recommend":"all"); return (
                <button key={k} onClick={()=>setSheet(k)} className={`shrink-0 inline-flex items-center gap-1 px-3 h-8 rounded-full text-[12.5px] font-bold border ${on?"bg-brand-500 text-white border-brand-500":"bg-white text-body border-line"}`}>{on?labelOf(k):l}<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg></button>
              );})}
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:flex md:gap-6">
          <main className="flex-1 min-w-0">
            <p className="text-[13px] text-muted font-bold mb-3">검색결과 <b className="text-ink">{list.length}</b>곳</p>
            {list.length === 0 && (
              <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center">
                <div className="text-[15px] font-extrabold text-ink">조건에 맞는 업체가 없어요</div>
                <p className="text-[13px] text-muted mt-1.5">검색어를 줄이거나 필터를 풀어보세요.</p>
                <button onClick={() => { setQ(""); setCat("all"); setRegion("전체"); setPrice("all"); setRisk("all"); }} className="mt-4 h-10 px-5 rounded-xl bg-brand-50 text-brand-700 text-[13px] font-bold">필터 초기화</button>
              </div>
            )}
            <div className="space-y-3 md:hidden">{list.map(v=><VendorListItem key={v.id} v={v} />)}</div>
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">{list.map(v=><VendorCard key={v.id} v={v} />)}</div>
            {list.length===0 && <p className="text-center text-muted text-sm py-12">조건에 맞는 업체가 없어요.</p>}
          </main>
          {/* PC 우측 비교함 패널 */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-line bg-white p-4">
              <div className="font-extrabold text-ink mb-2">비교함 <span className="text-brand-600">{compareV.length}</span>/4</div>
              {compareV.length===0 ? <p className="text-[13px] text-muted">담은 업체가 없어요. 카드의 "비교함 담기"를 눌러보세요.</p> :
                <div className="space-y-2">{compareV.map(v=>(<Link key={v.id} href={`/shop/${v.id}`} className="flex gap-2 items-center"><div className="w-10 h-10 rounded-lg shrink-0" style={bg(v.thumbnail_url||CAT_IMG[v.category])} /><div className="min-w-0"><div className="text-[12px] font-bold truncate">{v.name}</div><div className="text-[11px] text-brand-600 font-bold">{won(v.estimated_final_price)}</div></div></Link>))}</div>}
              {compareV.length>0 && <Link href="/compare" className="mt-3 block text-center text-[13px] font-bold text-white bg-brand-500 rounded-xl py-2.5">비교하러 가기</Link>}
            </div>
          </aside>
        </div>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center" onClick={()=>setSheet(null)}>
          <div className="absolute inset-0 bg-black/35" />
          <div className="relative w-full md:w-80 bg-white rounded-t-3xl md:rounded-3xl p-5 pb-8 md:pb-5 max-h-[70vh] overflow-auto" onClick={(e)=>e.stopPropagation()}>
            <div className="w-10 h-1 bg-line rounded-full mx-auto mb-3 md:hidden" />
            <div className="font-extrabold text-ink text-lg mb-3">{SHEETS[sheet].title}</div>
            <div className="space-y-1">{sheetOpts(sheet).map(([v,l])=>(<button key={v} onClick={()=>{setVal[sheet](v);setSheet(null);}} className={`w-full text-left px-4 h-12 rounded-xl text-[15px] font-bold ${val[sheet]===v?"bg-brand-50 text-brand-700":"text-body"}`}>{l}</button>))}</div>
          </div>
        </div>
      )}
      <TabBar active="search" />
    </div>
  );
}
