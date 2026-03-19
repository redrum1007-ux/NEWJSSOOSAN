export interface PointHistory {
  id: string;
  userId: string;
  type: 'earn' | 'use';   // 적립 | 사용
  amount: number;          // 포인트 금액
  reason: string;          // 사유 (예: 주문 적립, 포인트 사용)
  orderId?: string;
  createdAt: string;
}

export interface UserPoint {
  userId: string;
  total: number;           // 현재 보유 포인트
  updatedAt: string;
}
