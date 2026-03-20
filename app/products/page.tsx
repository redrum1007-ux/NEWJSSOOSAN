'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AuthControls from '@/components/AuthControls';
import { Product } from '@/lib/products';
import { useCartStore } from '@/store/useCartStore';

import { SHOP_CATEGORIES } from '@/lib/constants';

const CATEGORIES = SHOP_CATEGORIES;

function ProductsContent() {
  const { addToCart } = useCartStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [addedId, setAddedId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        setLoading(false);
      });
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

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

  const handleCategoryChange = (val: string) => {
    if (val) {
      router.push(`/products?category=${encodeURIComponent(val)}`);
    } else {
      router.push('/products');
    }
  };

  const heroTitle = selectedCategory || '전체 상품';
  const heroSubtitle = selectedCategory === '선물세트'
    ? '소중한 분께 전하는 진성네이처푸드의 프리미엄 선물세트를 만나보세요.'
    : '청정 바다에서 엄선한 진성네이처푸드의 프리미엄 건어물을 만나보세요.';

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
      <section className="py-16 px-6 md:px-20 text-center">
        <h3 className="text-[#c59f59] font-semibold mb-2 flex items-center gap-2 justify-center">
          <span className="w-8 h-[1px] bg-[#c59f59]"></span>
          {selectedCategory ? 'CATEGORY' : 'PREMIUM COLLECTION'}
          <span className="w-8 h-[1px] bg-[#c59f59]"></span>
        </h3>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
          {heroTitle}
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-sm">{heroSubtitle}</p>
      </section>

      {/* 카테고리 필터 탭 */}
      <section className="px-6 md:px-20 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 border ${
                  selectedCategory === cat.value
                    ? 'bg-[#c59f59] text-[#021127] border-[#c59f59] shadow-lg shadow-[#c59f59]/20'
                    : 'bg-transparent text-slate-300 border-[#c59f59]/30 hover:border-[#c59f59] hover:text-[#c59f59]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-6 md:px-20 pb-24">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <span className="material-symbols-outlined animate-spin text-5xl text-[#c59f59]">progress_activity</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-32">
              <span className="material-symbols-outlined text-7xl text-slate-600 mb-4 block">inventory_2</span>
              <p className="text-slate-400 text-lg font-medium">
                {selectedCategory ? `'${selectedCategory}' 카테고리 상품이 없습니다.` : '등록된 상품이 없습니다.'}
              </p>
              {selectedCategory && (
                <button
                  onClick={() => router.push('/products')}
                  className="mt-6 inline-block bg-[#c59f59] text-[#021127] font-bold px-6 py-2.5 rounded-full text-sm hover:bg-[#c59f59]/80 transition"
                >
                  전체 상품 보기
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-slate-500 text-sm mb-8 text-right">
                총 <strong className="text-[#c59f59]">{filteredProducts.length}</strong>개 상품
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
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
                        {product.category === '선물세트' && (
                          <div className="absolute top-4 left-4 bg-[#031a3a]/80 text-[#c59f59] px-2 py-1 text-[10px] font-black rounded-full border border-[#c59f59]/40">
                            🎁 선물세트
                          </div>
                        )}
                      </div>
                    </Link>
                    <Link href={`/products/${product.id}`}>
                      <h4 className="text-xl font-bold mt-2 mb-3 group-hover:text-[#c59f59] transition-colors text-white">{product.name}</h4>
                    </Link>
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
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#021127] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-5xl text-[#c59f59]">progress_activity</span>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
