import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Inquiry } from '@/lib/types/inquiry';

// GET /api/inquiries/[id] - 문의 상세 조회
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const inquiries = await readDB<Inquiry>('inquiries');
  const inquiry = inquiries.find((inq) => inq.id === id);
  if (!inquiry) {
    return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
  }
  return NextResponse.json({ inquiry });
}

// PATCH /api/inquiries/[id] - 답변 등록 (관리자용)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const inquiries = await readDB<Inquiry>('inquiries');
  const idx = inquiries.findIndex((inq) => inq.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: '문의를 찾을 수 없습니다.' }, { status: 404 });
  }
  inquiries[idx] = {
    ...inquiries[idx],
    ...body,
    answeredAt: new Date().toISOString(),
    status: 'answered',
  };
  await writeDB('inquiries', inquiries);
  return NextResponse.json({ inquiry: inquiries[idx] });
}

// DELETE /api/inquiries/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const inquiries = await readDB<Inquiry>('inquiries');
  const filtered = inquiries.filter((inq) => inq.id !== id);
  await writeDB('inquiries', filtered);
  return NextResponse.json({ success: true });
}
