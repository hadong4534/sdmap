"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CATS, CAT_IMG, won } from "@/lib/const";
import TabBar from "@/components/TabBar";

const bg = (src) => ({ backgroundImage: `url('${src}')`, backgroundSize: "cover", backgroundPosition: "center" });

function VendorCard({ v }) {
  return (
    <Link href={`/shop/${v.id}`} className="rounded-2xl overflow-hidden bg-white border border-line block">
      <div className="h-32 md:h-40 relative" style={bg(v.thumbnail_url || CAT_IMG[v.category])}>
        <span className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-brand-500 text-sm">♡</span>
      </div>
      <div className="p-3">
        <div className="font-extrabold text-sm md:text-[15px] text-ink truncate">{v.name}</div>
        <div className="text-[12px] text-muted mt-0.5 truncate">{v.region} · {CATS[v.category]}</div>
        <div className="text-[12px] text-warn font-extrabold mt-1.5">★ {v.rating} <span className="text-muted font-normal">({v.review_count})</span></div>
      </div>
    </Link>
  );
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [seg, setSeg] = useState("all");

  useEffect(() => {
    if (!supabase) return;
    const check = async (u) => {
      setUser(u);
      if (u) {
        const { data: prof } = await supabase.from("profiles").select("phone").eq("id", u.id).maybeSingle();
        if (!prof || !prof.phone) router.replace("/onboarding");
      }
    };
    supabase.auth.getUser().then(({ data }) => check(data?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    supabase.from("vendors").select("*").eq("status", "active").order("review_count", { ascending: false }).limit(12).then(({ data }) => setVendors(data || []));
    return () => sub.subscription.unsubscribe();
  }, [router]);

  const mm = user?.user_metadata || {};
  const displayName = user ? (mm.name || mm.full_name || mm.nickname || (user.email ? user.email.split("@")[0] : "회원")) : null;
  async function logout() { if (supabase) { await supabase.auth.signOut(); setUser(null); } }

  const filtered = seg === "all" ? vendors : vendors.filter((v) => v.category === seg);

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      <header className="sticky top-0 z-30 bg-white border-b border-line">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 py-3">
            <Link href="/home" className="flex items-center gap-1.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo_icon.png" alt="스드맵" className="h-8 w-auto" />
              <span className="font-extrabold text-lg text-brand-700">스드맵</span>
            </Link>
            <Link href="/search" className="hidden md:flex flex-1 items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-3.5 py-2.5">
              <span className="text-brand-500">🔍</span><span className="text-[13px] text-muted">스튜디오, 드레스, 메이크업, 웨딩홀 검색</span>
            </Link>
            <nav className="hidden lg:flex gap-4 text-[13.5px] font-bold text-body shrink-0">
              <Link href="/search?cat=studio">스튜디오</Link><Link href="/search?cat=dress">드레스</Link><Link href="/search?cat=makeup">메이크업</Link><Link href="/search?cat=hall">웨딩홀</Link>
            </nav>
            <div className="flex-1 md:hidden" />
            {user ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[13px] font-bold text-ink hidden sm:inline">{displayName}님</span>
                <button onClick={logout} className="text-[13px] font-bold text-muted border border-line rounded-lg px-3 py-2">로그아웃</button>
              </div>
            ) : <Link href="/login" className="bg-brand-grad text-white font-extrabold text-[13px] px-4 py-2 rounded-lg shrink-0">로그인</Link>}
          </div>
          <div className="md:hidden pb-3 space-y-2">
            <div className="text-[13px] font-bold text-ink">📍 서울 강남구 <span className="text-muted">▾</span></div>
            <Link href="/search" className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-3.5 py-3">
              <span className="text-brand-500">🔍</span><span className="text-[13px] text-muted">스튜디오, 드레스, 홀 검색</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative h-[200px] md:h-[340px] flex items-end md:items-center" style={bg("/images/hero.png")}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10 md:bg-gradient-to-r md:from-brand-900/70 md:via-brand-900/30 md:to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto w-full px-5 md:px-10 pb-5 md:pb-0 text-white">
          <h2 className="text-[22px] md:text-4xl font-extrabold leading-snug drop-shadow">결혼 준비의 시작과 끝,<br />한 곳에서.</h2>
          <p className="mt-2 text-[13px] md:text-base text-white/95 drop-shadow">정찰제 가격을 한눈에 비교하고, 바로 예약하세요.</p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 md:px-8">
        <section className="pt-6">
          <h3 className="text-base md:text-xl font-extrabold mb-3">카테고리</h3>
          <div className="grid grid-cols-4 gap-2.5 md:gap-4">
            {Object.keys(CATS).map((c) => (
              <Link key={c} href={`/search?cat=${c}`} className="flex flex-col items-center gap-2">
                <div className="w-full aspect-square rounded-2xl overflow-hidden" style={bg(CAT_IMG[c])} />
                <span className="text-[12px] md:text-sm font-bold text-ink">{CATS[c]}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-8">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-base md:text-xl font-extrabold">스드메 TOP</h3>
            <Link href="/search" className="text-[12px] text-muted font-bold">전체보기 ›</Link>
          </div>
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
            {[["all", "전체"], ...Object.entries(CATS)].map(([k, label]) => (
              <button key={k} onClick={() => setSeg(k)} className={`text-[13px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap ${seg === k ? "bg-brand-grad text-white" : "bg-brand-50 text-brand-700"}`}>{label}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {filtered.map((v) => <VendorCard key={v.id} v={v} />)}
            {filtered.length === 0 && <p className="col-span-full text-center text-muted text-sm py-8">표시할 업체가 없어요.</p>}
          </div>
        </section>

        <section className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl p-5 md:p-6 text-white bg-brand-grad"><small className="text-xs opacity-90 font-bold">6월 한정</small><b className="text-lg block mt-1">스드메 패키지 최대 30%</b></div>
          <div className="rounded-2xl p-5 md:p-6 text-white bg-brand-glow"><small className="text-xs opacity-90 font-bold">신규가입 혜택</small><b className="text-lg block mt-1">첫 예약 5만원 즉시 할인</b></div>
        </section>

        <section className="pt-8 pb-10">
          <h3 className="text-base md:text-xl font-extrabold mb-3">결혼 매거진</h3>
          <div className="rounded-2xl overflow-hidden border border-line bg-white md:flex">
            <div className="h-32 md:h-44 md:w-72" style={bg("/images/hero.png")} />
            <div className="p-4 md:p-6 flex flex-col justify-center"><div className="font-extrabold text-[15px] md:text-lg text-ink">2026 스드메 예약, 언제부터 시작할까?</div><div className="text-[12px] md:text-sm text-muted mt-1">예식 D-day 역산 체크리스트</div></div>
          </div>
        </section>
      </main>

      <footer className="hidden md:block bg-brand-50 border-t border-line">
        <div className="max-w-6xl mx-auto px-8 py-6 flex justify-between text-xs text-muted"><div><b className="text-brand-700">스드맵</b> · Studio·Dress·Make-up MAP</div><div>회사소개 · 이용약관 · 개인정보처리방침 · 고객센터</div></div>
      </footer>
      <TabBar active="home" />
    </div>
  );
}
