import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Slide } from '@/lib/types/slide';



// PATCH /api/slides/[id] → 슬라이드 수정
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const slides = await readDB<Slide>('slides');
  const idx = slides.findIndex((s) => s.id === id);
  if (idx === -1) return NextResponse.json({ error: '슬라이드를 찾을 수 없습니다.' }, { status: 404 });
  slides[idx] = { ...slides[idx], ...body };
  await writeDB('slides', slides);
  return NextResponse.json({ slide: slides[idx] });
}

// DELETE /api/slides/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const slides = await readDB<Slide>('slides');
  await writeDB('slides', slides.filter((s) => s.id !== id));
  return NextResponse.json({ success: true });
}
