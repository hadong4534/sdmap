"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { won, STATUS_KO } from "@/lib/const";
import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/TabBar";
import { EmptyState, VendorCard } from "@/components/ui";

const SC = { requested:"#E0922A", confirmed:"#7A5FE0", done:"#41C7A7", cancelled:"#9AA0AE" };

export default function Bookings() {
  const router = useRouter();
  const [items, setItems] = useState(null);
  const [rec, setRec] = useState([]);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user; if (!u) { router.replace("/login"); return; }
      const { data: b } = await supabase.from("bookings").select("*, vendors(name), products(name)").eq("user_id", u.id).order("created_at", { ascending: false });
      setItems(b || []);
      if (!b || b.length === 0) supabase.from("vendors").select("*").eq("status","active").order("review_count",{ascending:false}).limit(3).then(({data})=>setRec(data||[]));
    });
  }, [router]);

  const cnt = (st) => (items||[]).filter(b=>b.status===st).length;
  const sum = [["예정/요청", cnt("requested")],["확정", cnt("confirmed")],["완료", cnt("done")],["전체", (items||[]).length]];

  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-8">
        <header className="bg-white border-b border-line"><div className="max-w-5xl mx-auto px-4 md:px-8 py-4 font-extrabold text-[20px]">내 예약 / 계약</div></header>
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-5">
          {items === null ? <p className="text-center text-muted text-sm py-12">불러오는 중...</p> :
           items.length === 0 ? (
            <>
              <EmptyState title="아직 예약·상담 내역이 없어요" desc="업체 탐색에서 상담을 신청하면 이곳에서 일정과 계약을 관리할 수 있어요." ctaLabel="업체 탐색하기" ctaHref="/search" />
              <div className="mt-6"><div className="font-extrabold text-ink mb-3">최근 본 업체는 어때요?</div><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{rec.map(v=><VendorCard key={v.id} v={v} />)}</div></div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-3 mb-5">{sum.map(([l,n])=>(<div key={l} className="rounded-2xl border border-line bg-white p-3 md:p-4 text-center"><div className="text-[22px] md:text-[26px] font-extrabold text-brand-600">{n}</div><div className="text-[11px] md:text-[13px] text-muted font-bold mt-0.5">{l}</div></div>))}</div>
              <div className="space-y-3">
                {items.map(b=>(
                  <div key={b.id} className="bg-white border border-line rounded-2xl p-4">
                    <div className="flex justify-between items-start">
                      <div><div className="font-extrabold text-[17px]">{b.vendors?.name}</div><div className="text-[13px] text-muted mt-0.5">{b.products?.name || "상담 신청"}</div></div>
                      <span className="text-[12px] font-extrabold px-2.5 py-1 rounded-lg text-white" style={{ background: SC[b.status] }}>{STATUS_KO[b.status]}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-[14px] text-body">{b.booking_date || "일정 협의"} {b.booking_time || ""} · <b className="text-brand-600">{won(b.amount)}</b></div>
                      <div className="flex gap-1.5">
                        {b.status === "done" && <Link href={`/shop/${b.vendor_id}`} className="text-[12px] font-bold text-white bg-brand-500 px-3 py-1.5 rounded-lg">후기 쓰기 ★</Link>}
                        <Link href={`/shop/${b.vendor_id}`} className="text-[12px] font-bold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg">업체 보기</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <TabBar active="my" />
    </div>
  );
}
