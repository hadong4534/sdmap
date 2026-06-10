import Link from "next/link";
export const metadata = {
  title: "계약 전 질문 가이드 — 스드맵",
  description: "스튜디오·드레스·메이크업·웨딩홀 계약 전 꼭 확인할 추가금 항목과 질문 리스트",
};

const GUIDES = [
  {
    k: "studio", t: "스튜디오", c: "#7A5FE0", bg: "#EFE9FF",
    fees: [["원본 파일 비용", "20~30만원 — 가장 자주 빠지는 항목"], ["주말·공휴일 촬영비", "10~20만원"], ["야간/새벽 촬영비", "10만원 내외"], ["야외 촬영 출장비", "지역별 상이"], ["수정본 추가 비용", "장당 과금 여부 확인"]],
    qs: ["원본 파일은 전부 제공되나요? 비용이 따로 있나요?", "수정본은 몇 장까지 기본인가요? 추가 비용은?", "주말 촬영비가 견적에 포함돼 있나요?", "촬영 시간 초과 시 비용 기준은?", "계약 취소·연기 시 위약금 규정은?"],
    tip: "견적서의 '기본 촬영' 구성에 원본·수정본 조건이 명시돼 있는지 꼭 확인하세요. 구두 약속은 계약서에 적어달라고 요청하는 게 안전해요.",
  },
  {
    k: "dress", t: "드레스", c: "#D6679F", bg: "#FDEFF6",
    fees: [["헬퍼비", "10~20만원 — 견적 외 현장 지불이 관행"], ["피팅비(투어 시)", "샵당 5~10만원"], ["드레스 업그레이드", "라인별 30만원~"], ["맞춤 수선비", "범위 확인 필요"], ["촬영·본식 드레스 별도 여부", "패키지 구성 확인"]],
    qs: ["헬퍼비는 누가, 현장에서 얼마를 내나요?", "투어 피팅비는 계약 시 환급되나요?", "기본 라인과 업그레이드 라인 가격표를 볼 수 있나요?", "드레스 변경 가능 기간은 언제까지인가요?", "본식 당일 드레스 오염·파손 책임 규정은?"],
    tip: "'기본 라인' 드레스 실물을 꼭 확인하세요. 피팅 때 업그레이드 라인 위주로 보여주는 경우가 많아 예산이 커지기 쉬워요.",
  },
  {
    k: "makeup", t: "메이크업", c: "#E08A4A", bg: "#FFF2E8",
    fees: [["얼리스타트(새벽 시작)", "8~15만원"], ["원장/지명 디자이너 추가금", "지명비 확인"], ["혼주 메이크업", "인당 10~12만원"], ["신랑 메이크업", "별도 여부 확인"], ["출장비", "지역별 상이"]],
    qs: ["새벽 시작 기준 시간과 추가 비용은?", "담당 디자이너 지명 비용이 있나요?", "리허설과 본식 담당이 같은 분인가요?", "혼주·신랑 포함 총액으로 얼마인가요?", "본식 당일 시간 연장 시 비용은?"],
    tip: "본식 시작 시간 기준으로 메이크업 시작 시간을 역산해 보세요. 오전 예식이면 얼리스타트 비용이 거의 확정적으로 발생해요.",
  },
  {
    k: "hall", t: "웨딩홀", c: "#5E8FBC", bg: "#EAF3FC",
    fees: [["보증인원 초과/미달", "식대 정산 기준 — 최대 분쟁 항목"], ["꽃길·연출 업그레이드", "30~100만원"], ["음주류·음료", "별도 과금 여부"], ["주차 지원 한도", "초과 시 하객 부담"], ["우천 시 전환비(야외)", "30~50만원"]],
    qs: ["보증인원은 몇 명이고, 미달 시 어떻게 정산되나요?", "기본 연출과 업그레이드의 차이를 실제 사진으로 볼 수 있나요?", "식대에 음료·주류가 포함되나요?", "외부 스냅·DVD 업체 반입이 가능한가요? 비용은?", "예식 시간이 겹치는 팀과 동선이 분리되나요?"],
    tip: "총액이 아니라 '1인 식대 × 보증인원 + 대관·연출'로 분해해서 비교하세요. 보증인원 협상이 전체 비용에 가장 큰 영향을 줘요.",
  },
];

