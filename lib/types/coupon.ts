export interface Coupon {
  id: string;            // 쿠폰 고유 ID
  code: string;          // 쿠폰 코드 (예: WELCOME10)
  name: string;          // 쿠폰명 (예: 신규가입 10% 할인)
  type: 'percent' | 'fixed'; // 할인 유형
  value: number;         // 할인값 (% 또는 원)
  minOrderAmount: number; // 최소 주문 금액
  maxDiscount?: number;  // 최대 할인 금액 (percent only)
  issuedTo: string;      // 발급 대상 ('all' = 자동발급, userId = 개인)
  triggerEvent?: 'signup' | 'manual'; // 발급 트리거
  used: boolean;         // 사용 여부
  usedAt?: string;
  usedOrderId?: string;
  createdAt: string;
  expiresAt: string;     // 만료 일시
  userId?: string;       // 유저별 발급 시 유저 ID
}

// 관리자가 만드는 쿠폰 템플릿 (이 템플릿 기반으로 유저에게 발급됨)
export interface CouponTemplate {
  id: string;
  code: string;
  name: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  triggerEvent: 'signup' | 'manual';
  validDays: number;     // 발급 후 유효 일수
  isActive: boolean;
  createdAt: string;
}
