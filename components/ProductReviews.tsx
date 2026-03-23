'use client';

import { useState, useEffect } from 'react';
import { Review } from '@/lib/types/review';
import { useAuthStore } from '@/store/useAuthStore';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReviewText, setNewReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthStore();
  
  // 간단한 관리자 판별 (이메일 도메인 또는 특정 메일). 실제론 백엔드 클레임이 안전합니다.
  const isAdmin = user?.email === 'admin@jinsungsoosan.co.kr' || user?.email === 'redrum1007@지메일등' || false; 
  // TODO: 실제 어드민 구분을 위해 수정할 수 있음. 일단은 인증된 유저 중 누구나 달 수 있게 허용하되 식별

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.reviews) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error('Failed to fetch reviews', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId: user?.uid || null,
          userName: user?.displayName || user?.email?.split('@')[0] || '익명 고객',
          content: newReviewText,
          rating: 5,
          isAdminReview: isAdmin,
        }),
      });
      if (res.ok) {
        setNewReviewText('');
        fetchReviews();
      }
    } catch (error) {
      console.error('Failed to post review', error);
      alert('리뷰 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('이 리뷰를 정말 삭제하시겠습니까?')) return;
    
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchReviews();
      } else {
        alert('리뷰 삭제 권한이 없거나 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to delete review', error);
    }
  };

  return (
    <div className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-2xl font-bold text-[#0A192F] mb-6">상품 후기 ({reviews.length})</h3>

      {/* 후기 리스트 */}
      <div className="space-y-6 mb-10">
        {loading ? (
          <div className="text-center text-gray-400 py-4">불러오는 중...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-gray-400 py-8 border border-dashed rounded-xl">
            첫 번째 소중한 후기를 남겨주세요!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-[#0A192F]">{review.userName}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                    {review.isAdminReview && (
                      <span className="bg-[#c59f59] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">관리자 댓글</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">{review.content}</p>
                </div>
                
                {/* 현재 접속자가 어드민이거나 글 작성자 본인일 때 삭제 버튼 노출 */}
                {(isAdmin || (user && review.userId === user.uid)) && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-xs text-red-400 hover:text-red-500 hover:underline flex-shrink-0"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 후기 작성 폼 */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <h4 className="font-bold text-[#0A192F] mb-3 text-sm">후기 남기기</h4>
        {!user && (
          <div className="text-sm text-amber-600 mb-3 bg-amber-50 p-2 rounded-lg border border-amber-200">
            비회원(로그인하지 않음)으로 등록할 경우 '익명 고객'으로 표시되며, 추후 본인이 수정/삭제할 수 없습니다.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <textarea
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            placeholder="상품에 대한 솔직한 후기를 남겨주세요!"
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#c59f59] outline-none resize-none mb-3"
          />
          <div className="flex justify-between items-center">
            {isAdmin && (
              <label className="text-xs text-gray-500 font-bold flex items-center gap-1 cursor-pointer">
                {/* 관리자라면 체크박스를 통해 '관리자 댓글'로 달 수 있게 처리할 수 있음. 일단 UI 구조상 주석처리 혹은 숨김 */}
              </label>
            )}
            <button
              type="submit"
              disabled={submitting || !newReviewText.trim()}
              className="bg-[#c59f59] text-white font-bold px-6 py-2.5 rounded-lg text-sm hover:bg-[#b08c4a] transition-all disabled:opacity-50 ml-auto"
            >
              {submitting ? '등록 중...' : '후기 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
