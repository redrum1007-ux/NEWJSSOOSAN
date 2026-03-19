'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthControls from '@/components/AuthControls';
import { Product } from '@/lib/products';
import { useCartStore } from '@/store/useCartStore';

export default function ProductsPage() {
  const { addToCart } = useCartStore();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        setLoading(false);
      });
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.img,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#021127]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#c59f59]/10 bg-[#021127]/80 backdrop-blur-md px-6 md:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#c59f59]">
            <span className="material-symbols-outlined text-3xl">waves</span>
            <h1 className="text-xl font-extrabold tracking-tighter uppercase">Jinsung Nature Food</h1>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/cart" className="relative p-2 hover:bg-[#c59f59]/10 rounded-full transition-colors text-slate-100">
              <span className="material-symbols-outlined">shopping_bag</span>
            </Link>
            <AuthControls />
          </div>
        </div>
      </header>

      {/* Page Hero */}
      <section className="py-20 px-6 md:px-20 text-center">
        <h3 className="text-[#c59f59] font-semibold mb-2 flex items-center gap-2 justify-center">
          <span className="w-8 h-[1px] bg-[#c59f59]"></span>
          PREMIUM COLLECTION
          <span className="w-8 h-[1px] bg-[#c59f59]"></span>
        </h3>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">전체 상품</h2>
        <p className="text-slate-400 max-w-xl mx-auto">청정 바다에서 엄선한 진성네이처푸드의 프리미엄 건어물을 만나보세요.</p>
      </section>

      {/* Product Grid */}
      <section className="px-6 md:px-20 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group">
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#031a3a] mb-6 shadow-2xl shadow-black/50 cursor-pointer">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url('${product.img}')` }}
                  ></div>
                  {product.tag && (
                    <div className="absolute top-4 right-4 bg-[#c59f59] text-[#021127] px-3 py-1 text-[10px] font-black rounded-full uppercase">
                      {product.tag}
                    </div>
                  )}
                </div>
              </Link>
              <Link href={`/products/${product.id}`}>
                <h4 className="text-xl font-bold mb-1 group-hover:text-[#c59f59] transition-colors text-white">{product.name}</h4>
              </Link>
              <p className="text-slate-500 text-sm mb-3">{product.desc}</p>
              <div className="flex items-center justify-between">
                <p className="text-[#c59f59] font-bold text-lg">{product.priceText}원</p>
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                    addedId === product.id
                      ? 'bg-green-500 text-white'
                      : 'bg-[#c59f59] text-[#021127] hover:bg-[#c59f59]/80'
                  }`}
                >
                  {addedId === product.id ? '✓ 담김' : '장바구니'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
