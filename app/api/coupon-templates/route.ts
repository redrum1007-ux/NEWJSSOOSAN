import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { CouponTemplate } from '@/lib/types/coupon';
import { v4 as uuidv4 } from 'uuid';

// GET /api/coupon-templates → 전체 쿠폰 템플릿 목록 (관리자)
export async function GET() {
  const templates = await readDB<CouponTemplate>('coupon_templates');
  return NextResponse.json({ templates });
}

// POST /api/coupon-templates → 쿠폰 템플릿 생성 (관리자)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, name, type, value, minOrderAmount, maxDiscount, triggerEvent, validDays } = body;

  if (!code || !name || !type || !value || !triggerEvent || !validDays) {
    return NextResponse.json({ error: '모든 필수 항목을 입력해주세요.' }, { status: 400 });
  }

  const templates = await readDB<CouponTemplate>('coupon_templates');
  const exists = templates.find((t) => t.code === code);
  if (exists) {
    return NextResponse.json({ error: '이미 존재하는 쿠폰 코드입니다.' }, { status: 400 });
  }

  const newTemplate: CouponTemplate = {
    id: uuidv4(),
    code: code.toUpperCase(),
    name,
    type,
    value: Number(value),
    minOrderAmount: Number(minOrderAmount) || 0,
    maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
    triggerEvent,
    validDays: Number(validDays),
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  templates.push(newTemplate);
  await writeDB('coupon_templates', templates);
  return NextResponse.json({ template: newTemplate }, { status: 201 });
}
