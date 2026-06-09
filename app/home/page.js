"use client";

import { useState } from "react";
import { categories, topVendors, regions, reviews } from "@/lib/data";

const bg = (src) => ({ backgroundImage: `url('${src}')`, backgroundSize: "cover", backgroundPosition: "center" });

function Card({ v }) {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-line">
      <div className="h-40 relative" style={bg(v.img)}>
        {v.rank && (
          <span className="absolute top-2.5 left-2.5 bg-brand-900/85 text-white text-xs font-extrabold px-2.5 py-1 rounded-lg">
            {v.rank}위
          </span>
        )}
        <span className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-brand-500">♡</span>
        {v.now && (
          <span className="absolute left-2.5 bottom-2.5 text-[10px] font-extrabold text-white bg-ok px-2 py-0.5 rounded-md">즉시예약</span>
        )}
      </div>
      <div className="p-3.5">
        <div className="font-extrabold text-[15px] text-ink">{v.name}</div>
        <div className="text-xs text-muted mt-1">{v.area}</div>
        <div className="text-xs text-warn font-extrabold mt-2">
          ★ {v.rating} <span className="text-muted font-normal">({v.reviews})</span>
        </div>
        <div className="text-[15px] font-extrabold text-brand-700 mt-1">{v.price}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [seg, setSeg] = useState("실내");
  const segs = ["실내", "야외", "부케"];

  return (
    <div className="min-h-screen bg-surface pb-20 md:pb-0">
      {/* ===== Top nav ===== */}
      <header className="sticky top-0 z-30 bg-white border-b border-line">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo_icon.png" alt="스드맵" className="h-9 w-auto" />
            <span className="hidden sm:inline text-brand-700 font-extrabold text-xl">스드맵</span>
          </div>
          <div className="hidden md:block text-sm font-bold text-ink shrink-0">📍 서울 강남구 ▾</div>
          <div className="flex-1 flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-3.5 py-2.5">
            <span className="text-brand-500">🔍</span>
            <span className="text-[13px] text-muted truncate">스튜디오, 드레스, 메이크업, 웨딩홀 검색</span>
          </div>
          <nav className="hidden lg:flex gap-4 text-[13.5px] font-bold text-body shrink-0">
            <span>스튜디오</span><span>드레스</span><span>메이크업</span><span>웨딩홀</span><span>매거진</span>
          </nav>
          <button className="hidden md:block bg-brand-grad text-white font-extrabold text-[13px] px-4 py-2 rounded-lg shadow-soft shrink-0">로그인</button>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative h-[260px] md:h-[340px] flex items-center" style={bg("/images/hero.png")}>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/60 via-brand-900/25 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto w-full px-6 md:px-10 text-white">
          <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
            결혼 준비의 시작과 끝,
            <br />한 곳에서.
          </h2>
          <p className="mt-3 text-sm md:text-base text-white/95">정찰제 가격을 한눈에 비교하고, 마음에 드는 곳을 바로 예약하세요.</p>
          <div className="mt-5 bg-white rounded-xl p-1.5 pl-4 flex items-center gap-3 max-w-md shadow-xl">
            <input className="flex-1 outline-none text-sm text-ink bg-transparent" placeholder="어떤 스드메를 찾고 계세요?" />
            <button className="bg-brand-grad text-white font-extrabold text-sm px-5 py-2.5 rounded-lg">검색</button>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 md:px-8">
        {/* ===== Categories ===== */}
        <section className="pt-7">
          <h3 className="text-lg md:text-xl font-extrabold mb-4">카테고리</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {categories.map((c) => (
              <div key={c.key} className="relative h-24 md:h-28 rounded-2xl overflow-hidden flex items-end p-4 text-white" style={bg(c.img)}>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/65 to-transparent" />
                <span className="relative z-10 text-base md:text-lg font-extrabold">{c.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ===== TOP vendors ===== */}
        <section className="pt-9">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-lg md:text-xl font-extrabold">실내·야외 스드메 TOP</h3>
            <span className="text-xs md:text-sm text-muted font-bold">전체보기 ›</span>
          </div>
          <div className="flex gap-2 mb-4">
            {segs.map((s) => (
              <button
                key={s}
                onClick={() => setSeg(s)}
                className={`text-[13px] font-bold px-4 py-2 rounded-full ${seg === s ? "bg-brand-grad text-white" : "bg-brand-50 text-brand-700"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topVendors.map((v) => (
              <Card key={v.id} v={v} />
            ))}
          </div>
        </section>

        {/* ===== Region ===== */}
        <section className="pt-9">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-lg md:text-xl font-extrabold">어디로 가시나요?</h3>
            <span className="text-xs md:text-sm text-muted font-bold">지역별 스드메</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {regions.map((r, i) => (
              <span key={r} className={`text-[13px] font-bold px-3.5 py-2 rounded-xl border ${i === 0 ? "bg-brand-600 text-white border-brand-600" : "bg-white text-body border-line"}`}>
                {r}
              </span>
            ))}
          </div>
        </section>

        {/* ===== Promo ===== */}
        <section className="pt-9 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6 text-white bg-brand-grad min-h-[112px] flex flex-col justify-center">
            <small className="text-xs opacity-90 font-bold">6월 한정</small>
            <b className="text-lg md:text-xl mt-1.5">스드메 패키지 최대 30%</b>
          </div>
          <div className="rounded-2xl p-6 text-white bg-brand-glow min-h-[112px] flex flex-col justify-center">
            <small className="text-xs opacity-90 font-bold">신규가입 혜택</small>
            <b className="text-lg md:text-xl mt-1.5">첫 예약 5만원 즉시 할인</b>
          </div>
        </section>

        {/* ===== Reviews ===== */}
        <section className="pt-9">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-lg md:text-xl font-extrabold">경험자 리얼리뷰 픽</h3>
            <span className="text-xs md:text-sm text-muted font-bold">더보기 ›</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl overflow-hidden bg-white border border-line">
                <div className="h-32" style={bg(r.img)} />
                <div className="p-3.5">
                  <div className="text-warn font-extrabold text-sm">★★★★★</div>
                  <div className="font-extrabold text-sm mt-1.5 text-ink">&ldquo;{r.text}&rdquo;</div>
                  <div className="text-xs text-muted mt-1">{r.who}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Magazine ===== */}
        <section className="pt-9 pb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="text-lg md:text-xl font-extrabold">결혼 매거진</h3>
            <span className="text-xs md:text-sm text-muted font-bold">더보기 ›</span>
          </div>
          <div className="rounded-2xl overflow-hidden border border-line bg-white md:flex">
            <div className="h-36 md:h-44 md:w-72" style={bg("/images/hero.png")} />
            <div className="p-4 md:p-6 flex flex-col justify-center">
              <div className="font-extrabold text-base md:text-lg text-ink">2026 스드메 예약, 언제부터 시작할까?</div>
              <div className="text-xs md:text-sm text-muted mt-1.5">예식 D-day 역산 체크리스트</div>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Desktop footer ===== */}
      <footer className="hidden md:block bg-brand-50 border-t border-line">
        <div className="max-w-6xl mx-auto px-8 py-6 flex justify-between text-xs text-muted">
          <div><b className="text-brand-700">스드맵</b> · Studio·Dress·Make-up MAP</div>
          <div>회사소개 · 이용약관 · 개인정보처리방침 · 고객센터</div>
        </div>
      </footer>

      {/* ===== Mobile tab bar ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-line flex z-30">
        {[
          ["홈", true],
          ["검색", false],
          ["찜", false],
          ["예약", false],
          ["마이", false],
        ].map(([label, on]) => (
          <div key={label} className={`flex-1 flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${on ? "text-brand-600" : "text-muted"}`}>
            <span className="text-lg">{on ? "●" : "○"}</span>
            {label}
          </div>
        ))}
      </nav>
    </div>
  );
}
