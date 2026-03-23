import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    await db.collection('reviews').doc(resolvedParams.id).delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
