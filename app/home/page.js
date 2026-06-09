"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { categories, topVendors, regions, reviews } from "@/lib/data";
import { supabase } from "@/lib/supabaseClient";

const bg = (src) => ({ backgroundImage: `url('${src}')`, backgroundSize: "cover", backgroundPosition: "center" });

function VendorCard({ v }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-line">
      <div className="h-32 md:h-40 relative" style={bg(v.img)}>
        {v.rank && (
          <span className="absolute top-2 left-2 bg-brand-900/85 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md">{v.rank}위</span>
        )}
        <span className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-brand-500 text-sm">♡</span>
        {v.now && (
          <span className="absolute left-2 bottom-2 text-[10px] font-extrabold text-white bg-ok px-2 py-0.5 rounded-md">즉시예약</span>
        )}
      </div>
      <div className="p-3">
        <div className="font-extrabold text-sm md:text-[15px] text-ink truncate">{v.name}</div>
        <div className="text-[12px] text-muted mt-0.5 truncate">{v.area}</div>
        <div className="text-[12px] text-warn font-extrabold mt-1.5">★ {v.rating} <span className="text-muted font-normal">({v.reviews})</span></div>
        <div className="text-sm md:text-[15px] font-extrabold text-brand-700 mt-0.5">{v.price}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [seg, setSeg] = useState("실내");
  const segs = ["실내", "야외", "부케"];

  const router = useRouter();
  const [user, setUser] = useState(null);
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
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => setUser(sess?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, [router]);
  const m = user?.user_metadata || {};
  const displayName = user ? (m.name || m.full_name || m.nickname || m.preferred_username || (user.email ? user.email.split("@")[0] : "회원")) : null;
  async function logout() { if (supabase) { await supabase.auth.signOut(); setUser(null); } }

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-30 bg-white border-b border-line">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 py-3">
            <div className="flex items-center gap-1.5 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo_icon.png" alt="스드맵" className="h-8 w-auto" />
              <span className="font-extrabold text-lg text-brand-700">스드맵</span>
            </div>
            {/* desktop search */}
            <div className="hidden md:flex flex-1 items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-3.5 py-2.5">
              <span className="text-brand-500">🔍</span>
              <span className="text-[13px] text-muted">스튜디오, 드레스, 메이크업, 웨딩홀 검색</span>
            </div>
            <nav className="hidden lg:flex gap-4 text-[13.5px] font-bold text-body shrink-0">
              <span>스튜디오</span><span>드레스</span><span>메이크업</span><span>웨딩홀</span><span>매거진</span>
            </nav>
            <div className="flex-1 md:hidden" />
            {user ? (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[13px] font-bold text-ink hidden sm:inline">{displayName}님</span>
                <button onClick={logout} className="text-[13px] font-bold text-muted border border-line rounded-lg px-3 py-2">로그아웃</button>
              </div>
            ) : (
              <a href="/login" className="bg-brand-grad text-white font-extrabold text-[13px] px-4 py-2 rounded-lg shrink-0">로그인</a>
            )}
          </div>
          {/* mobile search + location */}
          <div className="md:hidden pb-3 space-y-2">
            <div className="text-[13px] font-bold text-ink">📍 서울 강남구 <span className="text-muted">▾</span></div>
            <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-3.5 py-3">
              <span className="text-brand-500">🔍</span>
              <span className="text-[13px] text-muted">스튜디오, 드레스, 홀 검색</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative h-[200px] md:h-[340px] flex items-end md:items-center" style={bg("/images/hero.png")}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10 md:bg-gradient-to-r md:from-brand-900/70 md:via-brand-900/30 md:to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto w-full px-5 md:px-10 pb-5 md:pb-0 text-white">
          <h2 className="text-[22px] md:text-4xl font-extrabold leading-snug drop-shadow">결혼 준비의 시작과 끝,<br />한 곳에서.</h2>
          <p className="mt-2 text-[13px] md:text-base text-white/95 drop-shadow">정찰제 가격을 한눈에 비교하고, 바로 예약하세요.</p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Categories */}
        <section className="pt-6">
          <h3 className="text-base md:text-xl font-extrabold mb-3">카테고리</h3>
          <div className="grid grid-cols-4 md:grid-cols-4 gap-2.5 md:gap-4">
            {categories.map((c) => (
              <div key={c.key} className="flex flex-col items-center gap-2">
                <div className="w-full aspect-square rounded-2xl overflow-hidden" style={bg(c.img)} />
                <span className="text-[12px] md:text-sm font-bold text-ink">{c.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* TOP */}
        <section className="pt-8">
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-base md:text-xl font-extrabold">실내·야외 스드메 TOP</h3>
            <span className="text-[12px] text-muted font-bold">전체보기 ›</span>
          </div>
          <div className="flex gap-2 mb-3">
            {segs.map((s) => (
              <button key={s} onClick={() => setSeg(s)} className={`text-[13px] font-bold px-4 py-1.5 rounded-full ${seg === s ? "bg-brand-grad text-white" : "bg-brand-50 text-brand-700"}`}>{s}</button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {topVendors.map((v) => <VendorCard key={v.id} v={v} />)}
          </div>
        </section>

        {/* Region */}
        <section className="pt-8">
          <h3 className="text-base md:text-xl font-extrabold mb-3">어디로 가시나요?</h3>
          <div className="flex flex-wrap gap-2">
            {regions.map((r, i) => (
              <span key={r} className={`text-[13px] font-bold px-3.5 py-2 rounded-xl border ${i === 0 ? "bg-brand-600 text-white border-brand-600" : "bg-white text-body border-line"}`}>{r}</span>
            ))}
          </div>
        </section>

        {/* Promo */}
        <section className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-2xl p-5 md:p-6 text-white bg-brand-grad">
            <small className="text-xs opacity-90 font-bold">6월 한정</small>
            <b className="text-lg block mt-1">스드메 패키지 최대 30%</b>
          </div>
          <div className="rounded-2xl p-5 md:p-6 text-white bg-brand-glow">
            <small className="text-xs opacity-90 font-bold">신규가입 혜택</small>
            <b className="text-lg block mt-1">첫 예약 5만원 즉시 할인</b>
          </div>
        </section>

        {/* Reviews */}
        <section className="pt-8">
          <h3 className="text-base md:text-xl font-extrabold mb-3">경험자 리얼리뷰 픽</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl overflow-hidden bg-white border border-line flex md:block">
                <div className="w-24 md:w-full h-auto md:h-32 shrink-0" style={bg(r.img)} />
                <div className="p-3">
                  <div className="text-warn font-extrabold text-[13px]">★★★★★</div>
                  <div className="font-extrabold text-sm mt-1 text-ink">&ldquo;{r.text}&rdquo;</div>
                  <div className="text-[12px] text-muted mt-1">{r.who}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Magazine */}
        <section className="pt-8 pb-10">
          <h3 className="text-base md:text-xl font-extrabold mb-3">결혼 매거진</h3>
          <div className="rounded-2xl overflow-hidden border border-line bg-white md:flex">
            <div className="h-32 md:h-44 md:w-72" style={bg("/images/hero.png")} />
            <div className="p-4 md:p-6 flex flex-col justify-center">
              <div className="font-extrabold text-[15px] md:text-lg text-ink">2026 스드메 예약, 언제부터 시작할까?</div>
              <div className="text-[12px] md:text-sm text-muted mt-1">예식 D-day 역산 체크리스트</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="hidden md:block bg-brand-50 border-t border-line">
        <div className="max-w-6xl mx-auto px-8 py-6 flex justify-between text-xs text-muted">
          <div><b className="text-brand-700">스드맵</b> · Studio·Dress·Make-up MAP</div>
          <div>회사소개 · 이용약관 · 개인정보처리방침 · 고객센터</div>
        </div>
      </footer>

      {/* Mobile tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line flex z-30 pb-[env(safe-area-inset-bottom)]">
        {[
          { label: "홈", active: true, icon: <path d="M3 11l9-8 9 8M5 10v10h14V10" /> },
          { label: "검색", active: false, icon: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></> },
          { label: "찜", active: false, icon: <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /> },
          { label: "예약", active: false, icon: <><rect x="3" y="4" width="18" height="17" rx="3" /><path d="M3 9h18M8 2v4M16 2v4M9 14l2 2 4-4" /></> },
          { label: "마이", active: false, icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></> },
        ].map((t) => (
          <a key={t.label} href={t.label === "홈" ? "/home" : undefined}
            className={`flex-1 h-16 flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${t.active ? "text-brand-600" : "text-muted"}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
            {t.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
