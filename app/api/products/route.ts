import { NextRequest, NextResponse } from 'next/server';
import { readCollectionSafe, setDocument, deleteDocument } from '@/lib/db';
import { Product, products as INITIAL_PRODUCTS } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  // readCollectionSafe: 에러 시 null, 실제 빈 DB면 [] 반환
  const products = await readCollectionSafe<Product>('products');

  if (products === null) {
    // ✅ 읽기 오류: DB를 건드리지 않고 초기 상품 목록을 임시 반환
    console.error('[products GET] Firestore 읽기 오류 - DB 초기화 없이 초기 목록 반환');
    return NextResponse.json({ products: INITIAL_PRODUCTS });
  }

  if (products.length === 0) {
    // ✅ 진짜 빈 DB: 최초 1회만 시드 데이터 삽입
    console.log('[products GET] 빈 products 컬렉션 - 시드 데이터 초기 삽입');
    for (const p of INITIAL_PRODUCTS) {
      try { await setDocument('products', String(p.id), p); } catch (e) {}
    }
    return NextResponse.json({ products: INITIAL_PRODUCTS });
  }

  // ✅ 정상: Firestore에서 가져온 실제 상품 목록 반환
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[API POST /products] Request received:', body);
    const newProduct: Product = body;

    console.log('[API POST /products] Saving to Firestore id:', newProduct.id);
    await setDocument('products', String(newProduct.id), newProduct);
    console.log('[API POST /products] Firestore save success!');

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error('[API POST /products] Error saving product:', error?.code || error?.message || error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to save product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'Id is required' }, { status: 400 });

  try {
    await deleteDocument('products', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
