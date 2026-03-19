import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { CouponTemplate } from '@/lib/types/coupon';

// PATCH /api/coupon-templates/[id] → 활성/비활성 토글
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const templates = await readDB<CouponTemplate>('coupon_templates');
  const idx = templates.findIndex((t) => t.id === id);
  if (idx === -1) return NextResponse.json({ error: '템플릿을 찾을 수 없습니다.' }, { status: 404 });
  templates[idx] = { ...templates[idx], ...body };
  await writeDB('coupon_templates', templates);
  return NextResponse.json({ template: templates[idx] });
}

// DELETE /api/coupon-templates/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const templates = await readDB<CouponTemplate>('coupon_templates');
  await writeDB('coupon_templates', templates.filter((t) => t.id !== id));
  return NextResponse.json({ success: true });
}
