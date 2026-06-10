import Link from "next/link";

export const metadata = { title: "스드맵 AI는 이렇게 계산해요 — 스드맵" };

const Section = ({ n, title, children }) => (
  <section className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-5 md:p-6">
    <div className="flex items-center gap-2.5">
      <span className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 font-extrabold text-sm flex items-center justify-center shrink-0">{n}</span>
      <h2 className="text-[17px] font-extrabold text-ink">{title}</h2>
    </div>
    <div className="mt-3 text-[14px] text-body leading-relaxed space-y-2">{children}</div>
  </section>
);

export default function Methodology() {
  return (
    <main className="min-h-screen bg-aurora pb-16">
      <header className="bg-white/75 backdrop-blur-xl border-b border-white/50">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          <Link href="/home" className="text-xl text-muted">‹</Link>
          <b className="text-lg">스드맵 AI는 이렇게 계산해요</b>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-5 pt-6 space-y-3.5">
        <p className="text-[14px] text-body leading-relaxed">
          스드맵은 &ldquo;예쁜 업체를 보여주는 앱&rdquo;이 아니라 <b className="text-ink">손해 보지 않게 비교하도록 돕는 앱</b>입니다.
          그래서 화면의 모든 숫자가 어떻게 만들어지는지 투명하게 공개합니다.
        </p>

        <Section n="1" title="예상 최종가">
          <p><b className="text-ink">예상 최종가 = 기준가 + 예상 추가금</b></p>
          <p>기준가는 업체가 공개한 가격이고, 예상 추가금은 견적서에 자주 빠지는 항목(원본비·헬퍼비·주말 촬영비·야간비·출장비 등)의 일반적인 금액 범위를 합산한 값이에요. 업체 상세의 &ldquo;어떻게 계산했나요?&rdquo;에서 항목별 내역을 확인할 수 있어요.</p>
        </Section>

        <Section n="2" title="추가금 위험도 (0~100)">
          <p>계약 전에 확인할 항목이 얼마나 많은지를 나타내요. <b className="text-ink">미포함 항목의 개수</b>와 <b className="text-ink">기준가 대비 예상 추가금 비율</b>이 높을수록 점수가 올라갑니다.</p>
          <p>위험도가 높다고 나쁜 업체라는 뜻이 아니에요. &ldquo;상담에서 꼭 물어볼 것이 많다&rdquo;는 신호이며, 그래서 업체마다 <b className="text-ink">계약 전 질문 리스트</b>를 함께 제공해요.</p>
        </Section>

        <Section n="3" title="가격 정보의 신뢰">
          <p>업체가 가격·구성 정보를 직접 바꿀 수 없어요. 변경 요청은 <b className="text-ink">스드맵 입점관리자의 검수를 거친 후</b>에만 고객 화면에 반영됩니다. 이 규칙은 화면이 아니라 데이터베이스 차원에서 강제돼요.</p>
        </Section>

        <Section n="4" title="후기 신뢰도">
          <p>스드맵 후기는 <b className="text-ink">해당 업체와 상담을 확정·완료한 고객만</b> 작성할 수 있어요. 방문하지 않은 사람의 후기, 업체의 자작 후기가 구조적으로 불가능합니다.</p>
        </Section>

        <Section n="5" title="AI 견적서 분석">
          <p>업로드한 견적서를 AI가 읽고 총액·누락 의심 항목·계약 전 질문을 정리해요. 분석 결과는 참고용이며, 스드맵 등록 업체 평균과 비교해 이 견적이 합리적인지 가늠할 수 있게 도와드려요.</p>
        </Section>

        <div className="rounded-2xl bg-brand-50 border border-brand-100 p-5 text-[13px] text-body leading-relaxed">
          <b className="text-brand-700">꼭 알아두세요.</b> 스드맵의 모든 예상치는 비교·판단을 돕기 위한 참고 정보예요.
          실제 금액과 조건은 업체 상담에서 최종 확인해 주세요. 스드맵은 특정 업체를 무조건 추천하거나 보증하지 않습니다.
        </div>

        <Link href="/search" className="block text-center h-12 leading-[48px] rounded-xl bg-brand-500 text-white font-bold text-sm">업체 비교하러 가기</Link>
      </div>
    </main>
  );
}
