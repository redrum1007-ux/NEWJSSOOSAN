import { NextResponse } from 'next/server';
import { readDB } from '@/lib/db';
import { UserPoint } from '@/lib/types/point';

// GET /api/points/admin → 전체 회원 포인트 잔액 (관리자 전용)
export async function GET() {
  const userPoints = await readDB<UserPoint>('user_points');
  return NextResponse.json({ userPoints });
}
