'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { Star, TrendingUp, TrendingDown, LogIn } from 'lucide-react';
import Link from 'next/link';
import { PointHistory } from '@/lib/types/point';
import AuthControls from '@/components/AuthControls';

export default function MyPage() {
  const { user, loading } = useAuthStore();
  const [totalPoints, setTotalPoints] = useState(0);
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) { setFetching(false); return; }
    fetch(`/api/points?userId=${user.uid}`)
      .then((r) => r.json())
      .then((data) => {
        setTotalPoints(data.total ?? 0);
        setHistory(data.history ?? []);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || fetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-5xl text-[#c59f59]">progress_activity</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <LogIn size={56} className="text-[#c59f59] mb-4" />
        <h2 className="text-2xl font-bold text-deep-navy mb-2">로그인이 필요합니다.</h2>
        <p className="text-gray-500 mb-8">로그인하면 포인트 잔액과 사용 내역을 확인할 수 있습니다.</p>
        <AuthControls />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-deep-navy mb-8">마이페이지</h1>

      {/* 포인트 잔액 카드 */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0A192F] to-[#112240] text-white p-8 mb-8 shadow-lg flex items-center justify-between">
        <div>
          <p className="text-amber-300 text-sm font-bold mb-1 flex items-center gap-1">
            <Star size={14} className="fill-amber-300" /> MY POINTS
          </p>
          <p className="text-5xl font-extrabold text-amber-400 tracking-tight">
            {totalPoints.toLocaleString()}<span className="text-2xl ml-1">P</span>
          </p>
          <p className="text-gray-400 text-sm mt-2">1P = 1원, 구매 금액의 1% 자동 적립</p>
        </div>
        <div className="text-right">
          <Star size={60} className="text-amber-400/30 fill-amber-400/20" />
        </div>
      </div>

      {/* 포인트 안내 */}
      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        {[
          { label: '적립 기준', value: '구매금액의 1%' },
          { label: '사용 단위', value: '1P = 1원' },
          { label: '사용 방법', value: '장바구니에서 차감' },
        ].map((item) => (
          <div key={item.label} className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs text-amber-600 font-bold mb-1">{item.label}</p>
            <p className="text-sm font-bold text-gray-800">{item.value}</p>
          </div>
        ))}
      </div>

      {/* 포인트 내역 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#0A192F]">포인트 사용 내역</h2>
        </div>
        {history.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Star size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="font-medium">아직 포인트 내역이 없습니다.</p>
            <p className="text-sm mt-1">구매 후 포인트가 자동 적립됩니다!</p>
            <Link href="/products" className="mt-6 inline-block bg-[#c59f59] text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-[#b08d4a] transition">
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  {h.type === 'earn' ? (
                    <TrendingUp size={20} className="text-green-500 shrink-0" />
                  ) : (
                    <TrendingDown size={20} className="text-red-400 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">{h.reason}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(h.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className={`font-bold text-base ${h.type === 'earn' ? 'text-green-600' : 'text-red-400'}`}>
                  {h.type === 'earn' ? '+' : '-'}{h.amount.toLocaleString()}P
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
