export interface Slide {
  id: string;
  order: number;           // 슬라이드 순서
  title: string;           // 대제목
  subtitle?: string;       // 소제목 (태그라인)
  description: string;     // 설명
  bgImage?: string;        // 배경 이미지 URL
  bgColor: string;         // 배경 색상 (이미지 없을 때)
  overlayColor: string;    // 오버레이 색상 (rgba)
  titleColor: string;      // 제목 색상
  descColor: string;       // 설명 색상
  badgeBg: string;         // 뱃지 배경색
  badgeText: string;       // 뱃지 텍스트
  badgeTextColor: string;
  ctaLabel?: string;       // 버튼1 텍스트
  ctaHref?: string;        // 버튼1 링크
  ctaLabel2?: string;      // 버튼2 텍스트
  ctaHref2?: string;       // 버튼2 링크
  couponImage?: string;    // 쿠폰 이미지 URL (선택)
  bullets?: string[];      // 리스트 항목
  isActive: boolean;
  createdAt: string;
}
