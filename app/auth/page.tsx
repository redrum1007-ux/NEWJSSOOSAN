'use client';

import Link from 'next/link';
import AuthControls from '@/components/AuthControls';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthPage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#021127] text-white pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#c59f59] mb-4 tracking-tight">
            JINSUNG MEMBER BENEFITS
          </h1>
          <p className="text-xl text-slate-300 font-light">
            진성네이처푸드의 식구가 되어 프리미엄 혜택을 누려보세요.
          </p>
        </div>

        {/* Coupon Card Area */}
        <div className="relative group max-w-2xl mx-auto mb-16 overflow-hidden rounded-2xl shadow-2xl border border-[#c59f59]/30">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#c59f59]/20 to-transparent z-10 pointer-events-none"></div>
          <img 
            src="/welcome_coupon_10percent.png" 
            alt="Welcome 10% Coupon" 
            className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        {/* Benefits Description */}
        <div className="bg-[#0a192f] border border-[#c59f59]/10 rounded-3xl p-8 md:p-12 mb-12 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div>
              <h3 className="text-2xl font-bold text-[#c59f59] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">card_membership</span>
                신규회원 프리미엄 혜택
              </h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-[#c59f59] font-bold">01</span>
                  <span><strong>10% 웰컴 쿠폰</strong> 즉시 발급 (가입 완료 시)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#c59f59] font-bold">02</span>
                  <span>구매 금액의 <strong>1% 포인트 적립</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#c59f59] font-bold">03</span>
                  <span>멤버십 전용 <strong>시크릿 할인 혜택</strong></span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col justify-center items-center md:items-end">
              <div className="text-center md:text-right mb-8">
                <p className="text-3xl font-bold text-white mb-2">지금 1분 만에 가입하고</p>
                <p className="text-4xl font-extrabold text-[#c59f59]">10% 할인을 받으세요!</p>
              </div>
              
              {!user ? (
                <div className="scale-125 transform origin-right">
                  <AuthControls />
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-green-400 font-bold mb-4">이미 로그인되어 있습니다. 🎉</p>
                  <Link href="/products" className="bg-[#c59f59] text-[#021127] px-8 py-3 rounded-full font-bold hover:bg-white transition-all">
                    상품 보러가기
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-slate-500 text-sm">
          * 발급된 쿠폰 및 포인트 내역은 <Link href="/mypage" className="text-[#c59f59] underline hover:text-white transition">마이페이지</Link>에서 확인 가능합니다.<br/>
          * 쿠폰은 발급일로부터 30일간 유효합니다.<br/>
          * 포인트는 구매 완료 시 자동으로 적립되며, 1P = 1원 기준으로 사용됩니다.
        </p>
      </div>
    </div>
  );
}
