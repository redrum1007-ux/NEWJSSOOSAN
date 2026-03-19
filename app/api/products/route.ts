import { NextRequest, NextResponse } from 'next/server';
import { readCollection, setDocument, deleteDocument } from '@/lib/db';
import { Product, products as INITIAL_PRODUCTS } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  let products = await readCollection<Product>('products');
  if (!products || products.length === 0) {
    products = INITIAL_PRODUCTS;
    // 시드 데이터를 개별 문서로 넣기
    for (const p of products) {
      try { await setDocument('products', String(p.id), p); } catch(e) {}
    }
  }
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newProduct: Product = body;
    
    // 개별 문서로 저장 (에러 시 catch 됨)
    await setDocument('products', String(newProduct.id), newProduct);
    
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error saving product:', error);
    return NextResponse.json({ success: false, error: 'Database limit exceeded or saving error' }, { status: 500 });
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
