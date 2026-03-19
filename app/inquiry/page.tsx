'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import AuthControls from '@/components/AuthControls';

interface InquiryItem {
  id: string;
  name: string;
  category: string;
  title: string;
  status: 'pending' | 'answered';
  createdAt: string;
  isPrivate: boolean;
  userId?: string;
}

interface InquiryDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  title: string;
  content: string;
  status: 'pending' | 'answered';
  answer?: string;
  answeredAt?: string;
  createdAt: string;
  isPrivate: boolean;
  userId?: string;
}

const CATEGORIES = ['대량구매 문의', '상품 문의', '배송 문의', '환불/교환 문의', '기타 문의'];

export default function InquiryPage() {
  const { user, openAuthModal } = useAuthStore();
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [selected, setSelected] = useState<InquiryDetail | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: CATEGORIES[0],
    title: '',
    content: '',
    isPrivate: false,
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        name: user.displayName || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inquiries');
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInquiries(); }, []);

  const handleRowClick = async (inq: InquiryItem) => {
    if (inq.isPrivate && user?.uid !== inq.userId) {
      alert('비공개 문의는 작성자 본인만 확인할 수 있습니다.');
      return;
    }
    const res = await fetch(`/api/inquiries/${inq.id}`);
    const data = await res.json();
    setSelected(data.inquiry);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, userId: user.uid }),
      });
      if (res.ok) {
        setSuccessMsg('문의가 성공적으로 등록되었습니다! 빠른 시일 내에 답변 드리겠습니다. 🙏');
        setShowForm(false);
        setForm({ name: user.displayName || '', email: user.email || '', phone: '', category: CATEGORIES[0], title: '', content: '', isPrivate: false });
        fetchInquiries();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <div className="min-h-screen bg-[#021127]">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#c59f59]/10 bg-[#021127]/80 backdrop-blur-md px-6 md:px-20 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#c59f59]">
            <span className="material-symbols-outlined text-3xl">waves</span>
            <span className="text-xl font-extrabold tracking-tighter uppercase">Jinsung Nature Food</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="p-2 hover:bg-[#c59f59]/10 rounded-full transition-colors text-slate-100">
              <span className="material-symbols-outlined">shopping_bag</span>
            </Link>
            <AuthControls />
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Page Title */}
        <div className="mb-12 text-center">
          <p className="text-[#c59f59] font-semibold flex items-center gap-2 justify-center mb-2 uppercase tracking-widest text-sm">
            <span className="w-8 h-[1px] bg-[#c59f59]" />
            Customer Service
            <span className="w-8 h-[1px] bg-[#c59f59]" />
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-white">문의 게시판</h1>
          <p className="text-slate-400 mt-4 max-w-lg mx-auto">대량구매, 상품, 배송에 대해 궁금한 점을 남겨주시면 신속하게 답변해 드립니다.</p>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 text-center">
            {successMsg}
            <button onClick={() => setSuccessMsg('')} className="ml-3 text-green-300 hover:text-white">✕</button>
          </div>
        )}

        {/* Detail View */}
        {selected ? (
          <div className="bg-[#031a3a] border border-[#c59f59]/20 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#c59f59]/10">
              <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-slate-400 hover:text-[#c59f59] transition-colors mb-4 text-sm">
                <span className="material-symbols-outlined text-lg">arrow_back</span> 목록으로
              </button>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-[#c59f59]/20 text-[#c59f59] text-xs font-bold px-3 py-1 rounded-full">{selected.category}</span>
                {selected.status === 'answered' ? (
                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">답변완료</span>
                ) : (
                  <span className="bg-slate-700 text-slate-400 text-xs font-bold px-3 py-1 rounded-full">답변대기</span>
                )}
                {selected.isPrivate && <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">🔒 비공개</span>}
              </div>
              <h2 className="text-xl font-bold text-white mt-2">{selected.title}</h2>
              <p className="text-slate-500 text-sm mt-1">{selected.name} · {formatDate(selected.createdAt)}</p>
            </div>
            <div className="p-6 border-b border-[#c59f59]/10">
              <p className="text-slate-300 whitespace-pre-line leading-relaxed">{selected.content}</p>
            </div>
            {selected.answer && (
              <div className="p-6 bg-[#021127]/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[#c59f59] text-xl">support_agent</span>
                  <span className="text-[#c59f59] font-bold">관리자 답변</span>
                  <span className="text-slate-500 text-xs ml-auto">{selected.answeredAt ? formatDate(selected.answeredAt) : ''}</span>
                </div>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">{selected.answer}</p>
              </div>
            )}
          </div>
        ) : showForm ? (
          /* Write Form */
          <div className="bg-[#031a3a] border border-[#c59f59]/20 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#c59f59]/10 flex items-center justify-between">
              <h2 className="text-white font-bold text-xl">문의 작성</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">이름 *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#021127] border border-[#c59f59]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c59f59] transition-colors"
                    placeholder="이름을 입력해주세요" />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">이메일 *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#021127] border border-[#c59f59]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c59f59] transition-colors"
                    placeholder="답변 받으실 이메일" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-400 text-sm mb-1">연락처</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-[#021127] border border-[#c59f59]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c59f59] transition-colors"
                    placeholder="010-0000-0000" />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-1">문의 유형 *</label>
                  <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#021127] border border-[#c59f59]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c59f59] transition-colors">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">제목 *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#021127] border border-[#c59f59]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c59f59] transition-colors"
                  placeholder="문의 제목을 입력해주세요" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-1">문의 내용 *</label>
                <textarea required rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full bg-[#021127] border border-[#c59f59]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c59f59] transition-colors resize-none"
                  placeholder="문의하실 내용을 자세히 적어주세요.&#10;&#10;예) 대량구매 시 할인율 및 최소 주문 수량이 어떻게 되나요?" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={form.isPrivate} onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
                  className="w-4 h-4 accent-[#c59f59]" />
                <span className="text-slate-400 group-hover:text-slate-200 transition text-sm">🔒 비공개 문의로 등록 (본인만 열람 가능)</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 transition-colors">
                  취소
                </button>
                <button type="submit" disabled={submitting}
                  className="px-8 py-3 rounded-lg bg-[#c59f59] text-[#021127] font-bold hover:bg-[#c59f59]/90 transition-colors disabled:opacity-70">
                  {submitting ? '등록 중...' : '문의 등록'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Board List */
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-slate-400 text-sm">총 <span className="text-[#c59f59] font-bold">{inquiries.length}</span>건의 문의</p>
              <button
                onClick={() => { if (!user) { openAuthModal(); } else { setShowForm(true); } }}
                className="flex items-center gap-2 bg-[#c59f59] hover:bg-[#c59f59]/90 text-[#021127] font-bold px-5 py-2.5 rounded-lg transition-all active:scale-95">
                <span className="material-symbols-outlined text-lg">edit_note</span>
                문의 작성
              </button>
            </div>

            {/* Table */}
            <div className="bg-[#031a3a] border border-[#c59f59]/20 rounded-2xl overflow-hidden">
              <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 border-b border-[#c59f59]/10 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span>제목</span>
                <span className="w-24 text-center">유형</span>
                <span className="w-20 text-center">상태</span>
                <span className="w-24 text-center">등록일</span>
              </div>

              {loading ? (
                <div className="py-16 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
                  <p className="mt-2">목록을 불러오는 중...</p>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="py-20 text-center text-slate-500">
                  <span className="material-symbols-outlined text-5xl mb-3 block text-slate-600">inbox</span>
                  <p className="text-lg font-semibold text-slate-400">아직 등록된 문의가 없습니다.</p>
                  <p className="text-sm mt-1">첫 번째 문의를 남겨보세요!</p>
                </div>
              ) : (
                <ul>
                  {inquiries.map((inq, idx) => (
                    <li key={inq.id}
                      onClick={() => handleRowClick(inq)}
                      className={`grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 md:gap-4 px-6 py-4 cursor-pointer hover:bg-[#c59f59]/5 transition-colors ${idx > 0 ? 'border-t border-[#c59f59]/10' : ''}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        {inq.isPrivate && <span className="text-slate-500 text-sm shrink-0">🔒</span>}
                        <span className="text-slate-200 hover:text-[#c59f59] transition-colors truncate font-medium">{inq.title}</span>
                        <span className="text-slate-500 text-xs shrink-0 hidden md:inline">— {inq.name}</span>
                      </div>
                      <div className="w-24 text-center">
                        <span className="bg-[#c59f59]/10 text-[#c59f59] text-xs px-2 py-0.5 rounded-full">{inq.category}</span>
                      </div>
                      <div className="w-20 text-center">
                        {inq.status === 'answered' ? (
                          <span className="bg-green-500/15 text-green-400 text-xs font-bold px-2.5 py-0.5 rounded-full">답변완료</span>
                        ) : (
                          <span className="bg-slate-700/60 text-slate-400 text-xs px-2.5 py-0.5 rounded-full">대기중</span>
                        )}
                      </div>
                      <div className="w-24 text-center text-slate-500 text-xs">{formatDate(inq.createdAt)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
