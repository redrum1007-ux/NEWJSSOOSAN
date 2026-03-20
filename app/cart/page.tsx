'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { Trash2, CreditCard, Tag, CheckCircle, Star, Ticket } from 'lucide-react';
import Link from 'next/link';
import { Coupon } from '@/lib/types/coupon';
import { TAX_FREE_CATEGORIES } from '@/lib/constants';

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

  const [orderInfo, setOrderInfo] = useState({ customerName: '', customerEmail: '', phone: '', address: '' });

  // 쿠폰 상태
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [userCoupons, setUserCoupons] = useState<Coupon[]>([]);

  // 포인트 상태
  const [userPoints, setUserPoints] = useState(0);
  const [usePointInput, setUsePointInput] = useState('');
  const [appliedPoint, setAppliedPoint] = useState(0);
  const [pointError, setPointError] = useState('');

  // 최종 금액 계산
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const finalPrice = Math.max(totalPrice - couponDiscount - appliedPoint, 0);

  // 포인트 및 쿠폰 로드
  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`/api/points?userId=${user.uid}`).then((r) => r.json()),
      fetch(`/api/coupons?userId=${user.uid}`).then((r) => r.json())
    ])
    .then(([pointData, couponData]) => {
      setUserPoints(pointData.total ?? 0);
      if (couponData.coupons) {
        setUserCoupons(couponData.coupons.filter((c: Coupon) => !c.used && new Date(c.expiresAt) > new Date()));
      }
    })
    .catch(() => {});
  }, [user]);

  // 쿠폰 관련
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!user) { setCouponError('쿠폰을 사용하려면 로그인이 필요합니다.'); return; }
    if (!code.trim()) { setCouponError('쿠폰 코드를 입력해주세요.'); return; }
    setCouponLoading(true); setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim().toUpperCase(), userId: user.uid, orderAmount: totalPrice }),
      });
      const data = await res.json();
      if (!res.ok) { setCouponError(data.error || '쿠폰 적용 실패'); setAppliedCoupon(null); setCouponCode(''); }
      else { setAppliedCoupon({ id: data.coupon.id, code: data.coupon.code, name: data.coupon.name, discount: data.discount }); setCouponError(''); setCouponCode(code); }
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
    if (!orderInfo.customerName || !orderInfo.address || !orderInfo.phone) {
      alert('배송을 위해 이름, 연락처, 주소를 정확히 입력해주세요.'); return;
    }
    try {
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      const orderId = `ORDER_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`;
      const orderName = items.length > 1 ? `${items[0].name} 외 ${items.length - 1}건` : items[0].name;

      // ✅ 면세 금액 산정: 1차 수산물 / 건어물 카테고리만 합산
      const taxFreeItemsTotal = items.reduce((sum, item) => {
        const isTaxFree =
          item.taxFree === true ||
          (item.category && TAX_FREE_CATEGORIES.includes(item.category));
        return isTaxFree ? sum + item.price * item.quantity : sum;
      }, 0);

      // 할인이 적용된 만큼 taxFreeAmount도 비례 감소
      const discountRatio = totalPrice > 0 ? finalPrice / totalPrice : 1;
      const taxFreeAmount = Math.floor(taxFreeItemsTotal * discountRatio);

      // 테스트 시 파라미터 확인용 콘솔로그
      console.log('💳 [토스 결제 파라미터 확인]', {
        orderId,
        amount: finalPrice,
        taxFreeAmount,
        taxableAmount: finalPrice - taxFreeAmount,
        orderName,
        items: items.map(i => ({ name: i.name, price: i.price, qty: i.quantity, category: i.category, taxFree: i.taxFree })),
      });

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
        amount: finalPrice,
        orderId,
        orderName,
        customerName: orderInfo.customerName,
        taxFreeAmount, // ✅ 면세금액 파라미터 추가
        successUrl: `${window.location.origin}/success?taxFreeAmount=${taxFreeAmount}`,
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
              <Tag size={20} className="text-[#c59f59]" /> 쿠폰 활용
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
                <button onClick={handleRemoveCoupon} className="text-sm text-red-400 hover:text-red-600 font-medium whitespace-nowrap px-2">취소</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 border border-[#c59f59]/30 rounded-lg p-4 bg-amber-50/30">
                {user && userCoupons.length > 0 && (
                  <div className="mb-2">
                    <label className="block text-sm font-bold text-[#0A192F] mb-2 flex items-center gap-1.5">
                      <Ticket size={16} className="text-[#c59f59]" /> 보유 쿠폰 목록에서 선택
                    </label>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val) handleApplyCoupon(val);
                      }}
                      className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-[#c59f59] outline-none bg-white font-medium cursor-pointer"
                      disabled={couponLoading}
                      value={couponCode}
                    >
                      <option value="">보유하신 쿠폰을 선택하세요 ({userCoupons.length}장 사용 가능)</option>
                      {userCoupons.map((c) => {
                        const isUsable = totalPrice >= c.minOrderAmount;
                        const text = isUsable 
                          ? `${c.name} (${c.type === 'percent' ? c.value + '% 할인' : c.value.toLocaleString() + '원 할인'})`
                          : `${c.name} (최소주문미달: ${c.minOrderAmount.toLocaleString()}원 이상 조건)`;
                        return (
                          <option key={c.id} value={isUsable ? c.code : ''} disabled={!isUsable}>
                            {text}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                
                <div className="relative pt-1">
                  {user && userCoupons.length > 0 && (
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-50 px-3 text-xs text-[#c59f59] font-bold rounded-full">또는 직접 입력</div>
                  )}
                  <div className="flex gap-3">
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon(couponCode)}
                      placeholder="쿠폰 코드 직접 입력 (예: WELCOME10)"
                      className="flex-1 border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#c59f59] outline-none" />
                    <button onClick={() => handleApplyCoupon(couponCode)} disabled={couponLoading}
                      className="bg-[#c59f59] w-24 hover:bg-[#b08d4a] text-white font-bold px-6 py-2.5 rounded-md text-sm disabled:opacity-60 transition-colors whitespace-nowrap">
                      {couponLoading ? '확인 중' : '적용'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {couponError && <p className="text-red-500 text-sm mt-3 font-medium bg-red-50 p-2 rounded">{couponError}</p>}
            {!user && <p className="text-gray-400 text-xs mt-3">* 쿠폰을 사용하려면 로그인이 필요합니다.</p>}
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
                      className="flex-1 border border-gray-300 rounded-md px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-amber-400 outline-none" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">받으시는 분 <span className="text-red-400">*</span></label>
                <input type="text" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#c59f59] p-2 border outline-none text-gray-900"
                  placeholder="홍길동" value={orderInfo.customerName}
                  onChange={(e) => setOrderInfo({ ...orderInfo, customerName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처 <span className="text-red-400">*</span></label>
                <input type="tel" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#c59f59] p-2 border outline-none text-gray-900"
                  placeholder="010-0000-0000 (배송 문의 연락처)" value={orderInfo.phone}
                  onChange={(e) => setOrderInfo({ ...orderInfo, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">배송지 주소 <span className="text-red-400">*</span></label>
                <input type="text" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#c59f59] p-2 border outline-none text-gray-900"
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
