"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  ["/home", "홈", "M3 11l9-8 9 8M5 10v10h14V10"],
  ["/roadmap", "로드맵", "M4 6h16M4 12h16M4 18h10"],
  ["/search", "업체 탐색", "M11 4a7 7 0 105 12l4 4"],
  ["/compare", "비교함", "M9 4v16M15 4v16M4 9h16"],
  ["/quote", "견적 분석", "M7 3h7l5 5v13H7zM14 3v5h5"],
  ["/bookings", "계약 / 일정", "M3 4h18v17H3zM3 9h18M8 2v4M16 2v4"],
  ["/favorites", "커플 위시리스트", "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"],
  ["/my", "마이페이지", "M12 8a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6"],
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-white border-r border-line p-4">
      <Link href="/home" className="flex items-center px-2 py-2 mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo_full.png" alt="스드맵" className="h-7 w-auto" />
      </Link>
      <nav className="flex-1 space-y-1">
        {NAV.map(([href, label, d]) => {
          const on = path === href || (href !== "/home" && path.startsWith(href));
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${on ? "bg-brand-50 text-brand-700" : "text-body hover:bg-surface"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-2xl bg-brand-50 border border-brand-100 p-4 mt-3">
        <div className="text-xs text-muted font-bold">결혼 준비</div>
        <div className="text-xl font-extrabold mt-0.5 text-brand-700">D-218</div>
        <div className="mt-2 h-1.5 bg-brand-100 rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full" style={{ width: "32%" }} /></div>
        <div className="text-[11px] text-muted mt-1">진행률 32%</div>
      </div>
    </aside>
  );
}
