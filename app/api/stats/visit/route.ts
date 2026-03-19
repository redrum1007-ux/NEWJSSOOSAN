import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { DailyVisit } from '@/lib/types/stats';

// POST /api/stats/visit → 방문자 증가 (중복 처리는 간단하게 오늘 날짜 기준)
export async function POST() {
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const todayStr = new Date(Date.now() + KST_OFFSET).toISOString().split('T')[0];

  const visits = await readDB<DailyVisit>('visits');
  const idx = visits.findIndex((v) => v.date === todayStr);

  if (idx === -1) {
    visits.push({ date: todayStr, count: 1 });
  } else {
    visits[idx].count += 1;
  }

  await writeDB('visits', visits);
  return NextResponse.json({ success: true, count: idx === -1 ? 1 : visits[idx].count });
}

// GET /api/stats/visit → 방문자 현재 상태 조회
export async function GET() {
  const KST_OFFSET = 9 * 60 * 60 * 1000;
  const todayStr = new Date(Date.now() + KST_OFFSET).toISOString().split('T')[0];
  const visits = await readDB<DailyVisit>('visits');
  
  const today = visits.find((v) => v.date === todayStr) || { date: todayStr, count: 0 };
  const total = visits.reduce((acc, curr) => acc + curr.count, 0);

  return NextResponse.json({ today, total, history: visits.slice(-30) }); // 최근 30일
}
