import { NextResponse } from 'next/server';
import { readDB } from '@/lib/db';
import { PointHistory } from '@/lib/types/point';

// GET /api/points/admin/history → 전체 포인트 내역 (관리자 전용)
export async function GET() {
  const history = await readDB<PointHistory>('point_history');
  const sorted = [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ history: sorted });
}
