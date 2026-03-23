import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

  try {
    const snapshot = await db.collection('reviews')
      .where('productId', '==', productId)
      .orderBy('createdAt', 'desc')
      .get();

    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newReview = { 
      productId: data.productId,
      userId: data.userId || null,
      userName: data.userName,
      content: data.content,
      rating: data.rating || 5,
      isAdminReview: data.isAdminReview || false,
      createdAt: new Date().toISOString() 
    };
    const docRef = await db.collection('reviews').add(newReview);
    return NextResponse.json({ id: docRef.id, ...newReview });
  } catch (error) {
    console.error('Error adding review:', error);
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 });
  }
}
