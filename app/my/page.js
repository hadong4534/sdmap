"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import TabBar from "@/components/TabBar";

export default function My() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [prof, setProf] = useState(null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user; if (!u) { router.replace("/login"); return; }
      setUser(u);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
      setProf(p);
    });
  }, [router]);
  async function logout() { await supabase.auth.signOut(); router.replace("/login"); }
  const m = user?.user_metadata || {};
  const name = prof?.name || m.name || m.full_name || m.nickname || (user?.email ? user.email.split("@")[0] : "회원");
  const menu = [["개인정보 설정", "/onboarding"], ["내 예약 / 계약", "/bookings"], ["찜한 업체", "/favorites"], ["비교함", "/compare"]];
  return (
    <div className="min-h-screen bg-surface pb-20">
      <div className="bg-brand-grad text-white px-6 pt-8 pb-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white/25" />
          <div><div className="text-lg font-extrabold">{name}님</div><div className="text-xs opacity-90">{user?.email}</div></div>
        </div>
      </div>
      <main className="max-w-3xl mx-auto px-4 py-4">
        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          {menu.map(([l, h]) => (<Link key={h} href={h} className="flex items-center justify-between px-5 py-4 border-b border-line last:border-0 text-sm font-bold">{l}<span className="text-muted">›</span></Link>))}
        </div>
        {prof?.role === "admin" && <Link href="/admin" className="block mt-3 text-center bg-ink text-white rounded-xl py-3 text-sm font-bold">직원 관리자 페이지 →</Link>}
        <button onClick={logout} className="w-full mt-3 border border-line rounded-xl py-3 text-sm font-bold text-muted">로그아웃</button>
      </main>
      <TabBar active="my" />
    </div>
  );
}
