import Link from "next/link";
export const metadata = { title: "개인정보처리방침 — 스드맵" };

const H = ({ children }) => <h2 className="text-[16px] font-extrabold text-ink mt-7 mb-2">{children}</h2>;
const P = ({ children }) => <p className="text-[13.5px] text-body leading-relaxed mb-2">{children}</p>;

export default function Privacy() {
  return (
    <main className="min-h-screen bg-aurora pb-16">
      <header className="bg-white/75 backdrop-blur-xl border-b border-white/50"><div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3"><Link href="/login" className="text-xl text-muted">‹</Link><b className="text-lg">개인정보처리방침</b></div></header>
      <div className="max-w-2xl mx-auto px-5 pt-5">
        <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-5 md:p-7">
          <P>스드맵(이하 &ldquo;회사&rdquo;)은 개인정보 보호법 등 관련 법령을 준수하며, 이용자의 개인정보를 아래와 같이 처리합니다.</P>

          <H>1. 수집하는 항목과 목적</H>
          <P>· <b>회원 가입·관리</b>: 이름, 이메일, 휴대폰 번호, 소셜 로그인 식별자, 프로필 이미지(선택)</P>
          <P>· <b>맞춤 서비스</b>: 예식 예정일, 예산, 지역, 주소(선택), 찜·비교·체크리스트 활동 정보</P>
          <P>· <b>AI 견적 분석</b>: 이용자가 업로드한 견적서 이미지(분석 목적으로만 처리)</P>
          <P>· <b>상담·예약 중개</b>: 이름, 연락처 (입점업체에 상담 목적 범위 내 제공)</P>
          <P>· <b>입점 신청</b>: 업체명, 담당자명, 연락처, 이메일</P>

          <H>2. 처리 위탁 및 제3자 제공</H>
          <P>· Supabase(데이터 보관), Vercel(서비스 호스팅), OpenAI(견적서 이미지 AI 분석), SOLAPI(문자 발송) — 서비스 제공에 필요한 범위에서 처리를 위탁합니다.</P>
          <P>· 상담을 신청한 경우 해당 입점업체에 이름·연락처가 제공됩니다. 이 외 제3자 제공은 법령에 의한 경우를 제외하고 이루어지지 않습니다.</P>

          <H>3. 보유 기간</H>
          <P>회원 탈퇴 시 지체 없이 파기합니다. 단, 전자상거래법 등 관련 법령상 보존이 필요한 거래 기록(계약·청약철회 5년, 대금결제 5년, 소비자 불만·분쟁 처리 3년)은 해당 기간 동안 보관됩니다.</P>

          <H>4. 이용자의 권리</H>
          <P>이용자는 마이페이지에서 개인정보를 직접 조회·수정·삭제(회원탈퇴)할 수 있으며, 개인정보 열람·정정·처리정지를 요구할 수 있습니다.</P>

          <H>5. 안전성 확보 조치</H>
          <P>데이터 접근 권한 통제(역할 기반·행 수준 보안), 전송 구간 암호화(HTTPS), 비밀번호 단방향 암호화를 적용합니다.</P>

          <H>6. 개인정보 보호책임자</H>
          <P>사업자 등록 및 정식 오픈 시 보호책임자 성명·연락처를 본 방침에 표기합니다. 문의는 서비스 내 1:1 문의로 접수할 수 있습니다.</P>

          <div className="mt-7 pt-4 border-t border-line text-[12px] text-muted leading-relaxed">
            시행일: 2026년 6월 10일 (베타) · 본 방침은 정식 오픈 전 보완될 수 있으며, 변경 시 공지합니다.
          </div>
        </div>
      </div>
    </main>
  );
}
