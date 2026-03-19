import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Slide } from '@/lib/types/slide';
import { v4 as uuidv4 } from 'uuid';

// 기본 슬라이드 시드 데이터
const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'slide-001',
    order: 1,
    title: '바다의 깊이를 담다',
    subtitle: 'PREMIUM HERITAGE SINCE 1974',
    description: '진성네이처푸드가 제안하는 50년 전통의 미학.\n자연이 빚어낸 최상의 결실을 만나보세요.',
    bgImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJp2S8cy77-JOgc62D69l-8t9qfVMHzVHoSz8rK7c2qEAK9H5_ZKjXjutZy55mNZcH_mBixsv7OPB6rV8NJeYIyEpdwVtE-xXcb2Ql7NhSs26Ysvg2yRa54EfdQvp5ZvsN2u06Su9o2b2UpvQZ7tZEazPP9OrifJq_2VBG993WlOt6KeIqhXlEwGfGGPBXWxh7BbBo0Csb1y85FXNTp-LT1KVtFtcc8EVlWawADd7HLgGAo6bRsXcW_-LeTgwUGjRs1cR_K1OJ_BuG',
    bgColor: '#021127',
    overlayColor: 'rgba(2,17,39,0.55)',
    titleColor: '#ffffff',
    descColor: '#cbd5e1',
    badgeBg: 'transparent',
    badgeText: '',
    badgeTextColor: '#c59f59',
    ctaLabel: '컬렉션 보기',
    ctaHref: '/products',
    ctaLabel2: '브랜드 스토리',
    ctaHref2: '/about',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'slide-002',
    order: 2,
    title: '신규 회원가입 이벤트',
    subtitle: '🎁 WELCOME EVENT',
    description: '지금 가입하면 3가지 특별 혜택이 한 번에!',
    bgImage: '',
    bgColor: '#021127',
    overlayColor: 'rgba(2,17,39,0.92)',
    titleColor: '#c59f59',
    descColor: '#e2e8f0',
    badgeBg: '#c59f59',
    badgeText: '지금 바로 혜택 받기',
    badgeTextColor: '#ffffff',
    ctaLabel: '회원가입 하기',
    ctaHref: '/auth',
    ctaLabel2: '상품 보러가기',
    ctaHref2: '/products',
    couponImage: '/welcome_coupon_10percent.png',
    bullets: [
      '신규가입 즉시 10% 할인쿠폰 자동 발급',
      '구매 금액의 1% 포인트 자동 적립',
      '회원 전용 시크릿 할인 쿠폰 지급',
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

async function initSlides(): Promise<Slide[]> {
  const existing = await readDB<Slide>('slides');
  if (existing.length === 0) {
    await writeDB('slides', DEFAULT_SLIDES);
    return DEFAULT_SLIDES;
  }
  return existing;
}

// GET /api/slides
export async function GET() {
  const slides = await initSlides();
  const active = slides.filter((s) => s.isActive).sort((a, b) => a.order - b.order);
  return NextResponse.json({ slides: active });
}

// POST /api/slides → 새 슬라이드 생성
export async function POST(req: NextRequest) {
  const body = await req.json();
  const slides = await initSlides();
  const maxOrder = slides.reduce((m, s) => Math.max(m, s.order), 0);
  const newSlide: Slide = {
    id: uuidv4(),
    order: maxOrder + 1,
    title: body.title || '새 슬라이드',
    subtitle: body.subtitle || '',
    description: body.description || '',
    bgImage: body.bgImage || '',
    bgColor: body.bgColor || '#021127',
    overlayColor: body.overlayColor || 'rgba(2,17,39,0.7)',
    titleColor: body.titleColor || '#ffffff',
    descColor: body.descColor || '#cbd5e1',
    badgeBg: body.badgeBg || '#c59f59',
    badgeText: body.badgeText || '',
    badgeTextColor: body.badgeTextColor || '#ffffff',
    ctaLabel: body.ctaLabel || '바로가기',
    ctaHref: body.ctaHref || '/',
    ctaLabel2: body.ctaLabel2 || '',
    ctaHref2: body.ctaHref2 || '',
    couponImage: body.couponImage || '',
    bullets: body.bullets || [],
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  slides.push(newSlide);
  await writeDB('slides', slides);
  return NextResponse.json({ slide: newSlide }, { status: 201 });
}
