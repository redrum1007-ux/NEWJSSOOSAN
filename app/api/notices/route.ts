import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Notice } from '@/lib/types/notice';

const SEED_NOTICES: Notice[] = [
  {
    id: 'NOTICE-001',
    createdAt: '2026-03-18T08:00:00Z',
    updatedAt: '2026-03-18T08:00:00Z',
    title: '진성수산 온라인몰 오픈 안내',
    content: '40년 전통 진성수산이 드디어 온라인몰을 오픈했습니다. 많은 이용 부탁드립니다.',
    pinned: true,
    author: '관리자',
  },
  {
    id: 'NOTICE-002',
    createdAt: '2026-03-17T10:00:00Z',
    updatedAt: '2026-03-17T10:00:00Z',
    title: '봄 시즌 특가 이벤트 안내',
    content: '3월 한 달간 전 상품 10% 할인 행사를 진행합니다. 많은 관심 부탁드립니다.',
    pinned: false,
    author: '관리자',
  },
];

// GET /api/notices
export async function GET() {
  const notices = await readDB<Notice>('notices', SEED_NOTICES);
  // 고정 공지 먼저, 그 다음 최신순
  const sorted = [...notices].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return NextResponse.json({ notices: sorted });
}

// POST /api/notices
export async function POST(req: NextRequest) {
  const body = await req.json();
  const notices = await readDB<Notice>('notices', SEED_NOTICES);

  if (!body.title || !body.content) {
    return NextResponse.json({ error: '제목과 내용은 필수입니다.' }, { status: 400 });
  }

  const newNotice: Notice = {
    id: `NOTICE-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: body.pinned ?? false,
    author: body.author ?? '관리자',
    title: body.title,
    content: body.content,
  };

  notices.push(newNotice);
  await writeDB('notices', notices);

  return NextResponse.json({ notice: newNotice }, { status: 201 });
}
