"use client";
import Link from "next/link";
const ICONS = {
  home: <path d="M3 11l9-8 9 8M5 10v10h14V10" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></>,
  compare: <path d="M7 20V11M12 20V5M17 20V14" />,
  ai: <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" />,
  my: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
};
const ITEMS = [
  { k: "home", href: "/home", label: "홈" },
  { k: "search", href: "/search", label: "탐색" },
  { k: "compare", href: "/compare", label: "비교" },
  { k: "ai", href: "/quote", label: "AI 체크" },
  { k: "my", href: "/my", label: "마이" },
];
export default function TabBar({ active }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line flex z-40 pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map((t) => (
        <Link key={t.k} href={t.href} className={`relative flex-1 h-[70px] flex flex-col items-center justify-center gap-1 text-[11.5px] ${active === t.k ? "text-brand-600 font-extrabold" : "text-muted font-bold"}`}>
          {active === t.k && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-[3px] rounded-b-full bg-brand-500" />}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active === t.k ? 2.4 : 1.9} strokeLinecap="round" strokeLinejoin="round">{ICONS[t.k]}</svg>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
