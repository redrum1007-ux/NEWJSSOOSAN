import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Order } from '@/lib/types/order';
import { SEED_ORDERS } from '../route';

// PATCH /api/orders/[id]  → 상태 변경 또는 메모 수정
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const orders = await readDB<Order>('orders', SEED_ORDERS);

  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다.' }, { status: 404 });
  }

  orders[idx] = { ...orders[idx], ...body };
  await writeDB('orders', orders);

  return NextResponse.json({ order: orders[idx] });
}

// DELETE /api/orders/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  const orders = await readDB<Order>('orders', SEED_ORDERS);
  
  if (!orders || !Array.isArray(orders)) {
    return NextResponse.json({ error: 'DB 오류' }, { status: 500 });
  }

  const filtered = orders.filter((o) => String(o.id) !== String(id));

  if (filtered.length === orders.length) {
    return NextResponse.json({ error: `주문을 찾을 수 없습니다. (ID: ${id})` }, { status: 404 });
  }

  await writeDB('orders', filtered);
  return NextResponse.json({ success: true });
}
