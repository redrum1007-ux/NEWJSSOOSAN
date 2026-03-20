'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { CheckCircle, Loader2, Star } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const clearCart = useCartStore((state) => state.clearCart);
  const { user } = useAuthStore();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) {
      setStatus('error');
      return;
    }

    const confirmPayment = async () => {
      try {
        const res = await fetch('/api/payments/success', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // taxFreeAmount는 success URL 쿼리로 전달받아 숫자로 변환
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
            taxFreeAmount: Number(searchParams.get('taxFreeAmount') ?? 0),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          clearCart();

          // ✅ 영수증 URL 저장
          if (data.receiptUrl) setReceiptUrl(data.receiptUrl);

          // ✅ 구매 금액의 1% 포인트 자동 적립
          if (user) {
            const pointsToEarn = Math.floor(Number(amount) * 0.01);
            if (pointsToEarn > 0) {
              try {
                await fetch('/api/points', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user.uid,
                    type: 'earn',
                    amount: pointsToEarn,
                    reason: `주문 적립 (주문번호: ${orderId})`,
                    orderId,
                  }),
                });
                setEarnedPoints(pointsToEarn);
              } catch (e) {
                console.error('포인트 적립 실패:', e);
              }
            }
          }

          setStatus('success');
        } else {
          console.error('Payment API Error Response:', await res.json());
          setStatus('error');
        }
      } catch (e) {
        console.error('Network Error during payment confirmation:', e);
        setStatus('error');
      }
    };

    confirmPayment();
  }, [paymentKey, orderId, amount, clearCart, user]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="animate-spin text-premium-gold mb-6 mx-auto" size={48} />
        <h2 className="text-2xl font-bold text-deep-navy mb-2">결제 승인 중입니다...</h2>
        <p className="text-gray-500">안전한 결제를 위해 잠시만 기다려주세요.</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-red-500 font-bold text-2xl mb-4">결제 승인에 실패했습니다.</p>
        <p className="text-gray-600 mb-8 max-w-sm">결제 과정에서 문제가 발생했거나 검증에 실패했습니다. 장바구니로 돌아가 다시 결제해주세요.</p>
        <Link href="/cart" className="bg-deep-navy text-white px-8 py-3 rounded hover:bg-navy-light transition font-bold shadow-md">
          장바구니로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-10 rounded-xl shadow-md text-center max-w-lg w-full">
      <div className="flex justify-center mb-6">
        <CheckCircle size={64} className="text-green-500" />
      </div>
      <h1 className="text-3xl font-extrabold text-deep-navy mb-4">결제가 완료되었습니다!</h1>
      <p className="text-gray-600 mb-6 leading-relaxed">
        진성네이처푸드를 이용해주셔서 감사합니다.<br />
        자연의 깊이를 담은 프리미엄 건어물을<br />
        빠르고 안전하게 배송해 드리겠습니다.
      </p>

      {/* ✅ 포인트 적립 안내 배너 */}
      {earnedPoints > 0 && (
        <div className="flex items-center justify-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-6 py-4 mb-6">
          <Star size={22} className="text-amber-500 fill-amber-400 shrink-0" />
          <div className="text-left">
            <p className="text-amber-700 font-bold text-sm">포인트가 적립되었습니다! 🎉</p>
            <p className="text-amber-600 text-sm">
              구매 금액의 1% → <strong>{earnedPoints.toLocaleString()}P</strong> 적립 완료
            </p>
          </div>
        </div>
      )}

      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 mb-6 text-sm text-blue-600">
          💡 회원가입 시 구매 금액의 <strong>1% 포인트</strong>가 자동으로 적립됩니다!
        </div>
      )}

      <div className="flex flex-col gap-3 mt-2 border-t border-gray-100 pt-8">
        {receiptUrl && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-center border border-gray-300 text-gray-700 px-6 py-3 rounded hover:bg-gray-50 transition font-medium text-sm"
          >
            🧾 영수증 보기
          </a>
        )}
        <Link href="/" className="bg-deep-navy text-white px-6 py-4 rounded hover:bg-navy-light transition font-bold shadow-sm">
          쇼핑 계속하기
        </Link>
        <Link href="/mypage" className="text-gray-500 hover:text-deep-navy transition text-sm underline mt-2">
          내 포인트 확인하기
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-premium-gold mb-4" size={48} />
          <p className="text-gray-600">결제 정보 확인 중...</p>
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
