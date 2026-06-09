"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CATS, CAT_IMG, won } from "@/lib/const";
import { useCompare, getRecent } from "@/lib/compare";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { VendorCard, SectionHeader, CategoryChip, riskLevel } from "@/components/ui";

const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });
const CATS_NAV = [["all","전체","/search"],["studio","스튜디오","/search?cat=studio"],["dress","드레스","/search?cat=dress"],["makeup","메이크업","/search?cat=makeup"],["hall","웨딩홀","/search?cat=hall"],["analyze","분석","/quote"],["etc","예물/예복","/search"]];
const STEPS = ["예식 확정","업체 계약","촬영","본식","마무리"];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [popular, setPopular] = useState([]);
  const [compareV, setCompareV] = useState([]);
  const { ids } = useCompare();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    supabase.from("vendors").select("*").eq("status", "active").order("review_count", { ascending: false }).limit(8).then(({ data }) => setPopular(data || []));
  }, [router]);
  useEffect(() => { if (supabase && ids.length) supabase.from("vendors").select("*").in("id", ids).then(({ data }) => setCompareV(data || [])); else setCompareV([]); }, [ids]);

  const mm = user?.user_metadata || {};
  const name = user ? (mm.name || mm.full_name || mm.nickname || "회원") : "게스트";

  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="md:hidden sticky top-0 z-30 bg-surface/95 backdrop-blur px-4 py-3 flex items-center">
          <img src="/images/logo_full.png" alt="스드맵" className="h-7 w-auto" />
          <Link href="/my" className="ml-auto"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg></Link>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-2 md:pt-6">
          {/* 검색 */}
          <Link href="/search" className="flex items-center gap-2 bg-white border border-line rounded-2xl px-4 h-12 shadow-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-brand-500"><circle cx="11" cy="11" r="7"/><path d="M21 21l-3.5-3.5"/></svg><span className="text-[15px] text-muted">업체명, 상품, 키워드로 검색</span>
          </Link>

          {/* 카테고리 */}
          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
            {CATS_NAV.map(([k,l,h]) => <CategoryChip key={k} label={l} href={h} active={k==="all"} />)}
          </div>

          {/* AI 체크 + 진행률 */}
          <div className="grid md:grid-cols-2 gap-3 mt-5">
            <div className="rounded-[20px] border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5 shadow-card relative overflow-hidden">
              <div className="flex items-center gap-2"><span className="font-extrabold text-ink text-lg">AI 체크</span><span className="text-[10px] font-extrabold text-white bg-brand-500 px-1.5 py-0.5 rounded">NEW</span></div>
              <p className="text-[14px] text-body mt-2 leading-relaxed">견적의 숨겨진 항목과 추가 비용 위험을<br className="hidden md:block"/> 찾아드려요.</p>
              <Link href="/quote" className="inline-block mt-3 h-11 leading-[44px] px-5 rounded-xl bg-brand-500 text-white font-bold text-sm">내 견적 AI 분석하기</Link>
              <span className="absolute right-4 top-4 text-brand-300"><svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9z"/></svg></span>
            </div>
            <div className="rounded-[20px] border border-line bg-white p-5 shadow-card">
              <div className="flex items-end justify-between"><div><div className="text-[13px] text-muted font-bold">{name}님의 결혼 준비</div><div className="text-[26px] font-extrabold text-brand-600 leading-tight">D-218</div></div><div className="text-sm text-muted font-bold">진행률 32%</div></div>
              <div className="mt-3 h-2 bg-brand-100 rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full" style={{ width: "32%" }} /></div>
              <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">{STEPS.map((s,i)=>(<span key={s} className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${i<=1?"bg-brand-50 text-brand-700":"bg-surface text-muted"}`}>{s}</span>))}</div>
            </div>
          </div>

          {compareV.length > 0 && (
            <section className="pt-8"><SectionHeader title="내 비교함" more="/compare" /><div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">{compareV.slice(0,4).map((v)=><VendorCard key={v.id} v={v} />)}</div></section>
          )}

          <section className="pt-8">
            <SectionHeader title="지금 많이 비교하는 업체" sub="추가금 위험과 예상 최종가를 함께 확인하세요" more="/search" />
            <div className="flex gap-3 overflow-x-auto no-scrollbar md:grid md:grid-cols-4 md:overflow-visible">
              {popular.slice(0,4).map((v)=>(<div key={v.id} className="w-[260px] md:w-auto shrink-0"><VendorCard v={v} /></div>))}
            </div>
          </section>

          <section className="pt-8 pb-2">
            <SectionHeader title="지역별 인기 업체" more="/search" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">{popular.slice(4,8).map((v)=><VendorCard key={v.id} v={v} />)}</div>
          </section>
        </div>
      </div>
      <TabBar active="home" />
    </div>
  );
}
