import Link from "next/link";
export const metadata = { title: "이용약관 — 스드맵" };

const H = ({ children }) => <h2 className="text-[16px] font-extrabold text-ink mt-7 mb-2">{children}</h2>;
const P = ({ children }) => <p className="text-[13.5px] text-body leading-relaxed mb-2">{children}</p>;

export default function Terms() {
  return (
    <main className="min-h-screen bg-aurora pb-16">
      <header className="bg-white/75 backdrop-blur-xl border-b border-white/50"><div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3"><Link href="/login" className="text-xl text-muted">‹</Link><b className="text-lg">이용약관</b></div></header>
      <div className="max-w-2xl mx-auto px-5 pt-5">
        <div className="rounded-[20px] bg-white shadow-[0_4px_16px_rgba(37,34,54,0.06)] p-5 md:p-7">
          <P>본 약관은 스드맵(이하 &ldquo;회사&rdquo;)이 제공하는 결혼 준비 비교·예약 플랫폼 서비스(이하 &ldquo;서비스&rdquo;)의 이용 조건을 정합니다.</P>

          <H>제1조 (정의)</H>
          <P>① &ldquo;회원&rdquo;은 본 약관에 동의하고 가입한 자를 말하며, 예비부부 등 &ldquo;고객회원&rdquo;과 서비스에 입점한 &ldquo;입점회원(업체)&rdquo;으로 구분됩니다.</P>
          <P>② &ldquo;콘텐츠&rdquo;는 서비스 내 게시된 업체 정보, 가격 정보, 후기, AI 분석 결과 등을 말합니다.</P>

          <H>제2조 (서비스의 성격과 책임 범위)</H>
          <P>① 회사는 고객회원과 입점회원 간의 비교·상담·예약을 중개하는 플랫폼이며, 통신판매중개자로서 거래 당사자가 아닙니다. 계약의 이행, 환불, 하자에 대한 책임은 거래 당사자인 입점회원에게 있습니다.</P>
          <P>② 서비스가 제공하는 예상 최종가, 추가금 위험도, AI 견적 분석 등은 의사결정을 돕기 위한 <b>참고 정보</b>이며, 회사는 그 정확성·완전성을 보증하지 않습니다. 실제 계약 조건은 반드시 업체 상담을 통해 확인해야 합니다.</P>

          <H>제3조 (계정)</H>
          <P>① 회원은 본인 정보로 가입해야 하며 계정을 타인에게 양도·대여할 수 없습니다.</P>
          <P>② 회원은 마이페이지에서 언제든지 탈퇴할 수 있으며, 탈퇴 시 관련 법령에 따라 보관이 필요한 정보를 제외한 개인정보가 지체 없이 파기됩니다.</P>

          <H>제4조 (입점회원 특칙)</H>
          <P>① 입점회원은 회사의 승인 및 계정 연결 절차를 거쳐 입점하며, 매장 정보·사진을 사실대로 등록·관리할 의무가 있습니다.</P>
          <P>② 가격·구성 정보의 변경은 회사의 검수를 거쳐 반영됩니다. 허위 가격 표기, 후기 조작 등이 확인되는 경우 회사는 노출 중단·계약 해지 등의 조치를 할 수 있습니다.</P>

          <H>제5조 (후기)</H>
          <P>후기는 해당 업체와 상담을 확정·완료한 고객회원만 작성할 수 있습니다. 허위 사실, 비방, 개인정보 노출이 포함된 후기는 사전 통지 후 삭제될 수 있습니다.</P>

          <H>제6조 (금지행위)</H>
          <P>타인의 정보 도용, 서비스의 부정 이용, 자동화 수단을 통한 정보 수집, 업체 또는 회원에 대한 허위 정보 유포를 금지합니다.</P>

          <H>제7조 (서비스 변경·중단)</H>
          <P>회사는 운영상·기술상 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며, 중요한 변경은 사전에 공지합니다.</P>

          <H>제8조 (분쟁 해결)</H>
          <P>본 약관은 대한민국 법률에 따라 해석되며, 분쟁은 민사소송법상 관할 법원에 제기합니다.</P>

          <div className="mt-7 pt-4 border-t border-line text-[12px] text-muted leading-relaxed">
            시행일: 2026년 6월 10일 (베타)<br />
            상호·대표자·사업자등록번호·통신판매업 신고번호: <b>사업자 등록 완료 후 표기 예정</b>
          </div>
        </div>
      </div>
    </main>
  );
}
