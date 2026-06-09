"use client";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";

const STEPS = [
  { t: "웨딩홀", d: "지역·보증인원·식대 비교 후 예약", done: true },
  { t: "스드메", d: "스튜디오·드레스·메이크업 정찰가 비교", now: true },
  { t: "본식 촬영", d: "촬영 일정·원본 제공 조건 확인" },
  { t: "드레스 투어", d: "피팅 일정 잡기" },
  { t: "본식", d: "예식 진행·식순 준비" },
  { t: "신혼여행", d: "패키지 예약" },
  { t: "출산 준비", d: "산후조리원·육아 준비" },
  { t: "돌잔치", d: "돌상·답례품 준비" },
];

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="bg-white border-b border-line"><div className="max-w-4xl mx-auto px-4 md:px-8 py-4 font-extrabold text-lg">준비 로드맵</div></header>
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-6">
          <div className="rounded-2xl bg-brand-grad text-white p-5">
            <div className="text-sm opacity-90 font-bold">결혼 준비 D-218</div>
            <div className="mt-2 h-2 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full" style={{ width: "32%" }} /></div>
            <div className="text-[12px] opacity-90 mt-1">진행률 32% · 현재 단계: 스드메</div>
          </div>
          <div className="mt-6 relative pl-7">
            <div className="absolute left-[10px] top-1 bottom-1 w-0.5 bg-line" />
            {STEPS.map((s, i) => (
              <div key={i} className="relative pb-5">
                <span className={`absolute -left-7 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${s.now ? "bg-brand-grad text-white" : s.done ? "bg-brand-600 text-white" : "bg-white border border-line text-muted"}`}>{s.done ? "✓" : i + 1}</span>
                <div className={`rounded-xl border p-4 ${s.now ? "border-brand-300 bg-brand-50" : "border-line bg-white"}`}>
                  <div className="font-extrabold text-ink text-sm">{s.t} {s.now && <span className="text-[11px] text-brand-700">진행 중</span>}</div>
                  <div className="text-[13px] text-muted mt-0.5">{s.d}</div>
                  {s.now && <Link href="/search?cat=studio" className="inline-block mt-2 text-[12px] font-bold text-white bg-brand-grad px-3 py-1.5 rounded-lg">스드메 비교하러 가기</Link>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <TabBar active="roadmap" />
    </div>
  );
}
