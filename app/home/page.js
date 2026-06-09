"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CATS, CAT_IMG } from "@/lib/const";
import { useCompare, getRecent } from "@/lib/compare";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import VendorCard from "@/components/VendorCard";
import RoadmapProgress from "@/components/RoadmapProgress";

const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });
const TODOS = ["스튜디오 견적 2곳 비교하기", "드레스 투어 일정 잡기", "웨딩홀 계약서 환불 조건 확인하기"];
const CATS8 = [["studio","스튜디오"],["dress","드레스"],["makeup","메이크업"],["hall","웨딩홀"],["snap","스냅"],["ring","예물"],["suit","예복"],["invite","청첩장"]];

function Section({ title, more, children }) {
  return (<section className="pt-7"><div className="flex items-baseline justify-between mb-3"><h3 className="text-base md:text-lg font-extrabold text-ink">{title}</h3>{more && <Link href={more} className="text-[12px] text-muted font-bold">전체보기 ›</Link>}</div>{children}</section>);
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [popular, setPopular] = useState([]);
  const [compareV, setCompareV] = useState([]);
  const [recentV, setRecentV] = useState([]);
  const { ids } = useCompare();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user ?? null; setUser(u);
      if (u) { const { data: p } = await supabase.from("profiles").select("phone").eq("id", u.id).maybeSingle(); if (!p || !p.phone) router.replace("/onboarding"); }
    });
    supabase.from("vendors").select("*").eq("status", "active").order("review_count", { ascending: false }).limit(8).then(({ data }) => setPopular(data || []));
    const rec = getRecent();
    if (rec.length) supabase.from("vendors").select("*").in("id", rec).then(({ data }) => setRecentV(data || []));
  }, [router]);
  useEffect(() => { if (supabase && ids.length) supabase.from("vendors").select("*").in("id", ids).then(({ data }) => setCompareV(data || [])); else setCompareV([]); }, [ids]);

  const mm = user?.user_metadata || {};
  const name = user ? (mm.name || mm.full_name || mm.nickname || "회원") : "게스트";

  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        {/* mobile header */}
        <header className="md:hidden sticky top-0 z-30 bg-surface/95 backdrop-blur px-4 py-3 flex items-center">
          <img src="/images/logo_full.png" alt="스드맵" className="h-7 w-auto" />
          <div className="ml-auto flex gap-3 text-muted"><Link href="/my">🔔</Link><Link href="/my">👤</Link></div>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-2 md:pt-6">
          {/* D-day + AI coach */}
          <div className="grid md:grid-cols-[1.3fr_1fr] gap-4">
            <div className="rounded-2xl bg-white border border-brand-100 p-5 shadow-card">
              <div className="text-sm text-muted font-bold">{name}님의 결혼 준비</div>
              <div className="flex items-end gap-3 mt-1"><div className="text-3xl font-extrabold text-brand-700">D-218</div><div className="text-sm text-muted mb-1">진행률 32%</div></div>
              <div className="mt-3 h-2 bg-brand-100 rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full" style={{ width: "32%" }} /></div>
              <div className="mt-4">
                <div className="text-xs text-muted font-bold mb-2">오늘 결정해야 할 3가지</div>
                <ul className="space-y-1.5">{TODOS.map((t, i) => (<li key={i} className="flex items-center gap-2 text-[13px] bg-surface rounded-lg px-3 py-2 text-body"><span className="w-4 h-4 rounded-full border-2 border-brand-300 inline-block" />{t}</li>))}</ul>
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-line p-5 shadow-card">
              <div className="flex items-center gap-2 font-extrabold text-ink text-sm"><span className="text-brand-600">✦</span> AI 준비 코치</div>
              <div className="mt-3 rounded-xl bg-[#FFF1EC] p-3">
                <div className="text-[13px] text-ink font-bold">루미에르 스튜디오 견적서에 <span className="text-risk">원본비가 미포함</span>되어 있어요.</div>
                <div className="text-[12px] text-muted mt-1">예상 추가금 20~40만원이 발생할 수 있어요.</div>
              </div>
              <Link href="/quote" className="mt-3 block text-center text-[13px] font-bold text-white bg-brand-grad rounded-xl py-2.5">견적서 분석하기</Link>
            </div>
          </div>

          {/* 로드맵 */}
          <Section title="준비 로드맵" more="/roadmap"><RoadmapProgress current={1} /></Section>

          {/* 빠른 실행 (mobile) */}
          <div className="grid grid-cols-4 gap-2 pt-6 md:hidden">
            {[["견적 분석","/quote","🧾"],["업체 탐색","/search","🔍"],["비교함","/compare","⚖️"],["로드맵","/roadmap","🗺️"]].map(([l,h,e]) => (
              <Link key={l} href={h} className="bg-white border border-line rounded-2xl py-3 flex flex-col items-center gap-1 text-[11px] font-bold text-body"><span className="text-xl">{e}</span>{l}</Link>
            ))}
          </div>

          {compareV.length > 0 && <Section title="비교 중인 업체" more="/compare"><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{compareV.map((v) => <VendorCard key={v.id} v={v} />)}</div></Section>}
          {recentV.length > 0 && <Section title="최근 본 업체"><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{recentV.slice(0,4).map((v) => <VendorCard key={v.id} v={v} />)}</div></Section>}

          <Section title="지역별 인기 업체" more="/search"><div className="grid grid-cols-2 md:grid-cols-4 gap-3">{popular.slice(0, 8).map((v) => <VendorCard key={v.id} v={v} />)}</div></Section>

          {/* 카테고리 */}
          <Section title="카테고리">
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5">
              {CATS8.map(([k, l]) => (<Link key={k} href={`/search?cat=${k}`} className="flex flex-col items-center gap-2"><div className="w-full aspect-square rounded-2xl overflow-hidden" style={bg(CAT_IMG[k] || CAT_IMG.studio)} /><span className="text-[12px] font-bold text-ink">{l}</span></Link>))}
            </div>
          </Section>

          {/* 견적 업로드 */}
          <Section title="견적서 분석">
            <Link href="/quote" className="block rounded-2xl border-2 border-dashed border-brand-200 bg-white p-6 text-center">
              <div className="text-2xl">🧾</div>
              <div className="font-extrabold text-ink mt-2">받은 견적서를 올려보세요</div>
              <div className="text-[13px] text-muted mt-1">총 견적·예상 추가금·누락 항목·평균가 비교를 한 번에 분석해드려요</div>
            </Link>
          </Section>
        </div>
      </div>
      <TabBar active="home" />
    </div>
  );
}
