import { NextRequest, NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { Product, products as INITIAL_PRODUCTS } from '@/lib/products';

export async function GET() {
  let products = await readDB<Product>('products');
  if (!products || products.length === 0) {
    products = INITIAL_PRODUCTS;
    await writeDB('products', products);
  }
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const newProduct: Product = body;
  
  let products = await readDB<Product>('products');
  if (!products || products.length === 0) {
    products = INITIAL_PRODUCTS;
  }
  
  products.push(newProduct);
  await writeDB('products', products);
  
  return NextResponse.json({ success: true, product: newProduct });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ success: false, error: 'Id is required' }, { status: 400 });

  let products = await readDB<Product>('products');
  products = products.filter(p => p.id !== id);
  await writeDB('products', products);
  
  return NextResponse.json({ success: true });
}
