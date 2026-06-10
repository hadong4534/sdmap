"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { EmptyState } from "@/components/ui";

const ICONS = {
  booking_status: ["#8B6FE8", <path key="a" d="M8 2v3M16 2v3M3.5 9h17M5 5h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 21H5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5 5z" />],
  booking_new: ["#41C7A7", <path key="b" d="M8 2v3M16 2v3M3.5 9h17M5 5h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 21H5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5 5z" />],
  cs_answered: ["#8B6FE8", <path key="c" d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.6 0-3.1-.4-4.4-1.2L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5z" />],
  cs_new: ["#FF8A65", <path key="d" d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5c-1.6 0-3.1-.4-4.4-1.2L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5z" />],
  couple: ["#E8669A", <path key="e" d="M12 20s-7.5-4.6-7.5-10A4.5 4.5 0 0 1 12 6.5 4.5 4.5 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />],
};

function timeAgo(d) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return "방금";
  if (s < 3600) return `${Math.floor(s / 60)}분 전`;
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
  return `${Math.floor(s / 86400)}일 전`;
}

export default function Notifications() {
  const router = useRouter();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user; if (!u) { router.replace("/login"); return; }
      const { data: n } = await supabase.from("notifications").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).limit(50);
      setItems(n || []);
      // 열람 시 읽음 처리
      const unread = (n || []).filter((x) => !x.read).map((x) => x.id);
      if (unread.length) await supabase.from("notifications").update({ read: true }).in("id", unread);
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-aurora md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="bg-white/75 backdrop-blur-xl border-b border-white/50"><div className="max-w-2xl mx-auto px-4 md:px-8 py-4 flex items-center gap-2"><button onClick={() => router.back()} className="md:hidden text-xl text-muted pr-1">‹</button><b className="text-lg">알림</b></div></header>
        <main className="max-w-2xl mx-auto px-4 md:px-8 py-5 space-y-2.5">
          {items === null && <p className="text-center text-muted text-sm py-10">불러오는 중...</p>}
          {items?.map((n) => {
            const [color, icon] = ICONS[n.type] || ICONS.booking_status;
            const Inner = (
              <div className={`flex gap-3 rounded-2xl border p-4 ${n.read ? "bg-white border-transparent shadow-[0_3px_12px_rgba(37,34,54,0.05)]" : "bg-white border-transparent shadow-[0_5px_18px_rgba(37,34,54,0.09)] ring-1 ring-brand-200"}`}>
                <span className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center" style={{ background: color + "1A" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <b className="text-[14px] text-ink leading-snug">{n.title}</b>
                    <span className="text-[11px] text-muted shrink-0 mt-0.5">{timeAgo(n.created_at)}</span>
                  </div>
                  {n.body && <p className="text-[12.5px] text-muted mt-0.5 leading-relaxed">{n.body}</p>}
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />}
              </div>
            );
            return n.link ? <Link key={n.id} href={n.link} className="block">{Inner}</Link> : <div key={n.id}>{Inner}</div>;
          })}
          {items && items.length === 0 && (
            <EmptyState title="아직 알림이 없어요" desc="상담 신청 결과, 문의 답변, 커플 연결 소식이 여기에 도착해요." ctaLabel="업체 둘러보기" ctaHref="/search" />
          )}
        </main>
      </div>
      <TabBar active="" />
    </div>
  );
}
