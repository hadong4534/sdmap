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
  const [notes, setNotes] = useState({}); // vendorId -> { mine, partner }
  const [draft, setDraft] = useState({});
  const [uid, setUid] = useState(null);
  const { ids } = useCompare();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user; if (!u) { router.replace("/login"); return; }
      setUid(u.id);
      const [{ data: f }, { data: p }] = await Promise.all([
        supabase.from("favorites").select("note, vendors(*)").eq("user_id", u.id),
        supabase.from("profiles").select("partner_id").eq("id", u.id).maybeSingle(),
      ]);
      setMine((f || []).map((x) => x.vendors).filter(Boolean));
      const nmap = {};
      (f || []).forEach((x) => { if (x.vendors) nmap[x.vendors.id] = { ...(nmap[x.vendors.id] || {}), mine: x.note || "" }; });
      if (p?.partner_id) {
        const [{ data: pf }, { data: pp }] = await Promise.all([
          supabase.from("favorites").select("note, vendors(*)").eq("user_id", p.partner_id),
          supabase.from("profiles").select("name").eq("id", p.partner_id).maybeSingle(),
        ]);
        setPartnerFavs((pf || []).map((x) => x.vendors).filter(Boolean));
        (pf || []).forEach((x) => { if (x.vendors) nmap[x.vendors.id] = { ...(nmap[x.vendors.id] || {}), partner: x.note || "" }; });
        setPartner(pp);
      }
      setNotes(nmap);
      setDraft(Object.fromEntries(Object.entries(nmap).map(([k, v]) => [k, v.mine || ""])));
    });
  }, [router]);

  const mineIds = new Set((mine || []).map((v) => v.id));
  const partnerIds = new Set(partnerFavs.map((v) => v.id));
  const both = (mine || []).filter((v) => partnerIds.has(v.id));
  const onlyMine = (mine || []).filter((v) => !partnerIds.has(v.id));
  const onlyPartner = partnerFavs.filter((v) => !mineIds.has(v.id));
  const inCompareCnt = (mine || []).filter((v) => ids.includes(v.id)).length;
  const pname = partner?.name || "파트너";

  async function saveNote(vid) {
    const text = (draft[vid] || "").trim();
    await supabase.from("favorites").update({ note: text || null }).eq("user_id", uid).eq("vendor_id", vid);
    setNotes({ ...notes, [vid]: { ...(notes[vid] || {}), mine: text } });
  }

  const Row = ({ v, badge, color }) => (
    <div className="relative">
      <VendorListItem v={v} />
      {badge && <span className={`absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${color}`}>{badge}</span>}
      {partner && mineIds.has(v.id) && (
        <div className="mt-1.5 flex gap-2 items-center">
          <input
            value={draft[v.id] ?? ""}
            onChange={(e) => setDraft({ ...draft, [v.id]: e.target.value })}
            onBlur={() => saveNote(v.id)}
            placeholder="내 의견 남기기 (예: 야외 분위기가 좋아!)"
            maxLength={80}
            className="flex-1 h-9 rounded-xl border border-line px-3 text-[12.5px] bg-white outline-none focus:border-brand-300"
          />
        </div>
      )}
      {partner && notes[v.id]?.partner && (
        <div className="mt-1.5 text-[12.5px] text-body bg-brand-50/70 rounded-xl px-3 py-2"><b className="text-brand-700">{pname}</b> · {notes[v.id].partner}</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-aurora md:flex">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="bg-white/75 backdrop-blur-xl border-b border-white/50"><div className="max-w-3xl mx-auto px-4 md:px-8 py-4 font-extrabold text-lg">{partner ? "커플 위시리스트" : "위시리스트"} {mine ? <span className="text-muted text-sm font-bold">{mine.length + onlyPartner.length}곳</span> : null}</div></header>
        <main className="max-w-3xl mx-auto px-4 md:px-8 py-5 space-y-3">
          {mine === null && <p className="text-center text-muted text-sm py-10">불러오는 중...</p>}

          {mine && !partner && mine.length > 0 && (
            <div className="rounded-[20px] bg-white shadow-[0_4px_16px_rgba(37,34,54,0.06)] p-4 text-[13.5px] text-body">
              <b className="text-brand-700">커플 계정을 연결</b>하면 두 분의 찜을 한눈에 볼 수 있어요. <Link href="/my" className="font-bold text-brand-600 underline underline-offset-2">마이페이지에서 연결 →</Link>
            </div>
          )}

          {mine && mine.length > 0 && (
            <div className="rounded-[20px] bg-white shadow-[0_4px_16px_rgba(37,34,54,0.06)] p-4 flex items-center justify-between">
              <div className="text-[13.5px] text-body"><b className="text-brand-700">{inCompareCnt}곳</b>이 비교함에 담겨 있어요.</div>
              <Link href="/compare" className="shrink-0 h-10 px-4 rounded-xl bg-brand-500 text-white text-[13px] font-bold flex items-center">비교함 →</Link>
            </div>
          )}

          {partner && (both.length + onlyMine.length + onlyPartner.length) >= 2 && (() => {
            const all = [...both, ...onlyMine, ...onlyPartner];
            const fmtMan = (n) => `${Math.round((n || 0) / 10000)}만원`;
            const cheap = [...all].sort((a, b) => (a.estimated_final_price || 0) - (b.estimated_final_price || 0))[0];
            const safe = [...all].sort((a, b) => (a.risk_score || 99) - (b.risk_score || 99))[0];
            const balanced = [...all].sort((a, b) => {
              const score = (v) => (v.estimated_final_price || 0) / 1000000 + (v.risk_score || 50) / 25 - (v.rating || 4) * 0.8;
              return score(a) - score(b);
            })[0];
            return (
              <div className="rounded-[20px] bg-white shadow-[0_4px_16px_rgba(37,34,54,0.06)] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9z"/></svg></span>
                  <b className="text-[15.5px] text-ink">스드맵 AI 커플 요약</b>
                </div>
                <ul className="space-y-2 text-[13.5px] text-body leading-relaxed">
                  <li className="flex gap-2"><span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />두 분이 함께 찜한 업체는 <b>{both.length}곳</b>이에요.{both.length === 0 && " 서로의 찜을 둘러보고 후보를 좁혀보세요."}</li>
                  <li className="flex gap-2"><span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#41C7A7] shrink-0" />예산을 우선하면 <b>{cheap.name}</b>({fmtMan(cheap.estimated_final_price)}), 추가금 안정성을 우선하면 <b>{safe.name}</b>(위험 {safe.risk_score})이 좋아 보여요.</li>
                  <li className="flex gap-2"><span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />가격·위험·후기를 함께 보면 <b className="text-brand-700">{balanced.name}</b>이 가장 균형이 좋아요. 상담 시 미포함 항목을 확인해 보세요.</li>
                </ul>
              </div>
            );
          })()}

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
