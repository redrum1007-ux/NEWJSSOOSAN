import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Coupon, CouponTemplate } from '@/lib/types/coupon';
import { v4 as uuidv4 } from 'uuid';

// GET /api/coupons?userId=xxx  → 해당 유저의 쿠폰 목록
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const coupons = await readDB<Coupon>('coupons');
  if (!userId) {
    return NextResponse.json({ coupons }, { status: 200 });
  }
  const userCoupons = coupons.filter((c) => c.userId === userId);
  return NextResponse.json({ coupons: userCoupons });
}

// POST /api/coupons  → 쿠폰 발급 (신규가입 자동 / 관리자 수동)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, triggerEvent, templateId } = body;

  const templates = await readDB<CouponTemplate>('coupon_templates');
  const coupons = await readDB<Coupon>('coupons');

  let targetTemplates: CouponTemplate[] = [];

  if (templateId) {
    const t = templates.find((t) => t.id === templateId && t.isActive);
    if (t) targetTemplates = [t];
  } else if (triggerEvent) {
    targetTemplates = templates.filter(
      (t) => t.triggerEvent === triggerEvent && t.isActive
    );
  }

  if (targetTemplates.length === 0) {
    return NextResponse.json({ coupons: [] }, { status: 200 });
  }

  const issued: Coupon[] = [];
  for (const tmpl of targetTemplates) {
    // 동일한 templateId 쿠폰을 이미 발급받은 유저는 건너뜀
    const alreadyIssued = coupons.some(
      (c) => c.userId === userId && c.code === tmpl.code
    );
    if (alreadyIssued) continue;

    const expiresAt = new Date(Date.now() + tmpl.validDays * 86400000).toISOString();
    const newCoupon: Coupon = {
      id: uuidv4(),
      code: tmpl.code,
      name: tmpl.name,
      type: tmpl.type,
      value: tmpl.value,
      minOrderAmount: tmpl.minOrderAmount,
      maxDiscount: tmpl.maxDiscount,
      issuedTo: userId || 'all',
      triggerEvent: tmpl.triggerEvent,
      used: false,
      createdAt: new Date().toISOString(),
      expiresAt,
      userId,
    };
    issued.push(newCoupon);
    coupons.push(newCoupon);
  }

  await writeDB('coupons', coupons);
  return NextResponse.json({ coupons: issued }, { status: 201 });
}