export default function Guide() {
  return (
    <main className="min-h-screen bg-aurora pb-16">
      <header className="bg-white border-b border-line"><div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3"><Link href="/home" className="text-xl text-muted">‹</Link><b className="text-lg">계약 전 질문 가이드</b></div></header>
      <div className="max-w-2xl mx-auto px-5 pt-5 space-y-4">
        <div className="pt-1 pb-2">
          <span className="inline-block text-[11px] font-extrabold text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full tracking-wide">스드맵 가이드</span>
          <h1 className="text-[26px] font-extrabold leading-[1.3] tracking-tight text-ink mt-3">계약서에 사인하기 전,<br /><span className="text-grad">이것만은 꼭</span> 물어보세요</h1>
          <p className="text-[14px] text-muted leading-relaxed mt-2.5">추가금 분쟁의 대부분은 &ldquo;계약 전에 묻지 않아서&rdquo; 생겨요.</p>
        </div>
        {GUIDES.map((g) => (
          <section key={g.k} className="bg-white rounded-[24px] overflow-hidden shadow-[0_10px_30px_rgba(139,111,232,0.12)]">
            <div className="relative px-5 py-5 overflow-hidden" style={{ background: `linear-gradient(120deg, ${g.bg}, #fff)` }}>
              <span className="absolute -right-1 -top-5 text-[64px] font-black italic opacity-[0.08] select-none" style={{ color: g.c }}>{g.k.toUpperCase()}</span>
              <b className="relative text-[20px] tracking-tight" style={{ color: g.c }}>{g.t}에서 새는 돈</b>
              <Link href={`/search?cat=${g.k}`} className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-extrabold px-3.5 py-2 rounded-xl bg-white shadow-sm" style={{ color: g.c }}>업체 비교 ›</Link>
            </div>
            <div className="p-5">
              <div className="space-y-2.5 mb-6">
                {g.fees.map(([n, d], i) => (
                  <div key={n} className="grid grid-cols-[84px_1fr_auto] items-center gap-2.5">
                    <span className="text-[12.5px] font-bold text-body truncate">{n}</span>
                    <span className="h-[9px] rounded-full bg-surface overflow-hidden"><i className="block h-full rounded-full" style={{ width: `${88 - i * 14}%`, background: `linear-gradient(90deg, ${g.c}55, ${g.c})` }} /></span>
                    <span className="text-[11.5px] font-extrabold text-right" style={{ color: g.c }}>{d.split(" — ")[0]}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2.5 mb-5">
                {g.qs.map((q, i) => (
                  <div key={i} className="flex gap-3.5 items-start bg-surface/60 rounded-2xl px-4 py-3.5">
                    <span className="text-[21px] font-black italic leading-none mt-0.5 font-serif" style={{ color: g.c }}>{`Q${i + 1}`}</span>
                    <span className="text-[13.5px] font-bold text-ink leading-snug pt-1">{q}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-[18px] p-[1.5px]" style={{ background: `linear-gradient(120deg, ${g.c}, ${g.c}44)` }}>
                <div className="rounded-[17px] bg-white px-4 py-3.5 text-[12.5px] leading-relaxed text-body">
                  <b style={{ color: g.c }}>스드맵 TIP</b> — {g.tip}
                </div>
              </div>
            </div>
          </section>
        ))}
        <div className="relative overflow-hidden rounded-[24px] p-6 text-center text-white shadow-[0_16px_40px_rgba(122,95,224,0.35)]" style={{ background: "linear-gradient(120deg,#6E54CF,#8265DE 55%,#9A78EC)" }}>
          <p className="text-[16px] font-extrabold leading-snug">받은 견적서가 있다면,<br />AI가 누락 항목을 찾아드려요</p>
          <Link href="/quote" className="inline-block mt-4 h-12 leading-[48px] px-7 rounded-2xl bg-white text-[#6E54CF] text-sm font-extrabold shadow-lg">견적서 AI 분석하기</Link>
        </div>
      </div>
    </main>
  );
}
