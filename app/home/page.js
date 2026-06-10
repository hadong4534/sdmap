"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useCompare } from "@/lib/compare";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { VendorCard, SectionHeader, IconQuickMenu } from "@/components/ui";

const STEPS = ["예식 확정", "업체 계약", "촬영", "본식", "마무리"];
const PC_CATS = [
  ["studio", "스튜디오", "/images/vendors/lumiere.jpg"],
  ["dress", "드레스", "/images/vendors/atelier_dress.jpg"],
  ["makeup", "메이크업", "/images/vendors/glow_makeup.jpg"],
  ["hall", "웨딩홀", "/images/vendors/thegrace_hall.jpg"],
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [popular, setPopular] = useState([]);
  const [compareV, setCompareV] = useState([]);
  const [prof, setProf] = useState(null);
  const [wd, setWd] = useState("");
  const [unread, setUnread] = useState(0);
  const [kw, setKw] = useState("");
  const [cats, setCats] = useState([]);
  const { ids } = useCompare();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user ?? null; setUser(u);
      if (u) {
        const { data: p } = await supabase.from("profiles").select("wedding_date, name, budget, checklist").eq("id", u.id).maybeSingle(); setProf(p || {});
        const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", u.id).eq("read", false);
        setUnread(count || 0);
      }
    });
    supabase.from("vendors").select("*").eq("status", "active").order("review_count", { ascending: false }).limit(8).then(({ data }) => setPopular(data || []));
    supabase.from("categories").select("*").neq("status", "hidden").order("sort").then(({ data }) => setCats(data || []));
  }, [router]);
  useEffect(() => { if (supabase && ids.length) supabase.from("vendors").select("*").in("id", ids).then(({ data }) => setCompareV(data || [])); else setCompareV([]); }, [ids]);

  const mm = user?.user_metadata || {};
  const name = user ? (prof?.name || mm.name || mm.full_name || mm.nickname || "회원") : "게스트";

  async function saveDate() {
    if (!wd || !user) return;
    await supabase.from("profiles").upsert({ id: user.id, wedding_date: wd });
    setProf({ ...(prof || {}), wedding_date: wd });
  }

  // 비교함 기반 인사이트
  const fmtMan = (n) => `${Math.round(Math.abs(n) / 10000)}만원`;
  let insights = null;
  if (compareV.length >= 2) {
    const avg = compareV.reduce((a, v) => a + (v.estimated_final_price || 0), 0) / compareV.length;
    const risky = compareV.filter((v) => (v.risk_score || 0) >= 60);
    const top = [...compareV].sort((a, b) => (b.estimated_final_price || 0) - (a.estimated_final_price || 0))[0];
    const low = [...compareV].sort((a, b) => (a.estimated_final_price || 0) - (b.estimated_final_price || 0))[0];
    const overBudget = prof?.budget && avg > prof.budget;
    insights = [
      ...(overBudget ? [{ tone: "risk", text: <>비교함 평균 예상 최종가가 설정 예산보다 <b>{fmtMan(avg - prof.budget)} 높아요.</b></> }] : []),
      risky.length
        ? { tone: "risk", text: <>비교 중인 {compareV.length}곳 중 <b>{risky.length}곳은 추가금 확인</b>이 필요해요.</> }
        : { tone: "safe", text: <>비교 중인 {compareV.length}곳 모두 추가금 위험이 낮은 편이에요.</> },
      { tone: "brand", text: <><b>{top.name}</b>는 예상 최종가가 비교함 평균보다 <b>{fmtMan(top.estimated_final_price - avg)} 높아요.</b></> },
      { tone: "safe", text: <>예상 최종가 기준 <b>{low.name}</b>이 가장 합리적이에요.</> },
    ];
  }

  // A 화법 헤드라인
  let saveMan = null;
  if (compareV.length >= 2) {
    const avgP = compareV.reduce((a, x) => a + (x.estimated_final_price || 0), 0) / compareV.length;
    const lowP = Math.min(...compareV.map((x) => x.estimated_final_price || 0));
    saveMan = Math.max(1, Math.round((avgP - lowP) / 10000));
  }
  const ckPct = prof?.checklist ? Math.round((Object.values(prof.checklist).filter(Boolean).length / 8) * 100) : 0;

  const aiCard = insights ? (
    <div className="relative rounded-[24px] p-[2px] overflow-hidden shadow-[0_16px_40px_rgba(122,95,224,0.35)]" style={{ background: "linear-gradient(120deg,#8B6FE8,#E08BF2 50%,#6FB9E8)" }}>
      <span className="ai-shimmer z-10" />
      <div className="relative rounded-[22px] p-5 text-white" style={{ background: "linear-gradient(135deg,#6E54CF 0%,#8265DE 60%,#9A78EC 100%)" }}>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-white/15 px-2.5 py-1 rounded-full"><span className="live-dot" />스드맵 AI · 실시간 분석</span>
          {ckPct > 0 && (
            <span className="ml-auto relative w-10 h-10">
              <svg viewBox="0 0 40 40" className="w-10 h-10 -rotate-90"><circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4"/><circle cx="20" cy="20" r="16" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${ckPct} 100`} pathLength="100"/></svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold">{ckPct}%</span>
            </span>
          )}
        </div>
        <ul className="mt-3.5 space-y-2">
          {insights.slice(0, 3).map((it, i) => (
            <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-white/95">
              <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: it.tone === "risk" ? "#FFB28F" : it.tone === "safe" ? "#7CF2C8" : "#fff" }} />
              <span>{it.text}</span>
            </li>
          ))}
        </ul>
        <div className="flex gap-2 mt-4">
          <Link href="/compare" className="flex-1 h-11 rounded-xl bg-white text-[#6E54CF] text-[13.5px] font-extrabold flex items-center justify-center press">비교함 보기</Link>
          <Link href="/quote" className="flex-1 h-11 rounded-xl bg-white/15 text-white text-[13.5px] font-extrabold flex items-center justify-center press">AI 견적 분석</Link>
        </div>
      </div>
    </div>
  ) : (
    <div className="relative rounded-[24px] overflow-hidden shadow-[0_16px_40px_rgba(122,95,224,0.30)]" style={{ background: "linear-gradient(135deg,#6E54CF 0%,#8265DE 55%,#9A78EC 100%)" }}>
      <span className="ai-shimmer" />
      <span className="absolute -right-8 -top-10 w-36 h-36 rounded-full bg-white/10" />
      <div className="relative p-5 text-white">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold bg-white/15 px-2.5 py-1 rounded-full"><span className="live-dot" />스드맵 AI</span>
        <h2 className="text-[19px] font-extrabold leading-[1.35] mt-3 tracking-tight">견적서 속 숨은 비용,<br />AI가 30초 만에 찾아드려요</h2>
        <Link href="/quote" className="inline-block mt-4 h-11 leading-[44px] px-6 rounded-xl bg-white text-[#6E54CF] font-extrabold text-sm press">내 견적 AI 분석하기</Link>
      </div>
    </div>
  );
  const _legacyAiCard = false ? (
    <div className="rounded-[20px] border border-brand-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9z"/></svg></span>
        <span className="font-extrabold text-ink text-[16px]">오늘의 스드맵 체크</span>
        <span className="ml-auto text-[10px] font-extrabold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">{insights.length}건</span>
      </div>
      <ul className="mt-3 space-y-2">
        {insights.slice(0, 3).map((it, i) => (
          <li key={i} className="flex gap-2 text-[13.5px] text-body leading-relaxed">
            <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: it.tone === "risk" ? "#FF8A65" : it.tone === "safe" ? "#41C7A7" : "#8B6FE8" }} />
            <span>{it.text}</span>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 mt-4">
        <Link href="/compare" className="flex-1 h-10 rounded-xl bg-brand-500 text-white text-[13px] font-bold flex items-center justify-center">비교함 보기</Link>
        <Link href="/quote" className="flex-1 h-10 rounded-xl bg-brand-50 text-brand-700 text-[13px] font-bold flex items-center justify-center">AI 견적 분석</Link>
      </div>
    </div>
  ) : (
    <div className="rounded-[22px] p-5 shadow-[0_10px_30px_rgba(122,95,224,0.30)] relative overflow-hidden text-white" style={{ background: "linear-gradient(125deg,#8B6FE8 0%,#7A5FE0 45%,#A88BF2 100%)" }}>
      <span className="absolute -right-7 -top-9 w-36 h-36 rounded-full bg-white/10" />
      <span className="absolute right-10 bottom-2 w-16 h-16 rounded-full bg-white/10" />
      <div className="flex items-center gap-2 relative">
        <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center"><svg width="15" height="15" viewBox="0 0 24 24" fill="#fff"><path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9z"/></svg></span>
        <span className="font-extrabold text-lg">AI 체크</span>
        <span className="text-[10px] font-extrabold text-brand-700 bg-white px-1.5 py-0.5 rounded">NEW</span>
      </div>
      <p className="text-[14px] mt-2 leading-relaxed text-white/95 relative">견적서 속 숨은 항목과 추가 비용 위험,<br/>AI가 30초 만에 찾아드려요.</p>
      <Link href="/quote" className="relative inline-block mt-3.5 h-11 leading-[44px] px-5 rounded-xl bg-white text-brand-700 font-extrabold text-sm shadow-sm">내 견적 AI 분석하기</Link>
    </div>
  );

  const ddayCard = (
    <div className="rounded-[22px] bg-white p-5 shadow-[0_10px_30px_rgba(139,111,232,0.13)]">
      {prof?.wedding_date ? (() => {
        const dd = Math.ceil((new Date(prof.wedding_date) - new Date()) / 86400000);
        const idx = dd > 270 ? 0 : dd > 150 ? 1 : dd > 30 ? 2 : dd >= 0 ? 3 : 4;
        const ckCnt = Object.values(prof.checklist || {}).filter(Boolean).length;
        const pct = ckCnt > 0 ? Math.min(100, Math.round((ckCnt / 8) * 100)) : (idx / (STEPS.length - 1)) * 100;
        return (<>
          <div className="flex items-end justify-between"><div><div className="text-[13px] text-muted font-bold">{name}님의 결혼 준비</div><div className="text-[26px] font-extrabold text-brand-600 leading-tight">{dd >= 0 ? `D-${dd}` : `D+${-dd}`}</div></div><div className="text-sm text-muted font-bold">{STEPS[idx]} 단계</div></div>
          <div className="mt-3 h-2 bg-brand-100 rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full" style={{ width: `${pct}%` }} /></div>
          <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">{STEPS.map((s, i) => (<span key={s} className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${i <= idx ? "bg-brand-50 text-brand-700" : "bg-surface text-muted"}`}>{s}</span>))}</div>
        </>);
      })() : (<>
        <div className="text-[15px] font-extrabold text-ink">예식일을 알려주세요</div>
        <p className="text-[13px] text-muted mt-1 leading-relaxed">예식일에 맞춰 준비 일정과 확인할 항목을 챙겨드려요.</p>
        {user ? (
          <div className="flex gap-2 mt-3">
            <input type="date" value={wd} onChange={(e) => setWd(e.target.value)} className="flex-1 min-w-0 h-11 rounded-xl border border-line px-3 text-sm text-ink bg-white" />
            <button onClick={saveDate} className="h-11 px-4 rounded-xl bg-brand-500 text-white font-bold text-sm shrink-0">저장</button>
          </div>
        ) : (
          <Link href="/login" className="inline-block mt-3 h-11 leading-[44px] px-5 rounded-xl bg-brand-50 text-brand-700 font-bold text-sm">로그인하고 일정 받기</Link>
        )}
      </>)}
    </div>
  );

  return (
    <div className="min-h-screen bg-aurora md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="md:hidden sticky top-0 z-30 bg-transparent px-4 py-3 flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo_full.png" alt="스드맵" className="h-7 w-auto" />
          <span className="ml-2 text-[10px] font-extrabold text-white px-2 py-[3px] rounded-full" style={{ background: "linear-gradient(125deg,#8B6FE8,#A88BF2)" }}>AI 웨딩 비교</span>
          <Link href="/notifications" className="ml-auto relative"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>{unread > 0 && <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 rounded-full bg-[#FF8A65] text-white text-[9px] font-extrabold flex items-center justify-center border border-white">{unread > 9 ? "9+" : unread}</span>}</Link>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-8 pt-2 md:pt-6">
          {/* 인사말 헤드라인 */}
          <div className="pt-3 pb-4 anim-up">
            <h1 className="text-[24px] font-extrabold leading-[1.32] tracking-tight text-ink">
              {saveMan
                ? (<>{name}님, 비교만 잘해도<br /><span className="text-grad">{saveMan}만원 아낄</span> 수 있어요</>)
                : user
                  ? (<>{name}님,<br />오늘도 <span className="text-grad">현명한 결혼 준비</span> 하세요</>)
                  : (<>결혼 준비,<br /><span className="text-grad">AI가 가장 현명한 선택</span>으로</>)}
            </h1>
            {prof?.wedding_date && <p className="text-[13px] text-muted mt-1.5 font-medium">D-{Math.max(0, Math.ceil((new Date(prof.wedding_date) - new Date()) / 86400000))} · 체크리스트 {Object.values(prof.checklist || {}).filter(Boolean).length}/8</p>}
          </div>

          {/* 검색 */}
          <form onSubmit={(e) => { e.preventDefault(); router.push(kw.trim() ? `/search?q=${encodeURIComponent(kw.trim())}` : "/search"); }} className="flex items-center gap-2 bg-white/85 backdrop-blur rounded-[18px] px-4 h-[52px] shadow-[0_8px_28px_rgba(139,111,232,0.14)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-brand-500 shrink-0"><circle cx="11" cy="11" r="7"/><path d="M21 21l-3.5-3.5"/></svg>
            <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="업체명, 지역, 키워드로 검색" className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-ink placeholder:text-muted" />
            {kw && <button type="submit" className="shrink-0 h-8 px-3 rounded-lg bg-brand-500 text-white text-[12px] font-bold">검색</button>}
          </form>

          {/* 빠른 메뉴 (모바일 전용) */}
          <div className="md:hidden"><IconQuickMenu categories={cats} /></div>

          {/* 가이드 배너 */}
          <Link href="/guide" className="mt-4 flex items-center gap-3 bg-white rounded-[20px] px-4 py-3.5 shadow-[0_8px_24px_rgba(139,111,232,0.11)] press">
            <span className="w-9 h-9 rounded-xl bg-[#FFF2E8] text-[#E08A4A] flex items-center justify-center shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg></span>
            <span className="text-[13.5px] text-body leading-snug"><b className="text-ink">계약 전 꼭 물어볼 질문</b> — 카테고리별 추가금·질문 가이드</span>
            <span className="ml-auto text-muted">›</span>
          </Link>

          {/* 모바일: AI 체크 + 일정 */}
          <div className="grid gap-3 mt-5 md:hidden">
            {aiCard}
            {ddayCard}
          </div>

          {/* PC: 카테고리 카드 + 우측 AI/일정 */}
          <div className="hidden md:grid md:grid-cols-[1.75fr_1fr] gap-5 mt-7 items-start">
            <section>
              <h2 className="text-[21px] font-extrabold text-ink mb-4">결혼 준비, 어디서부터 시작할까요?</h2>
              <div className="grid grid-cols-4 gap-3.5">
                {PC_CATS.map(([k, l, im]) => (
                  <Link key={k} href={`/search?cat=${k}`} className="group rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] overflow-hidden shadow-card hover:-translate-y-0.5 hover:shadow-lg transition">
                    <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url('${im}')` }} />
                    <div className="px-3.5 py-3"><b className="text-[15px] text-ink">{l}</b><div className="text-[12px] text-muted mt-0.5">비교하러 가기 ›</div></div>
                  </Link>
                ))}
              </div>
            </section>
            <section className="space-y-3">
              {aiCard}
              {ddayCard}
            </section>
          </div>

          {compareV.length > 0 && (
            <section className="pt-8"><SectionHeader title="내 비교함" more="/compare" /><div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">{compareV.slice(0, 4).map((v) => <VendorCard key={v.id} v={v} />)}</div></section>
          )}

          <section className="pt-8">
            <SectionHeader title="지금 많이 비교하는 업체" sub="추가금 위험과 예상 최종가를 함께 확인하세요" more="/search" />
            <div className="flex gap-3 overflow-x-auto no-scrollbar md:grid md:grid-cols-4 md:overflow-visible">
              {popular.slice(0, 4).map((v, i) => (<div key={v.id} className="w-[260px] md:w-auto shrink-0"><VendorCard v={v} rank={i + 1} /></div>))}
            </div>
          </section>

          <section className="pt-8 pb-2">
            <SectionHeader title="지역별 인기 업체" more="/search" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">{popular.slice(4, 8).map((v) => <VendorCard key={v.id} v={v} />)}</div>
          </section>
          <footer className="mt-10 pt-6 border-t border-line text-[11.5px] text-muted leading-relaxed pb-4">
            <div className="flex gap-3 font-bold mb-2">
              <Link href="/guide">계약 가이드</Link><Link href="/terms">이용약관</Link><Link href="/privacy" className="text-ink">개인정보처리방침</Link><Link href="/methodology">산정 방식</Link><Link href="/partner">입점 신청</Link>
            </div>
            스드맵 · 상호/대표자/사업자등록번호/통신판매업 신고번호: 등록 후 표기 예정<br />
            스드맵은 통신판매중개자로서 거래 당사자가 아니며, 상품·거래 정보 및 거래에 대한 책임은 입점 업체에 있습니다.
          </footer>
        </div>
      </div>
      <TabBar active="home" />
    </div>
  );
}
