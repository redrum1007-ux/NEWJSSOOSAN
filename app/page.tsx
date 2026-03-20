'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthControls from '@/components/AuthControls';
import HeroSlider from '@/components/HeroSlider';
import RecentNotices from '@/components/RecentNotices';
import { Product } from '@/lib/products';

export default function HomePage() {
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.products) setDisplayProducts(data.products.slice(0, 4));
      });
  }, []);
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header Section */}
      <header className="sticky top-0 z-50 w-full border-b border-[#c59f59]/10 bg-[#021127]/80 backdrop-blur-md px-6 md:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2 text-[#c59f59]">
              <span className="material-symbols-outlined text-3xl">waves</span>
              <h1 className="text-xl font-extrabold tracking-tighter uppercase">Jinsung Nature Food</h1>
            </div>
            <nav className="hidden lg:flex items-center gap-8 text-slate-100">
              <Link className="text-sm font-medium hover:text-[#c59f59] transition-colors" href="/products">Shop</Link>
              <Link className="text-sm font-medium hover:text-[#c59f59] transition-colors" href="/about">Our Story</Link>
              <Link className="text-sm font-medium hover:text-[#c59f59] transition-colors" href="/products?category=선물세트">Gift Sets</Link>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-[#031a3a] border border-[#c59f59]/20 rounded-full px-4 py-1.5">
              <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
              <input 
                className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-500 w-32 lg:w-48 outline-none ml-2" 
                placeholder="검색어를 입력하세요" 
                type="text"
              />
            </div>
            <Link href="/cart" className="relative p-2 hover:bg-[#c59f59]/10 rounded-full transition-colors">
              <span className="material-symbols-outlined">shopping_bag</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#c59f59] rounded-full"></span>
            </Link>
            <button className="lg:hidden p-2">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <AuthControls />
          </div>
        </div>
      </header>

      {/* Hero Section - 슬라이드 */}
      <HeroSlider />

      {/* Featured Curation */}
      <section className="py-24 px-6 md:px-20 bg-[#021127]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div className="max-w-xl">
              <h3 className="text-[#c59f59] font-semibold mb-2 flex items-center gap-2">
                <span className="w-8 h-[1px] bg-[#c59f59]"></span>
                PREMIUM CURATION
              </h3>
              <h2 className="text-3xl md:text-4xl font-bold text-white">진성이 엄선한 계절의 선물</h2>
            </div>
            <Link className="text-[#c59f59] border-b border-[#c59f59]/30 pb-1 hover:border-[#c59f59] transition-all text-sm font-semibold tracking-wider uppercase" href="/products">
              View All Products
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayProducts.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="group cursor-pointer">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#031a3a] mb-6 shadow-2xl shadow-black/50">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                    style={{ backgroundImage: `url('${product.img}')` }}
                  ></div>
                  {product.tag && (
                    <div className="absolute top-4 right-4 bg-[#c59f59] text-[#021127] px-3 py-1 text-[10px] font-black rounded-full uppercase">
                      {product.tag}
                    </div>
                  )}
                </div>
                <h4 className="text-xl font-bold mb-1 group-hover:text-[#c59f59] transition-colors text-white">{product.name}</h4>
                <p className="text-[#c59f59] font-bold mt-2">{product.priceText}원</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Notices Section */}
      <RecentNotices />

      {/* Brand Philosophy Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#021127]/60 z-10"></div>
          <div 
            className="w-full h-full bg-cover bg-fixed bg-center" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAELRlqP140TlIVb2jZSRSau4hM-tCelD5A7F2N4RQrNKWwGjH-Mznz1VH8Ijka82n69KetrV4NbFO_5SxzZJBthYE4tnbb29CA2HcbIC6aesn2Jk9kfaL5cmnkVQhIexIxWX47hBLfWf8jYVJPTHjrLe3C-PczGuMOOqow-I-l_UclSs4vKUhosULVRkBWM07X2w2-EFQfzznwzmBUbo5zs_fVEgRLMadXv6VHaR8o_xewbPvNgC0uCB-lcqmMZA2OEYKz5Dh80PQC')" }}
          ></div>
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 border border-[#c59f59]/50 flex items-center justify-center rounded-full mb-8 backdrop-blur-md">
            <span className="material-symbols-outlined text-[#c59f59] text-4xl">workspace_premium</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight text-white italic">50년의 헤리티지,<br/>자연 그대로의 진심</h2>
          <div className="w-16 h-[2px] bg-[#c59f59] mb-8"></div>
          <p className="text-lg md:text-xl text-slate-200 font-light max-w-3xl leading-relaxed">
            진성수산 네이처푸드는 1974년부터 시작된 고집스러운 장인정신으로<br/>
            청정 대한민국 바다의 신선함을 고객님들의 식탁으로 전달해드리고 있습니다.<br/>
            시간이 지나도 변하지 않는 가치있는 바다와 자연의 맛, 그것이 우리의 철학입니다.
          </p>
          <Link href="/about" className="mt-12 text-[#c59f59] border border-[#c59f59] px-8 py-3 rounded-full hover:bg-[#c59f59] hover:text-[#021127] transition-all duration-300 font-bold inline-block">
            브랜드 스토리 읽어보기
          </Link>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-[#010a17] border-t border-[#c59f59]/10 pt-20 pb-10 px-6 md:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2 text-[#c59f59]">
                <span className="material-symbols-outlined text-3xl">waves</span>
                <h2 className="text-xl font-extrabold tracking-tighter uppercase">Jinsung</h2>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                최상의 자연식품을 제안하는 50년 전통의 프리미엄 브랜드 진성네이처푸드입니다. 자연의 깊이를 식탁에 전합니다.
              </p>
              <div className="flex gap-4">
                {[ 'language', 'camera', 'mail' ].map(icon => (
                  <button key={icon} className="w-10 h-10 rounded-full border border-[#c59f59]/20 flex items-center justify-center text-slate-400 hover:text-[#c59f59] hover:border-[#c59f59] transition-all">
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Menu</h5>
              <ul className="flex flex-col gap-4 text-sm text-slate-500">
                <li><Link className="hover:text-[#c59f59] transition-colors" href="/about">회사소개</Link></li>
                <li><Link className="hover:text-[#c59f59] transition-colors" href="/products">상품목록</Link></li>
                <li><Link className="hover:text-[#c59f59] transition-colors" href="/inquiry">대량구매 문의</Link></li>
                <li><Link className="hover:text-[#c59f59] transition-colors" href="/auth">멤버십 가입 시 10% 할인쿠폰 증정</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Legal</h5>
              <ul className="flex flex-col gap-4 text-sm text-slate-500">
                <li><Link className="hover:text-[#c59f59] transition-colors" href="/terms">이용약관</Link></li>
                <li><Link className="hover:text-[#c59f59] transition-colors" href="/privacy">개인정보처리방침</Link></li>
                <li><Link className="hover:text-[#c59f59] transition-colors" href="/shipping-policy">배송 및 환불 정책</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-bold mb-6">Contact</h5>
              <ul className="flex flex-col gap-4 text-sm text-slate-500">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#c59f59] text-lg">location_on</span>
                  <span>서울시 송파구 가락동 600번지역<br/>농수산물도매시장<br/>서1문 중도매인 93번지 101-102호</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#c59f59] text-lg">call</span>
                  <div>
                    <p>대표: 0507-1338-7151</p>
                    <p>매장: 02-407-7151</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#c59f59] text-lg">schedule</span>
                  <div>
                    <p>평일/토요일 05:00 - 15:00</p>
                    <p>일요일 휴무</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#c59f59]/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
            <p>© 2026 Jinsung Nature Food Co., Ltd. All rights reserved.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-end">
              <span>법인명: (유)진성수산</span>
              <span>대표자: 박종구</span>
              <span>법인등록번호: 110114-0046406</span>
              <span>통신판매업신고번호: 제2022-서울송파-1067호</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
