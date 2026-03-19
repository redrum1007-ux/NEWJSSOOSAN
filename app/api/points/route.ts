import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { PointHistory, UserPoint } from '@/lib/types/point';
import { v4 as uuidv4 } from 'uuid';

// GET /api/points?userId=xxx → 잔액 + 내역
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId 필요' }, { status: 400 });

  const points = await readDB<UserPoint>('user_points');
  const history = await readDB<PointHistory>('point_history');

  const userPoint = points.find((p) => p.userId === userId);
  const userHistory = history.filter((h) => h.userId === userId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({
    total: userPoint?.total ?? 0,
    history: userHistory,
  });
}

// POST /api/points → 포인트 적립 (earn) 또는 사용 (use)
export async function POST(req: NextRequest) {
  const { userId, type, amount, reason, orderId } = await req.json();
  if (!userId || !type || !amount) {
    return NextResponse.json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
  }

  const points = await readDB<UserPoint>('user_points');
  const history = await readDB<PointHistory>('point_history');

  const idx = points.findIndex((p) => p.userId === userId);

  let currentTotal = idx >= 0 ? points[idx].total : 0;

  if (type === 'use') {
    if (currentTotal < amount) {
      return NextResponse.json({ error: '포인트가 부족합니다.' }, { status: 400 });
    }
    currentTotal -= amount;
  } else {
    // earn: 1원 단위 소수점 버림
    currentTotal += Math.floor(amount);
  }

  if (idx >= 0) {
    points[idx] = { ...points[idx], total: currentTotal, updatedAt: new Date().toISOString() };
  } else {
    points.push({ userId, total: currentTotal, updatedAt: new Date().toISOString() });
  }

  const newHistory: PointHistory = {
    id: uuidv4(),
    userId,
    type,
    amount: Math.floor(amount),
    reason: reason || (type === 'earn' ? '포인트 적립' : '포인트 사용'),
    orderId,
    createdAt: new Date().toISOString(),
  };

  history.push(newHistory);
  await writeDB('user_points', points);
  await writeDB('point_history', history);

  return NextResponse.json({ total: currentTotal, history: newHistory }, { status: 201 });
}
