import Link from 'next/link';

function LegalPageLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#021127]">
      <header className="sticky top-0 z-50 w-full border-b border-[#c59f59]/10 bg-[#021127]/80 backdrop-blur-md px-6 md:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#c59f59]">
            <span className="material-symbols-outlined text-3xl">waves</span>
            <h1 className="text-xl font-extrabold tracking-tighter uppercase">Jinsung Nature Food</h1>
          </Link>
          <Link href="/" className="text-sm font-medium text-slate-100 hover:text-[#c59f59] transition-colors">홈으로</Link>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-6 md:px-20 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
        <div className="w-16 h-[2px] bg-[#c59f59] mb-12"></div>
        <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <LegalPageLayout title="이용약관">
      <section>
        <h3 className="text-xl font-bold text-white mb-4">제1조 (목적)</h3>
        <p>
          본 약관은 진성네이처푸드(이하 &quot;회사&quot;)가 운영하는 온라인 쇼핑몰(이하 &quot;몰&quot;)에서 제공하는 
          인터넷 관련 서비스를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </section>
      <section>
        <h3 className="text-xl font-bold text-white mb-4">제2조 (정의)</h3>
        <p>
          ① &quot;몰&quot;이란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 
          재화 또는 용역을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.
        </p>
        <p>
          ② &quot;이용자&quot;란 &quot;몰&quot;에 접속하여 이 약관에 따라 &quot;몰&quot;이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.
        </p>
      </section>
      <section>
        <h3 className="text-xl font-bold text-white mb-4">제3조 (약관의 게시와 개정)</h3>
        <p>
          ① 회사는 이 약관의 내용과 상호 및 대표자 성명, 영업소 소재지 주소, 전화번호, 사업자등록번호, 
          통신판매업 신고번호 등을 이용자가 쉽게 알 수 있도록 몰의 초기 서비스 화면에 게시합니다.
        </p>
      </section>
      <section>
        <h3 className="text-xl font-bold text-white mb-4">제4조 (서비스의 제공 및 변경)</h3>
        <p>
          ① 회사는 다음과 같은 업무를 수행합니다: 재화 또는 용역에 대한 정보 제공 및 구매계약의 체결, 
          구매계약이 체결된 재화 또는 용역의 배송, 기타 회사가 정하는 업무.
        </p>
      </section>
      <p className="text-sm text-slate-500 mt-12 pt-8 border-t border-[#c59f59]/10">
        시행일: 2026년 1월 1일
      </p>
    </LegalPageLayout>
  );
}
