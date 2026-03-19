'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { Trash2, CreditCard, Tag, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';

const TOSS_CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

interface AppliedCoupon {
  id: string;
  code: string;
  name: string;
  discount: number;
}

export default function CartPage() {
  const { items, removeFromCart, getTotalPrice } = useCartStore();
  const { user } = useAuthStore();
  const totalPrice = getTotalPrice();

  const [orderInfo, setOrderInfo] = useState({ customerName: '', customerEmail: '', address: '' });

  // 쿠폰 상태
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // 포인트 상태
  const [userPoints, setUserPoints] = useState(0);
  const [usePointInput, setUsePointInput] = useState('');
  const [appliedPoint, setAppliedPoint] = useState(0);
  const [pointError, setPointError] = useState('');

  // 최종 금액 계산
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const finalPrice = Math.max(totalPrice - couponDiscount - appliedPoint, 0);

  // 포인트 잔액 로드
  useEffect(() => {
    if (!user) return;
    fetch(`/api/points?userId=${user.uid}`)
      .then((r) => r.json())
      .then((data) => setUserPoints(data.total ?? 0))
      .catch(() => {});
  }, [user]);

  // 쿠폰 관련
  const handleApplyCoupon = async () => {
    if (!user) { setCouponError('쿠폰을 사용하려면 로그인이 필요합니다.'); return; }
    if (!couponCode.trim()) { setCouponError('쿠폰 코드를 입력해주세요.'); return; }
    setCouponLoading(true); setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), userId: user.uid, orderAmount: totalPrice }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error || '쿠폰 적용 실패'); setAppliedCoupon(null); }
      else { setAppliedCoupon({ id: data.coupon.id, code: data.coupon.code, name: data.coupon.name, discount: data.discount }); setCouponError(''); }
    } catch { setCouponError('쿠폰 확인 중 오류가 발생했습니다.'); }
    finally { setCouponLoading(false); }
  };
  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponCode(''); setCouponError(''); };

  // 포인트 관련
  const handleApplyPoint = () => {
    if (!user) { setPointError('로그인이 필요합니다.'); return; }
    const val = Number(usePointInput);
    if (!val || val <= 0) { setPointError('사용할 포인트를 입력해주세요.'); return; }
    if (val > userPoints) { setPointError(`보유 포인트(${userPoints.toLocaleString()}P)를 초과합니다.`); return; }
    const maxUsable = totalPrice - couponDiscount - 1;
    if (val > maxUsable) { setPointError(`최대 ${maxUsable.toLocaleString()}P까지 사용 가능합니다.`); return; }
    setAppliedPoint(val); setPointError('');
  };
  const handleUseAllPoint = () => {
    const max = Math.min(userPoints, totalPrice - couponDiscount - 1);
    setUsePointInput(String(max));
  };
  const handleRemovePoint = () => { setAppliedPoint(0); setUsePointInput(''); setPointError(''); };

  // 결제
  const handlePayment = async () => {
    if (!orderInfo.customerName || !orderInfo.address) {
      alert('배송을 위해 이름과 주소를 정확히 입력해주세요.'); return;
    }
    try {
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const orderId = `ORDER_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`;
      const orderName = items.length > 1 ? `${items[0].name} 외 ${items.length - 1}건` : items[0].name;

      if (appliedCoupon) {
        await fetch(`/api/coupons/${appliedCoupon.id}/use`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
      }

      // 포인트 사용 처리
      if (appliedPoint > 0 && user) {
        await fetch('/api/points', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid, type: 'use', amount: appliedPoint,
            reason: `주문 포인트 사용 (주문번호: ${orderId})`, orderId,
          }),
        });
      }

      await tossPayments.requestPayment('카드', {
        amount: finalPrice, orderId, orderName,
        customerName: orderInfo.customerName,
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
      });
    } catch (error) {
      console.error('결제 모듈 로드 실패:', error);
      alert('결제 모듈을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-deep-navy mb-4">장바구니가 비어있습니다.</h2>
        <p className="text-gray-500 mb-8">진성네이처푸드의 프리미엄 건어물을 만나보세요.</p>
        <Link href="/products" className="bg-premium-gold text-deep-navy px-8 py-3 rounded font-bold hover:bg-gold-light transition">상품 보러가기</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-extrabold text-deep-navy mb-10 border-b border-gray-200 pb-6">주문서 작성</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* 상품 목록 */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-deep-navy mb-4">주문 상품</h2>
            <ul className="divide-y divide-gray-100">
              {items.map((item) => (
                <li key={item.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded bg-gray-100" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">수량: {item.quantity}개</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-deep-navy">{(item.price * item.quantity).toLocaleString()}원</span>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 transition"><Trash2 size={20} /></button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* 쿠폰 입력 */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-deep-navy mb-4 flex items-center gap-2">
              <Tag size={20} className="text-[#c59f59]" /> 쿠폰 적용
            </h2>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-500 shrink-0" />
                  <div>
                    <p className="font-bold text-green-700">{appliedCoupon.name}</p>
                    <p className="text-sm text-green-600">-{appliedCoupon.discount.toLocaleString()}원 할인 적용</p>
                  </div>
                </div>
                <button onClick={handleRemoveCoupon} className="text-sm text-red-400 hover:text-red-600 font-medium">제거</button>
              </div>
            ) : (
              <div className="flex gap-3">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="쿠폰 코드 입력 (예: WELCOME10)"
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#c59f59] outline-none" />
                <button onClick={handleApplyCoupon} disabled={couponLoading}
                  className="bg-[#c59f59] hover:bg-[#b08d4a] text-white font-bold px-6 py-2.5 rounded-md text-sm disabled:opacity-60">
                  {couponLoading ? '확인 중...' : '적용'}
                </button>
              </div>
            )}
            {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
            {!user && <p className="text-gray-400 text-xs mt-2">* 쿠폰을 사용하려면 로그인이 필요합니다.</p>}
          </section>

          {/* 포인트 사용 */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-deep-navy mb-1 flex items-center gap-2">
              <Star size={20} className="text-amber-400 fill-amber-300" /> 포인트 사용
            </h2>
            {user ? (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  보유 포인트: <strong className="text-amber-600">{userPoints.toLocaleString()}P</strong>
                  {appliedPoint === 0 && userPoints > 0 && (
                    <span className="text-gray-400 text-xs ml-2">(1P = 1원)</span>
                  )}
                </p>
                {appliedPoint > 0 ? (
                  <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Star size={20} className="text-amber-500 fill-amber-400 shrink-0" />
                      <div>
                        <p className="font-bold text-amber-700">포인트 사용됨</p>
                        <p className="text-sm text-amber-600">-{appliedPoint.toLocaleString()}P 사용 ({appliedPoint.toLocaleString()}원 할인)</p>
                      </div>
                    </div>
                    <button onClick={handleRemovePoint} className="text-sm text-red-400 hover:text-red-600 font-medium">제거</button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <input type="number" value={usePointInput} onChange={(e) => setUsePointInput(e.target.value)}
                      placeholder={`최대 ${Math.min(userPoints, totalPrice - couponDiscount - 1).toLocaleString()}P`}
                      className="flex-1 border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none" />
                    <button onClick={handleUseAllPoint}
                      className="border border-amber-400 text-amber-600 font-bold px-4 py-2.5 rounded-md text-sm hover:bg-amber-50">
                      전체 사용
                    </button>
                    <button onClick={handleApplyPoint}
                      className="bg-amber-400 hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-md text-sm transition-colors">
                      적용
                    </button>
                  </div>
                )}
                {pointError && <p className="text-red-500 text-sm mt-2">{pointError}</p>}
                <p className="text-xs text-gray-400 mt-2">* 이번 주문 완료 후 결제금액의 1%가 추가 적립됩니다.</p>
              </>
            ) : (
              <p className="text-gray-400 text-sm">* 포인트를 사용하려면 <Link href="/auth" className="text-[#c59f59] underline">로그인</Link>이 필요합니다.</p>
            )}
          </section>

          {/* 배송지 정보 */}
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-deep-navy mb-4">배송지 정보</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">받으시는 분</label>
                <input type="text" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#c59f59] p-2 border outline-none"
                  placeholder="홍길동" value={orderInfo.customerName}
                  onChange={(e) => setOrderInfo({ ...orderInfo, customerName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">배송지 주소</label>
                <input type="text" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#c59f59] p-2 border outline-none"
                  placeholder="서울특별시 송파구 가락동..." value={orderInfo.address}
                  onChange={(e) => setOrderInfo({ ...orderInfo, address: e.target.value })} />
              </div>
            </div>
          </section>
        </div>

        {/* 결제 요약 */}
        <div className="lg:col-span-1">
          <div className="bg-navy-light text-white p-6 rounded-lg shadow-md sticky top-28">
            <h2 className="text-xl font-bold text-premium-gold mb-6">결제 금액</h2>
            <div className="space-y-3 mb-6 text-gray-300 border-b border-gray-600 pb-6">
              <div className="flex justify-between">
                <span>총 상품금액</span><span>{totalPrice.toLocaleString()}원</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-400">
                  <span className="flex items-center gap-1"><Tag size={14} /> 쿠폰 할인</span>
                  <span>-{couponDiscount.toLocaleString()}원</span>
                </div>
              )}
              {appliedPoint > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span className="flex items-center gap-1"><Star size={14} className="fill-amber-300" /> 포인트 사용</span>
                  <span>-{appliedPoint.toLocaleString()}P</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>배송비 (가락시장 직배송)</span><span>무료</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4 text-xl font-bold">
              <span>총 결제금액</span>
              <span className="text-premium-gold">{finalPrice.toLocaleString()}원</span>
            </div>

            {/* 이번 주문 예상 적립 포인트 */}
            {user && (
              <div className="flex justify-between items-center text-xs text-amber-400 mb-6 bg-amber-900/20 rounded-lg px-3 py-2">
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-amber-300" /> 결제 완료 후 적립
                </span>
                <span>+{Math.floor(finalPrice * 0.01).toLocaleString()}P</span>
              </div>
            )}

            {(appliedCoupon || appliedPoint > 0) && (
              <div className="mb-4 text-center text-green-400 text-sm font-bold bg-green-900/20 rounded-lg py-2">
                🎉 총 {(couponDiscount + appliedPoint).toLocaleString()}원 절약!
              </div>
            )}
            <button onClick={handlePayment}
              className="w-full bg-premium-gold text-deep-navy py-4 rounded-md font-extrabold hover:bg-gold-light transition-colors flex justify-center items-center gap-2">
              <CreditCard size={20} /> 결제하기
            </button>
            <p className="text-xs text-gray-400 text-center mt-4">안전한 토스페이먼츠 결제 시스템을 사용합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
