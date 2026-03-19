import Link from 'next/link';

export default function ShippingPolicyPage() {
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
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">배송 및 환불 정책</h2>
        <div className="w-16 h-[2px] bg-[#c59f59] mb-12"></div>
        <div className="text-slate-300 leading-relaxed space-y-10">
          {/* Shipping */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c59f59]">local_shipping</span>
              배송 안내
            </h3>
            <div className="bg-[#031a3a] border border-[#c59f59]/10 rounded-xl p-6 space-y-4">
              <div className="flex justify-between border-b border-[#c59f59]/5 pb-3">
                <span className="text-slate-400">배송 방법</span>
                <span className="text-white font-bold">가락시장 산지직송 택배</span>
              </div>
              <div className="flex justify-between border-b border-[#c59f59]/5 pb-3">
                <span className="text-slate-400">배송비</span>
                <span className="text-[#c59f59] font-bold">무료배송</span>
              </div>
              <div className="flex justify-between border-b border-[#c59f59]/5 pb-3">
                <span className="text-slate-400">출고 기간</span>
                <span className="text-white">결제 확인 후 1-2 영업일 이내</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">배송 기간</span>
                <span className="text-white">출고 후 1-2일 (도서산간 지역 3-5일)</span>
              </div>
            </div>
          </section>

          {/* Exchange & Return */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c59f59]">swap_horiz</span>
              교환/반품 안내
            </h3>
            <div className="space-y-4">
              <div className="bg-[#031a3a] border border-[#c59f59]/10 rounded-xl p-6">
                <h4 className="text-white font-bold mb-3">교환/반품 가능 사유</h4>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>상품 수령 후 7일 이내 (단, 식품 특성상 미개봉 상태에 한함)</li>
                  <li>배송 과정에서 파손 또는 변질된 경우</li>
                  <li>주문한 상품과 다른 상품이 배송된 경우</li>
                </ul>
              </div>
              <div className="bg-[#031a3a] border border-red-500/20 rounded-xl p-6">
                <h4 className="text-red-400 font-bold mb-3">교환/반품 불가 사유</h4>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  <li>개봉 후 사용한 경우 (식품 위생 관련)</li>
                  <li>소비자의 부주의로 인한 상품 훼손</li>
                  <li>수령 후 7일이 경과한 경우</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Refund */}
          <section>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c59f59]">payments</span>
              환불 안내
            </h3>
            <p className="mb-4">
              교환/반품 접수 후 상품 확인이 완료되면 3영업일 이내에 환불 처리됩니다.
              결제 수단에 따라 환불 소요시간이 다를 수 있습니다.
            </p>
            <div className="bg-[#031a3a] border border-[#c59f59]/10 rounded-xl p-6 space-y-3">
              <div className="flex justify-between border-b border-[#c59f59]/5 pb-3">
                <span className="text-slate-400">카드 결제</span>
                <span className="text-white">취소 후 3-5 영업일</span>
              </div>
              <div className="flex justify-between border-b border-[#c59f59]/5 pb-3">
                <span className="text-slate-400">계좌이체</span>
                <span className="text-white">환불 접수 후 1-3 영업일</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">문의처</span>
                <span className="text-[#c59f59] font-bold">0507-1338-7151</span>
              </div>
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
