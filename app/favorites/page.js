"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CATS, CAT_IMG } from "@/lib/const";
import TabBar from "@/components/TabBar";

const bg = (s) => ({ backgroundImage: `url('${s}')`, backgroundSize: "cover", backgroundPosition: "center" });

export default function Favorites() {
  const router = useRouter();
  const [items, setItems] = useState(null);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user; if (!u) { router.replace("/login"); return; }
      const { data: f } = await supabase.from("favorites").select("vendors(*)").eq("user_id", u.id);
      setItems((f || []).map((x) => x.vendors).filter(Boolean));
    });
  }, [router]);
  return (
    <div className="min-h-screen bg-surface pb-20">
      <header className="bg-white border-b border-line"><div className="max-w-3xl mx-auto px-4 py-4 font-extrabold">찜한 업체</div></header>
      <main className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        {items === null && <p className="text-center text-muted text-sm py-10">불러오는 중...</p>}
        {items?.map((v) => (
          <Link key={v.id} href={`/shop/${v.id}`} className="flex gap-3 bg-white border border-line rounded-2xl p-3">
            <div className="w-20 h-20 rounded-xl shrink-0" style={bg(v.thumbnail_url || CAT_IMG[v.category])} />
            <div className="flex-1 min-w-0"><div className="font-extrabold text-sm">{v.name}</div><div className="text-xs text-muted mt-0.5">{v.region} · {CATS[v.category]}</div><div className="text-xs text-warn font-extrabold mt-2">★ {v.rating}</div></div>
          </Link>
        ))}
        {items && items.length === 0 && <p className="text-center text-muted text-sm py-10">찜한 업체가 없어요.<br/><Link href="/search" className="text-brand-700 font-bold">업체 둘러보기 →</Link></p>}
      </main>
      <TabBar active="fav" />
    </div>
  );
}
