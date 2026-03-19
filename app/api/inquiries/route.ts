import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Inquiry } from '@/lib/types/inquiry';
import { v4 as uuidv4 } from 'uuid';

// GET /api/inquiries - 문의 목록 조회
export async function GET() {
  const inquiries = await readDB<Inquiry>('inquiries');
  // 비공개 문의는 내용을 가림
  const safeList = inquiries
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((inq) => ({
      id: inq.id,
      name: inq.name,
      category: inq.category,
      title: inq.isPrivate ? '🔒 비공개 문의입니다.' : inq.title,
      status: inq.status,
      createdAt: inq.createdAt,
      isPrivate: inq.isPrivate,
      userId: inq.userId,
    }));
  return NextResponse.json({ inquiries: safeList });
}

// POST /api/inquiries - 문의 등록
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, category, title, content, isPrivate, userId } = body;

  if (!name || !email || !category || !title || !content) {
    return NextResponse.json({ error: '필수 항목을 모두 입력해주세요.' }, { status: 400 });
  }

  const inquiries = await readDB<Inquiry>('inquiries');
  const newInquiry: Inquiry = {
    id: uuidv4(),
    name,
    email,
    phone: phone || '',
    category,
    title,
    content,
    isPrivate: isPrivate ?? false,
    status: 'pending',
    userId: userId || '',
    createdAt: new Date().toISOString(),
  };

  inquiries.push(newInquiry);
  await writeDB('inquiries', inquiries);

  return NextResponse.json({ inquiry: newInquiry }, { status: 201 });
}
