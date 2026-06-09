"use client";
import Link from "next/link";
const ICONS = {
  home: <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></>,
  compare: <path d="M7 20V11M12 20V5M17 20V14" />,
  roadmap: <path d="M4 4v16M4 5h12l-2 3 2 3H4" />,
  my: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
};
const ITEMS = [
  { k: "home", href: "/home", label: "홈" },
  { k: "search", href: "/search", label: "탐색" },
  { k: "compare", href: "/compare", label: "비교" },
  { k: "roadmap", href: "/roadmap", label: "로드맵" },
  { k: "my", href: "/my", label: "마이" },
];
export default function TabBar({ active }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line flex z-40 pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map((t) => (
        <Link key={t.k} href={t.href} className={`flex-1 h-16 flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${active === t.k ? "text-brand-600" : "text-muted"}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{ICONS[t.k]}</svg>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
