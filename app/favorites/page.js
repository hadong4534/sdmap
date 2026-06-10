"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import TabBar from "@/components/TabBar";
import Sidebar from "@/components/Sidebar";
import { VendorListItem, EmptyState } from "@/components/ui";
import { useCompare } from "@/lib/compare";

export default function Favorites() {
  const router = useRouter();
  const [items, setItems] = useState(null);
  const { ids } = useCompare();

  async function load(uid) {
    const { data: f } = await supabase.from("favorites").select("vendors(*)").eq("user_id", uid);
    setItems((f || []).map((x) => x.vendors).filter(Boolean));
  }
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user; if (!u) { router.replace("/login"); return; }
      load(u.id);
    });
  }, [router]);

  const inCompareCnt = items ? items.filter((v) => ids.includes(v.id)).length : 0;

  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="bg-white border-b border-line"><div className="max-w-3xl mx-auto px-4 md:px-8 py-4 font-extrabold text-lg">위시리스트 {items ? <span className="text-muted text-sm font-bold">{items.length}곳</span> : null}</div></header>
        <main className="max-w-3xl mx-auto px-4 md:px-8 py-5 space-y-3">
          {items === null && <p className="text-center text-muted text-sm py-10">불러오는 중...</p>}
          {items && items.length > 0 && (
            <div className="rounded-2xl border border-brand-100 bg-white p-4 flex items-center justify-between">
              <div className="text-[13.5px] text-body"><b className="text-brand-700">{inCompareCnt}곳</b>이 비교함에 담겨 있어요. 카드의 <b>비교</b> 버튼으로 담아 한눈에 비교해 보세요.</div>
              <Link href="/compare" className="shrink-0 h-10 px-4 rounded-xl bg-brand-500 text-white text-[13px] font-bold flex items-center">비교함 →</Link>
            </div>
          )}
          {items?.map((v) => <VendorListItem key={v.id} v={v} />)}
          {items && items.length === 0 && (
            <EmptyState
              title="아직 찜한 업체가 없어요"
              desc="마음에 드는 업체에 하트를 눌러 모아두면, 커플이 함께 보고 비교할 수 있어요."
              ctaLabel="업체 둘러보기"
              ctaHref="/search"
            />
          )}
        </main>
      </div>
      <TabBar active="fav" />
    </div>
  );
}
