"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { won, STATUS_KO } from "@/lib/const";
import TabBar from "@/components/TabBar";

export default function Bookings() {
  const router = useRouter();
  const [items, setItems] = useState(null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user; if (!u) { router.replace("/login"); return; }
      const { data: b } = await supabase.from("bookings").select("*, vendors(name), products(name)").eq("user_id", u.id).order("created_at", { ascending: false });
      setItems(b || []);
    });
  }, [router]);
  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-white border-b border-line"><div className="max-w-3xl mx-auto px-4 py-4 font-extrabold">내 예약</div></header>
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        {items === null && <p className="text-center text-muted text-sm py-10">불러오는 중...</p>}
        {items?.map((b) => (
          <div key={b.id} className="bg-white border border-line rounded-2xl p-4">
            <div className="flex justify-between items-start">
              <div><div className="font-extrabold">{b.vendors?.name}</div><div className="text-xs text-muted mt-0.5">{b.products?.name}</div></div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700">{STATUS_KO[b.status]}</span>
            </div>
            <div className="text-sm text-body mt-2">{b.booking_date} {b.booking_time} · <b className="text-brand-700">{won(b.amount)}</b></div>
          </div>
        ))}
        {items && items.length === 0 && <p className="text-center text-muted text-sm py-10">예약 내역이 없어요.<br/><Link href="/search" className="text-brand-700 font-bold">업체 둘러보기 →</Link></p>}
      </main>
      <TabBar active="book" />
    </div>
  );
}
