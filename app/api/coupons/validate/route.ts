import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Coupon } from '@/lib/types/coupon';

// POST /api/coupons/validate  → 쿠폰 코드 유효성 검사 + 적용 금액 계산
export async function POST(req: NextRequest) {
  const { code, userId, orderAmount } = await req.json();
  const coupons = await readDB<Coupon>('coupons');
  const now = new Date();

  const coupon = coupons.find(
    (c) => c.code === code && c.userId === userId && !c.used
  );

  if (!coupon) {
    return NextResponse.json({ error: '유효하지 않거나 이미 사용된 쿠폰입니다.' }, { status: 400 });
  }
  if (new Date(coupon.expiresAt) < now) {
    return NextResponse.json({ error: '만료된 쿠폰입니다.' }, { status: 400 });
  }
  if (orderAmount < coupon.minOrderAmount) {
    return NextResponse.json({
      error: `최소 주문 금액 ${coupon.minOrderAmount.toLocaleString()}원 이상 주문 시 사용 가능합니다.`,
    }, { status: 400 });
  }

  let discount = 0;
  if (coupon.type === 'percent') {
    discount = Math.floor(orderAmount * (coupon.value / 100));
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = coupon.value;
  }
  discount = Math.min(discount, orderAmount);

  return NextResponse.json({
    coupon,
    discount,
    finalAmount: orderAmount - discount,
  });
}
