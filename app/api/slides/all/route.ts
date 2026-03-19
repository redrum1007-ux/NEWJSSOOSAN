import { NextResponse } from 'next/server';
import { readDB } from '@/lib/db';
import { Slide } from '@/lib/types/slide';

// GET /api/slides/all → 관리자용 전체(비활성 포함)
export async function GET() {
  const slides = await readDB<Slide>('slides');
  const sorted = slides.sort((a, b) => a.order - b.order);
  return NextResponse.json({ slides: sorted });
}
