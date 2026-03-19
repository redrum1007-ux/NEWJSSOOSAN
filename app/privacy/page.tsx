import Link from 'next/link';

export default function PrivacyPage() {
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
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">개인정보처리방침</h2>
        <div className="w-16 h-[2px] bg-[#c59f59] mb-12"></div>
        <div className="text-slate-300 leading-relaxed space-y-8">
          <section>
            <h3 className="text-xl font-bold text-white mb-4">1. 개인정보의 처리 목적</h3>
            <p>
              진성네이처푸드(이하 &quot;회사&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다. 
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 
              별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-slate-400">
              <li>재화 또는 서비스 제공: 물품배송, 서비스 제공, 콘텐츠 제공</li>
              <li>회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인식별</li>
              <li>마케팅 및 광고에의 활용: 신규 서비스 개발 및 맞춤 서비스 제공 (동의 시)</li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-bold text-white mb-4">2. 개인정보의 처리 및 보유기간</h3>
            <p>
              회사는 법령에 따른 개인정보 보유/이용기간 또는 정보주체로부터 개인정보를 수집 시에 
              동의받은 개인정보 보유/이용기간 내에서 개인정보를 처리/보유합니다.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-white mb-4">3. 정보주체의 권리·의무 및 행사방법</h3>
            <p>
              이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다: 
              개인정보 열람 요구, 오류 등이 있을 경우 정정 요구, 삭제요구, 처리정지 요구.
            </p>
          </section>
          <section>
            <h3 className="text-xl font-bold text-white mb-4">4. 개인정보 보호책임자</h3>
            <div className="bg-[#031a3a] border border-[#c59f59]/10 rounded-xl p-6">
              <p className="text-white font-bold mb-2">개인정보 보호책임자</p>
              <p>성명: 김진성 (대표)</p>
              <p>연락처: 0507-1338-7151</p>
            </div>
          </section>
          <p className="text-sm text-slate-500 mt-12 pt-8 border-t border-[#c59f59]/10">
            시행일: 2026년 1월 1일
          </p>
        </div>
      </div>
    </div>
  );
}
