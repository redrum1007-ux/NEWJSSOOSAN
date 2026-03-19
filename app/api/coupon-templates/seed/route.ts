import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { CouponTemplate } from '@/lib/types/coupon';
import { v4 as uuidv4 } from 'uuid';

// GET /api/coupon-templates/seed → 신규가입 기본 쿠폰 템플릿 자동 생성
export async function GET() {
  const templates = await readDB<CouponTemplate>('coupon_templates');
  const exists = templates.find((t) => t.code === 'WELCOME10');
  if (!exists) {
    const welcome: CouponTemplate = {
      id: uuidv4(),
      code: 'WELCOME10',
      name: '신규가입 10% 할인 쿠폰',
      type: 'percent',
      value: 10,
      minOrderAmount: 30000,
      maxDiscount: 20000,
      triggerEvent: 'signup',
      validDays: 30,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    templates.push(welcome);
    await writeDB('coupon_templates', templates);
    return NextResponse.json({ message: '신규가입 쿠폰 템플릿이 생성되었습니다.', template: welcome });
  }
  return NextResponse.json({ message: '이미 존재합니다.', template: exists });
}
