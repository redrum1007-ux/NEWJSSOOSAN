import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#021127]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#c59f59]/10 bg-[#021127]/80 backdrop-blur-md px-6 md:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#c59f59]">
            <span className="material-symbols-outlined text-3xl">waves</span>
            <h1 className="text-xl font-extrabold tracking-tighter uppercase">Jinsung Nature Food</h1>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium text-slate-100 hover:text-[#c59f59] transition-colors">Shop</Link>
            <Link href="/cart" className="relative p-2 hover:bg-[#c59f59]/10 rounded-full transition-colors text-slate-100">
              <span className="material-symbols-outlined">shopping_bag</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[#031a3a]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="w-20 h-20 border border-[#c59f59]/50 flex items-center justify-center rounded-full mb-8 backdrop-blur-md mx-auto">
            <span className="material-symbols-outlined text-[#c59f59] text-4xl">workspace_premium</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Story</h2>
          <div className="w-16 h-[2px] bg-[#c59f59] mx-auto mb-8"></div>
          <p className="text-lg text-slate-300 font-light leading-relaxed">
            50년의 헤리티지, 자연 그대로의 진심
          </p>
        </div>
      </section>

      {/* 메인 페이지 이미지 */}
      <section className="w-full bg-[#021127] px-4 md:px-10 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden border border-[#c59f59]/20 shadow-2xl shadow-black/60">
            {/* 상단 골드 라인 */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c59f59] to-transparent z-10" />
            <img
              src="/jinsung-main.png"
              alt="진성수산 메인 페이지 소개"
              className="w-full h-auto block"
            />
            {/* 하단 골드 라인 */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c59f59] to-transparent z-10" />
          </div>
          <p className="text-center text-xs text-slate-600 mt-4 tracking-widest uppercase">
            Jinsung Nature Food · Est. 1974
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 md:px-20 py-24 space-y-20">

        {/* History */}
        <div>
          <h3 className="text-[#c59f59] font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#c59f59]"></span>
            HERITAGE
          </h3>
          <h4 className="text-2xl md:text-3xl font-bold text-white mb-6">반세기의 역사</h4>
          <p className="text-slate-300 leading-relaxed mb-6">
            진성네이처푸드는 1974년, 청정 바다의 고장에서 작은 어물상으로 시작했습니다.
            50년이 넘는 세월 동안 변하지 않는 한 가지 원칙 — &quot;자연이 준 그대로를 전한다&quot;라는 
            철학으로 대한민국 최고를 품질의 건어물을 선별하고 유통해 왔습니다.
          </p>
          <p className="text-slate-300 leading-relaxed">
            현재 서울 가락동 농수산물도매시장에서 중도매인으로서 전국의 식당, 기업, 
            가정에 최상급 건어물을 직접 공급하고 있으며, 온라인을 통해 전국 어디서나 
            진성의 정성을 만나보실 수 있습니다.
          </p>
        </div>

        {/* Philosophy */}
        <div>
          <h3 className="text-[#c59f59] font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#c59f59]"></span>
            PHILOSOPHY
          </h3>
          <h4 className="text-2xl md:text-3xl font-bold text-white mb-6">자연의 깊이를 식탁에</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'verified', title: '엄격한 선별', desc: '매일 새벽, 직접 눈으로 확인하고 손으로 골라낸 최상급 원물만을 취급합니다.' },
              { icon: 'local_shipping', title: '산지 직송', desc: '중간 유통 단계를 최소화하여 가장 신선한 상태로 빠르게 배송합니다.' },
              { icon: 'favorite', title: '고객 신뢰', desc: '50년간 쌓아온 신뢰를 바탕으로 모든 상품에 대해 100% 품질을 보증합니다.' },
            ].map((item) => (
              <div key={item.title} className="bg-[#031a3a] border border-[#c59f59]/10 rounded-xl p-8 text-center">
                <div className="w-16 h-16 border border-[#c59f59]/30 flex items-center justify-center rounded-full mb-6 mx-auto">
                  <span className="material-symbols-outlined text-[#c59f59] text-2xl">{item.icon}</span>
                </div>
                <h5 className="text-white font-bold text-lg mb-3">{item.title}</h5>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-[#c59f59] font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-[#c59f59]"></span>
            LOCATION
          </h3>
          <h4 className="text-2xl md:text-3xl font-bold text-white mb-6">오시는 길</h4>
          <div className="bg-[#031a3a] border border-[#c59f59]/10 rounded-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="material-symbols-outlined text-[#c59f59]">location_on</span>
              <div>
                <p className="text-white font-bold mb-1">서울시 송파구 가락동 600번지</p>
                <p className="text-slate-400">농수산물도매시장 서1문 중도매인 93번지 101-102호</p>
              </div>
            </div>
            <div className="flex items-start gap-4 mb-6">
              <span className="material-symbols-outlined text-[#c59f59]">call</span>
              <div>
                <p className="text-slate-300">대표: <span className="text-white font-bold">0507-1338-7151</span></p>
                <p className="text-slate-300">매장: <span className="text-white font-bold">02-407-7151</span></p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-[#c59f59]">schedule</span>
              <div>
                <p className="text-slate-300">평일/토요일: <span className="text-white font-bold">05:00 - 15:00</span></p>
                <p className="text-slate-300">일요일 <span className="text-red-400 font-bold">휴무</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
