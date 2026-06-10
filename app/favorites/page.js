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
  const [mine, setMine] = useState(null);
  const [partnerFavs, setPartnerFavs] = useState([]);
  const [partner, setPartner] = useState(null);
  const { ids } = useCompare();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user; if (!u) { router.replace("/login"); return; }
      const [{ data: f }, { data: p }] = await Promise.all([
        supabase.from("favorites").select("vendors(*)").eq("user_id", u.id),
        supabase.from("profiles").select("partner_id").eq("id", u.id).maybeSingle(),
      ]);
      setMine((f || []).map((x) => x.vendors).filter(Boolean));
      if (p?.partner_id) {
        const [{ data: pf }, { data: pp }] = await Promise.all([
          supabase.from("favorites").select("vendors(*)").eq("user_id", p.partner_id),
          supabase.from("profiles").select("name").eq("id", p.partner_id).maybeSingle(),
        ]);
        setPartnerFavs((pf || []).map((x) => x.vendors).filter(Boolean));
        setPartner(pp);
      }
    });
  }, [router]);

  const mineIds = new Set((mine || []).map((v) => v.id));
  const partnerIds = new Set(partnerFavs.map((v) => v.id));
  const both = (mine || []).filter((v) => partnerIds.has(v.id));
  const onlyMine = (mine || []).filter((v) => !partnerIds.has(v.id));
  const onlyPartner = partnerFavs.filter((v) => !mineIds.has(v.id));
  const inCompareCnt = (mine || []).filter((v) => ids.includes(v.id)).length;
  const pname = partner?.name || "파트너";

  const Row = ({ v, badge, color }) => (
    <div className="relative">
      <VendorListItem v={v} />
      {badge && <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${color}`}>{badge}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="bg-white border-b border-line"><div className="max-w-3xl mx-auto px-4 md:px-8 py-4 font-extrabold text-lg">{partner ? "커플 위시리스트" : "위시리스트"} {mine ? <span className="text-muted text-sm font-bold">{mine.length + onlyPartner.length}곳</span> : null}</div></header>
        <main className="max-w-3xl mx-auto px-4 md:px-8 py-5 space-y-3">
          {mine === null && <p className="text-center text-muted text-sm py-10">불러오는 중...</p>}

          {mine && !partner && mine.length > 0 && (
            <div className="rounded-2xl border border-brand-100 bg-white p-4 text-[13.5px] text-body">
              <b className="text-brand-700">커플 계정을 연결</b>하면 두 분의 찜을 한눈에 볼 수 있어요. <Link href="/my" className="font-bold text-brand-600 underline underline-offset-2">마이페이지에서 연결 →</Link>
            </div>
          )}

          {mine && mine.length > 0 && (
            <div className="rounded-2xl border border-brand-100 bg-white p-4 flex items-center justify-between">
              <div className="text-[13.5px] text-body"><b className="text-brand-700">{inCompareCnt}곳</b>이 비교함에 담겨 있어요.</div>
              <Link href="/compare" className="shrink-0 h-10 px-4 rounded-xl bg-brand-500 text-white text-[13px] font-bold flex items-center">비교함 →</Link>
            </div>
          )}

          {partner && both.length > 0 && (
            <section>
              <div className="font-extrabold text-ink text-[15px] mb-2.5 mt-1">둘 다 찜한 업체 <span className="text-brand-600">{both.length}</span></div>
              <div className="space-y-2.5">{both.map((v) => <Row key={v.id} v={v} badge="둘 다 ♥" color="bg-brand-500 text-white" />)}</div>
            </section>
          )}
          {partner ? (
            <>
              {onlyMine.length > 0 && (
                <section>
                  <div className="font-extrabold text-ink text-[15px] mb-2.5 mt-2">내가 찜한 업체</div>
                  <div className="space-y-2.5">{onlyMine.map((v) => <Row key={v.id} v={v} />)}</div>
                </section>
              )}
              {onlyPartner.length > 0 && (
                <section>
                  <div className="font-extrabold text-ink text-[15px] mb-2.5 mt-2">{pname}님이 찜한 업체</div>
                  <div className="space-y-2.5">{onlyPartner.map((v) => <Row key={v.id} v={v} badge={`${pname} ♥`} color="bg-brand-50 text-brand-700" />)}</div>
                </section>
              )}
            </>
          ) : (
            mine?.map((v) => <VendorListItem key={v.id} v={v} />)
          )}

          {mine && mine.length === 0 && partnerFavs.length === 0 && (
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
