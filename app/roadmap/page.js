"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";

const STEPS = [
  { t: "웨딩홀", d: "지역·보증인원·식대 비교 후 예약", min: 240 },
  { t: "스드메", d: "스튜디오·드레스·메이크업 정찰가 비교", min: 150, href: "/search?cat=studio", cta: "스드메 비교하러 가기" },
  { t: "본식 촬영", d: "촬영 일정·원본 제공 조건 확인", min: 90 },
  { t: "드레스 투어", d: "피팅 일정 잡기", min: 60 },
  { t: "본식", d: "예식 진행·식순 준비", min: 0 },
  { t: "신혼여행", d: "패키지 예약", min: -30 },
  { t: "출산 준비", d: "산후조리원·육아 준비", min: -365 },
  { t: "돌잔치", d: "돌상·답례품 준비", min: -730 },
];

export default function Roadmap() {
  const [user, setUser] = useState(null);
  const [prof, setProf] = useState(null);
  const [wd, setWd] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [ck, setCk] = useState({});

  useEffect(() => {
    if (!supabase) { setLoaded(true); return; }
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user ?? null; setUser(u);
      if (u) { const { data: p } = await supabase.from("profiles").select("wedding_date, checklist").eq("id", u.id).maybeSingle(); setProf(p || {}); setCk(p?.checklist || {}); }
      setLoaded(true);
    });
  }, []);

  async function toggle(key) {
    if (!user) return;
    const next = { ...ck, [key]: !ck[key] };
    setCk(next);
    await supabase.from("profiles").update({ checklist: next }).eq("id", user.id);
  }
  const doneCnt = STEPS.filter((s) => ck[s.t]).length;

  const dd = prof?.wedding_date ? Math.ceil((new Date(prof.wedding_date) - new Date()) / 86400000) : null;
  const nowIdx = dd === null ? -1 : STEPS.findIndex((s, i) => dd >= s.min || i === STEPS.length - 1);

  return (
    <div className="min-h-screen bg-aurora md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="bg-white/75 backdrop-blur-xl border-b border-white/50"><div className="max-w-4xl mx-auto px-4 md:px-8 py-4 font-extrabold text-lg">준비 로드맵</div></header>
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <div className="rounded-2xl bg-white border border-brand-100 p-5 shadow-card">
            {dd !== null ? (<>
              <div className="text-[26px] font-black tracking-tight">{dd >= 0 ? `D-${dd}` : `D+${-dd}`}</div>
              <div className="mt-2.5 h-2 bg-white/25 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: `${Math.max(6, (doneCnt / STEPS.length) * 100)}%` }} /></div>
              <div className="text-[12px] text-white/85 mt-1.5">체크리스트 <b className="text-white">{doneCnt}/{STEPS.length}</b> · 현재 단계: <b className="text-white">{STEPS[nowIdx]?.t}</b></div>
            </>) : (<>
              <div className="text-[15px] font-extrabold text-ink">예식일을 알려주시면 일정에 맞춰 정리해드려요</div>
              {loaded && (user ? (
                <div className="flex gap-2 mt-3">
                  <input type="date" value={wd} onChange={(e)=>setWd(e.target.value)} className="flex-1 h-11 rounded-xl border border-line px-3 text-sm text-ink bg-white" />
                  <button onClick={async()=>{ if(!wd) return; await supabase.from("profiles").upsert({ id: user.id, wedding_date: wd }); setProf({ ...(prof||{}), wedding_date: wd }); }} className="h-11 px-4 rounded-xl bg-brand-500 text-white font-bold text-sm">저장</button>
                </div>
              ) : (
                <Link href="/login" className="inline-block mt-3 h-11 leading-[44px] px-5 rounded-xl bg-brand-50 text-brand-700 font-bold text-sm">로그인하고 일정 받기</Link>
              ))}
            </>)}
          </div>
          <div className="mt-6 relative pl-7">
            <div className="absolute left-[10px] top-1 bottom-1 w-0.5 bg-line" />
            {STEPS.map((s, i) => {
              const done = !!ck[s.t], now = i === nowIdx;
              return (
                <div key={i} className="relative pb-5">
                  <button onClick={() => toggle(s.t)} title="완료 체크" className={`absolute -left-7 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${done ? "bg-brand-600 text-white" : now ? "bg-brand-grad text-white" : "bg-white border border-line text-muted hover:border-brand-400"}`}>{done ? "✓" : i + 1}</button>
                  <div className={`rounded-xl border p-4 ${now ? "border-brand-300 bg-brand-50" : "border-line bg-white"}`}>
                    <div className="flex items-center justify-between"><div className="font-extrabold text-ink text-sm">{s.t} {now && !done && <span className="text-[11px] text-brand-700">진행 중</span>}{done && <span className="text-[11px] text-[#1FA888]">완료</span>}</div>{user && <button onClick={() => toggle(s.t)} className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${done ? "bg-[#E8F8F3] text-[#1FA888]" : "bg-brand-50 text-brand-700"}`}>{done ? "완료 ✓" : "완료 체크"}</button>}</div>
                    <div className="text-[13px] text-muted mt-0.5">{s.d}</div>
                    {now && s.href && <Link href={s.href} className="inline-block mt-2 text-[12px] font-bold text-white bg-brand-grad px-3 py-1.5 rounded-lg">{s.cta}</Link>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <TabBar active="roadmap" />
    </div>
  );
}
