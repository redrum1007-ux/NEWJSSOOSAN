'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Slide } from '@/lib/types/slide';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AUTOPLAY_INTERVAL = 5000;

export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/slides')
      .then((r) => r.json())
      .then((data) => setSlides(data.slides || []))
      .catch(() => {});
  }, []);

  const goTo = useCallback((idx: number) => {
    if (isAnimating || slides.length === 0) return;
    setIsAnimating(true);
    setCurrent(idx);
    setTimeout(() => setIsAnimating(false), 700);
  }, [isAnimating, slides.length]);

  const prev = useCallback(() => goTo(current === 0 ? slides.length - 1 : current - 1), [current, goTo, slides.length]);
  const next = useCallback(() => goTo(current === slides.length - 1 ? 0 : current + 1), [current, goTo, slides.length]);

  // 자동 재생
  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, slides.length]);

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (slides.length > 1) timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
  };

  if (slides.length === 0) {
    return (
      <section className="relative h-[870px] w-full flex items-center justify-center bg-[#021127]">
        <div className="animate-pulse text-[#c59f59] text-xl">로딩 중...</div>
      </section>
    );
  }

  const slide = slides[current];

  return (
    <section className="relative h-[870px] w-full flex items-center justify-center overflow-hidden">
      {/* 배경 레이어 */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          style={{ backgroundColor: s.bgColor }}
        >
          {s.bgImage && (
            <div
              className="w-full h-full bg-cover bg-center scale-105"
              style={{ backgroundImage: `url('${s.bgImage}')` }}
            />
          )}
          <div className="absolute inset-0" style={{ backgroundColor: s.overlayColor }} />
        </div>
      ))}

      {/* 슬라이드 컨텐츠 */}
      <div
        key={current}
        className="relative z-20 w-full max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-center gap-10"
        style={{ animation: 'slideIn 0.6s ease-out' }}
      >
        {/* 텍스트 영역 */}
        <div className="text-center lg:text-left max-w-2xl">
          {slide.subtitle && (
            <p
              className="font-medium tracking-[0.3em] mb-4 uppercase text-sm md:text-base italic"
              style={{ color: slide.badgeTextColor || '#c59f59' }}
            >
              {slide.subtitle}
            </p>
          )}
          <h2
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
            style={{ color: slide.titleColor }}
          >
            {slide.title}
          </h2>
          {slide.description && (
            <p
              className="text-lg md:text-xl mb-6 font-light max-w-xl leading-relaxed whitespace-pre-line"
              style={{ color: slide.descColor }}
            >
              {slide.description}
            </p>
          )}
          {/* 리스트 항목 */}
          {slide.bullets && slide.bullets.length > 0 && (
            <ul className="mb-8 space-y-3 text-left">
              {slide.bullets.map((bullet, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm text-[#021127]"
                    style={{ backgroundColor: slide.badgeBg || '#c59f59' }}>
                    {i + 1}
                  </span>
                  <span style={{ color: slide.descColor }}>{bullet}</span>
                </li>
              ))}
            </ul>
          )}
          {/* CTA 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            {slide.ctaLabel && slide.ctaHref && (
              <Link
                href={slide.ctaHref}
                className={
                  slide.badgeBg === 'transparent'
                    ? 'border border-white/30 hover:bg-white/10 text-white font-bold py-4 px-10 rounded-lg backdrop-blur-sm transition-all inline-block text-center'
                    : 'font-bold py-4 px-10 rounded-lg transition-all transform hover:scale-105 inline-block text-center'
                }
                style={
                  slide.badgeBg === 'transparent'
                    ? {}
                    : { backgroundColor: slide.badgeBg || '#c59f59', color: slide.badgeTextColor || '#021127' }
                }
              >
                {slide.ctaLabel}
              </Link>
            )}
            {slide.ctaLabel2 && slide.ctaHref2 && (
              <Link
                href={slide.ctaHref2}
                className="border border-white/30 hover:bg-white/10 text-white font-bold py-4 px-10 rounded-lg backdrop-blur-sm transition-all inline-block text-center"
              >
                {slide.ctaLabel2}
              </Link>
            )}
          </div>
        </div>

        {/* 쿠폰 이미지 영역 */}
        {slide.couponImage && (
          <div className="flex-shrink-0 max-w-sm w-full">
            <img
              src={slide.couponImage}
              alt="쿠폰 이미지"
              className="w-full rounded-2xl shadow-2xl border border-[#c59f59]/20 hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
      </div>

      {/* 이전/다음 버튼 */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => { prev(); resetTimer(); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110 border border-white/20"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => { next(); resetTimer(); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/60 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110 border border-white/20"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* 하단 도트 네비게이션 */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); resetTimer(); }}
              className={`transition-all duration-300 rounded-full ${
                i === current
                  ? 'w-8 h-3 bg-[#c59f59]'
                  : 'w-3 h-3 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* 스크롤 유도 */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 animate-bounce z-30">
        <span className="material-symbols-outlined text-[#c59f59]/50 text-3xl">keyboard_double_arrow_down</span>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
