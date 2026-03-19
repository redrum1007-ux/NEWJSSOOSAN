import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Coupon } from '@/lib/types/coupon';

// PATCH /api/coupons/[id]/use  → 쿠폰 사용 처리
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { orderId } = await req.json();
  const coupons = await readDB<Coupon>('coupons');
  const idx = coupons.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: '쿠폰을 찾을 수 없습니다.' }, { status: 404 });

  coupons[idx] = {
    ...coupons[idx],
    used: true,
    usedAt: new Date().toISOString(),
    usedOrderId: orderId,
  };
  await writeDB('coupons', coupons);
  return NextResponse.json({ coupon: coupons[idx] });
}
