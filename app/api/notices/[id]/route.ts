import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Notice } from '@/lib/types/notice';

// PATCH /api/notices/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const notices = await readDB<Notice>('notices');

  const idx = notices.findIndex((n) => n.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: '공지를 찾을 수 없습니다.' }, { status: 404 });
  }

  notices[idx] = { ...notices[idx], ...body, updatedAt: new Date().toISOString() };
  await writeDB('notices', notices);

  return NextResponse.json({ notice: notices[idx] });
}

// DELETE /api/notices/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const notices = await readDB<Notice>('notices');
  const filtered = notices.filter((n) => n.id !== id);

  if (filtered.length === notices.length) {
    return NextResponse.json({ error: '공지를 찾을 수 없습니다.' }, { status: 404 });
  }

  await writeDB('notices', filtered);
  return NextResponse.json({ success: true });
}
