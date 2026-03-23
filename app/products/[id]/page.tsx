'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { useCartStore } from '@/store/useCartStore';
import { useState, useEffect } from 'react';
import ProductReviews from '@/components/ProductReviews';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCartStore();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.products) {
          const found = data.products.find((p: Product) => p.id === id);
          if (found) setProduct(found);
          
          setOtherProducts(data.products.filter((p: Product) => p.id !== id).slice(0, 3));
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-[#021127] flex items-center justify-center text-[#c59f59]">로딩 중...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#021127] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">상품을 찾을 수 없습니다</h2>
          <Link href="/products" className="text-[#c59f59] border border-[#c59f59] px-6 py-3 rounded-full hover:bg-[#c59f59] hover:text-[#021127] transition-all">
            상품 목록으로
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.img,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
            <Link href="/products" className="text-sm font-medium text-slate-100 hover:text-[#c59f59] transition-colors">Shop</Link>
            <Link href="/cart" className="relative p-2 hover:bg-[#c59f59]/10 rounded-full transition-colors text-slate-100">
              <span className="material-symbols-outlined">shopping_bag</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 py-6">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-[#c59f59] transition-colors">홈</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#c59f59] transition-colors">상품목록</Link>
          <span>/</span>
          <span className="text-[#c59f59]">{product.name}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <section className="max-w-7xl mx-auto px-6 md:px-20 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#031a3a] shadow-2xl shadow-black/50">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${product.img}')` }}
            ></div>
            {product.tag && (
              <div className="absolute top-6 right-6 bg-[#c59f59] text-[#021127] px-4 py-2 text-xs font-black rounded-full uppercase">
                {product.tag}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <h3 className="text-[#c59f59] font-semibold mb-2 flex items-center gap-2 text-sm">
              <span className="w-8 h-[1px] bg-[#c59f59]"></span>
              PREMIUM PRODUCT
            </h3>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">{product.name}</h2>

            {/* Info Table */}
            <div className="border border-[#c59f59]/10 rounded-xl overflow-hidden mb-8">
              <div className="flex">
                <div className="w-28 bg-[#031a3a] px-4 py-3 text-sm font-bold text-[#c59f59]">배송</div>
                <div className="px-4 py-3 text-sm text-slate-300">가락시장(무료배송)</div>
              </div>
            </div>

            {/* Price & Cart */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-sm text-slate-500 mb-1">판매가</p>
                <p className="text-3xl font-bold text-[#c59f59]">{product.priceText}원</p>
              </div>
              <div className="flex items-center gap-3 bg-[#031a3a] rounded-lg border border-[#c59f59]/20 px-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-xl font-bold"
                >
                  −
                </button>
                <span className="text-white font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  added
                    ? 'bg-green-500 text-white'
                    : 'bg-[#c59f59] text-[#021127] hover:bg-[#c59f59]/80 hover:scale-[1.02]'
                }`}
              >
                {added ? '✓ 장바구니에 담겼습니다' : '장바구니 담기'}
              </button>
              <Link
                href="/cart"
                className="px-6 py-4 rounded-xl font-bold text-lg border border-[#c59f59]/30 text-[#c59f59] hover:bg-[#c59f59]/10 transition-all text-center"
              >
                바로구매
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Description Section */}
      <section className="bg-white py-16 px-4 md:px-0">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <h3 className="text-2xl font-bold text-[#0A192F] mb-2 uppercase tracking-tight">Product Detail</h3>
            <div className="w-12 h-1 bg-[#c59f59] mx-auto"></div>
          </div>
          <div 
            className="rich-text-content"
            dangerouslySetInnerHTML={{ __html: product.detail }}
          />
          
          <ProductReviews productId={product.id} />
        </div>
      </section>

      {/* Other Products */}
      <section className="max-w-7xl mx-auto px-6 md:px-20 py-24">
        <h3 className="text-2xl font-bold text-white mb-10">다른 상품도 둘러보세요</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {otherProducts.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#031a3a] mb-4 shadow-xl shadow-black/30">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${p.img}')` }}
                ></div>
              </div>
              <h4 className="text-lg font-bold text-white group-hover:text-[#c59f59] transition-colors">{p.name}</h4>
              <p className="text-[#c59f59] font-bold mt-1">{p.priceText}원</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
