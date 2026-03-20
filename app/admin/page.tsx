'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { products as initialProducts, Product } from '@/lib/products';
import { Order, OrderStatus } from '@/lib/types/order';
import { Notice } from '@/lib/types/notice';
import { CouponTemplate, Coupon } from '@/lib/types/coupon';
import { UserPoint, PointHistory } from '@/lib/types/point';
import { Slide } from '@/lib/types/slide';
import { PRODUCT_CATEGORIES } from '@/lib/constants';

// Quill을 SSR 없이 동적 로드
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

type Tab = 'list' | 'register' | 'manage' | 'orders' | 'notices' | 'coupons' | 'points' | 'slides' | 'stats';

interface ProductFormData {
  id?: string;
  name: string;
  category: string;
  description: string;
  price: string;
  image: File | null;
  imagePreview: string;
  tag: string;
}

const CATEGORIES = PRODUCT_CATEGORIES;

const ORDER_STATUS_MAP: Record<OrderStatus, { label: string; color: string }> = {
  pending:   { label: '결제대기', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '주문확인', color: 'bg-blue-100 text-blue-700' },
  shipping:  { label: '배송중',   color: 'bg-purple-100 text-purple-700' },
  delivered: { label: '배송완료', color: 'bg-green-100 text-green-700' },
  cancelled: { label: '취소됨',   color: 'bg-red-100 text-red-700' },
};

const PREMIUM_TEMPLATE = `
<div style="background-color: #0A192F; color: white; padding: 60px 20px; font-family: 'Noto Serif KR', serif; text-align: center; border-radius: 12px; overflow: hidden;">
  <div style="border: 1px solid rgba(197, 159, 89, 0.5); padding: 40px 20px; max-width: 700px; margin: 0 auto; position: relative;">
    <div style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: #0A192F; padding: 0 20px;">
      <span style="color: #c59f59; font-size: 24px;">🏆</span>
    </div>
    <h2 style="color: #c59f59; font-size: 28px; font-weight: 700; margin-bottom: 25px; line-height: 1.4;">
      가락시장 40년의 자존심.<br/>깐깐한 고집으로 완성한<br/>명품 건어물, 진성수산.
    </h2>
    <div style="width: 60px; height: 2px; background: #c59f59; margin: 0 auto 25px;"></div>
    <p style="font-size: 16px; line-height: 1.8; opacity: 0.9; word-break: keep-all;">
      온라인 먹거리 구매, 또 실패하셨나요?<br/>싼 게 비지떡입니다. 가장 중요한 것은 양이나 가격이 아닌 '값어치'를 하는 품질입니다.
    </p>
  </div>
  <div style="margin-top: 80px; display: flex; align-items: center; justify-content: center; gap: 30px; flex-wrap: wrap;">
    <div style="font-size: 120px; font-weight: 900; color: transparent; -webkit-text-stroke: 1px #c59f59; line-height: 1;">40</div>
    <div style="text-align: left;">
      <h3 style="font-size: 22px; color: #c59f59; font-weight: 700; margin-bottom: 10px;">국내 최대 규모 가락시장,<br/>40년 전통 실점포.</h3>
      <p style="font-size: 14px; opacity: 0.7; line-height: 1.6;">수많은 풍파 속에서도 굳건히 자리를 지켜온<br/>신뢰의 이름입니다.</p>
    </div>
  </div>
  <div style="margin-top: 80px; padding: 40px; background: rgba(255,255,255,0.03); border-left: 4px solid #c59f59; text-align: left; max-width: 800px; margin-left: auto; margin-right: auto;">
    <span style="font-size: 40px; color: #c59f59; font-family: serif;">"</span>
    <p style="font-size: 18px; font-weight: 500; line-height: 1.8; margin-bottom: 20px; margin-top: -10px;">
      50년 건어물 외길 명인의 철학.<br/>
      <strong>"팔아서 욕먹을 물건은 안 팝니다. 제가 먹어도 맛있고 좋은 것만 팔아야 단골이 되죠."</strong>
    </p>
    <p style="text-align: right; color: #c59f59; font-weight: bold;">— 진성수산 대표 —</p>
  </div>
  <div style="margin-top: 80px; text-align: center;">
    <div style="display: inline-block; padding: 20px; border: 2px solid #c59f59; border-radius: 50%; margin-bottom: 20px;">
       <span style="color: #c59f59; font-weight: bold; font-size: 20px;">진성</span>
    </div>
    <h3 style="font-size: 22px; font-weight: 700; color: #c59f59;">제값을 하는 진짜 명품 건어물.</h3>
    <p style="font-size: 16px; margin-top: 10px; opacity: 0.9;">한번 드시면 또다시 찾게 되는<br/>진성수산의 단골이 되어주세요.</p>
  </div>
</div>
`;

// ─── 주문 관리 컴포넌트 ───────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

  const fetchOrders = async () => {
    setLoading(true);
    const res = await fetch('/api/orders', { cache: 'no-store' });
    const data = await res.json();
    setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
    if (selectedOrder?.id === id) {
      setSelectedOrder((prev) => prev ? { ...prev, status } : null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 주문을 삭제하시겠습니까?')) return;
    await fetch(`/api/orders/${id}`, { method: 'DELETE' });
    setSelectedOrder(null);
    fetchOrders();
  };

  const filtered = statusFilter === 'all'
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#0A192F]">주문 관리</h2>
        <button onClick={fetchOrders} className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1">
          <span className="material-symbols-outlined text-base">refresh</span> 새로고침
        </button>
      </div>

      {/* 상태 필터 */}
      <div className="flex gap-2 flex-wrap mb-6">
        {([['all', '전체'], ['pending', '결제대기'], ['confirmed', '주문확인'], ['shipping', '배송중'], ['delivered', '배송완료'], ['cancelled', '취소됨']] as [string, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key as OrderStatus | 'all')}
            className={`text-xs px-3 py-1.5 rounded-full border font-bold transition-all ${
              statusFilter === key
                ? 'bg-[#0A192F] text-white border-[#0A192F]'
                : 'bg-white text-gray-600 border-gray-300 hover:border-[#0A192F]'
            }`}
          >
            {label} ({counts[key] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-gray-400">progress_activity</span></div>
      ) : (
        <div className="flex gap-6">
          {/* 주문 목록 */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">주문번호</th>
                    <th className="px-4 py-3">주문자</th>
                    <th className="px-4 py-3">금액</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">일시</th>
                    <th className="px-4 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="py-16 text-center text-gray-400">주문이 없습니다.</td></tr>
                  )}
                  {filtered.map((order) => {
                    const st = ORDER_STATUS_MAP[order.status];
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`cursor-pointer hover:bg-blue-50 transition-colors ${selectedOrder?.id === order.id ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{order.id}</td>
                        <td className="px-4 py-3 font-bold text-[#0A192F]">{order.customerName}</td>
                        <td className="px-4 py-3 font-bold">{order.totalPrice.toLocaleString()}원</td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${st.color}`}>{st.label}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                            className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-2 py-1 rounded transition-all"
                          >삭제</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 주문 상세 패널 */}
          {selectedOrder && (
            <div className="w-72 bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#0A192F] text-sm">주문 상세</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div><p className="text-xs text-gray-400">주문번호</p><p className="font-mono text-xs">{selectedOrder.id}</p></div>
                <div><p className="text-xs text-gray-400">주문자</p><p className="font-bold">{selectedOrder.customerName}</p></div>
                <div><p className="text-xs text-gray-400">연락처</p><p>{selectedOrder.customerPhone}</p></div>
                <div><p className="text-xs text-gray-400">이메일</p><p className="truncate">{selectedOrder.customerEmail}</p></div>
                <div><p className="text-xs text-gray-400">배송지</p><p className="text-xs leading-relaxed">{selectedOrder.address}</p></div>
                {selectedOrder.memo && (
                  <div><p className="text-xs text-gray-400">메모</p><p className="text-xs">{selectedOrder.memo}</p></div>
                )}
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400 mb-2">주문 상품</p>
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-gray-50">
                      <span className="flex-1">{item.name} × {item.quantity}</span>
                      <span className="font-bold ml-2">{(item.price * item.quantity).toLocaleString()}원</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-[#0A192F] mt-2">
                    <span>합계</span><span>{selectedOrder.totalPrice.toLocaleString()}원</span>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400 mb-2">배송 상태 변경</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0A192F] outline-none"
                  >
                    {(Object.entries(ORDER_STATUS_MAP) as [OrderStatus, {label: string}][]).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 공지 관리 컴포넌트 ───────────────────────────────────────────────────────
function NoticesTab() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', pinned: false });
  const [saving, setSaving] = useState(false);

  const fetchNotices = async () => {
    setLoading(true);
    const res = await fetch('/api/notices');
    const data = await res.json();
    setNotices(data.notices);
    setLoading(false);
  };

  useEffect(() => { fetchNotices(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', content: '', pinned: false });
    setShowForm(true);
  };

  const openEdit = (notice: Notice) => {
    setEditing(notice);
    setForm({ title: notice.title, content: notice.content, pinned: notice.pinned });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.content) { alert('제목과 내용을 입력해주세요.'); return; }
    setSaving(true);
    if (editing) {
      await fetch(`/api/notices/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } else {
      await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    setShowForm(false);
    fetchNotices();
  };

  const handleTogglePin = async (notice: Notice) => {
    await fetch(`/api/notices/${notice.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pinned: !notice.pinned }),
    });
    fetchNotices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 공지를 삭제하시겠습니까?')) return;
    await fetch(`/api/notices/${id}`, { method: 'DELETE' });
    fetchNotices();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#0A192F]">공지 관리</h2>
        <button
          onClick={openCreate}
          className="bg-[#0A192F] hover:bg-[#112240] text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          공지 작성
        </button>
      </div>

      {/* 작성/수정 폼 */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-[#0A192F]/20 p-6 mb-6">
          <h3 className="font-bold text-[#0A192F] mb-4">{editing ? '공지 수정' : '새 공지 작성'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">제목 <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="공지 제목을 입력하세요"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A192F] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">내용 <span className="text-red-500">*</span></label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="공지 내용을 입력하세요"
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0A192F] outline-none resize-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                className="w-4 h-4 accent-[#0A192F]"
              />
              <span className="text-sm font-medium text-gray-700">📌 상단 고정</span>
            </label>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#0A192F] hover:bg-[#112240] text-white font-bold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 transition-all"
              >
                {saving ? '저장 중...' : (editing ? '수정 완료' : '등록')}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2.5 rounded-lg text-sm transition-all"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공지 목록 */}
      {loading ? (
        <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-gray-400">progress_activity</span></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {notices.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <span className="material-symbols-outlined text-5xl mb-3 block">campaign</span>
              <p>등록된 공지가 없습니다.</p>
            </div>
          )}
          {notices.map((notice) => (
            <div key={notice.id} className="border-b border-gray-100 last:border-0 px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {notice.pinned && (
                      <span className="text-[10px] font-bold bg-[#c59f59] text-white px-2 py-0.5 rounded-full">📌 고정</span>
                    )}
                    <h4 className="font-bold text-[#0A192F] text-sm truncate">{notice.title}</h4>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-1">{notice.content}</p>
                  <p className="text-[11px] text-gray-400">
                    {notice.author} · {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                    {notice.updatedAt !== notice.createdAt && ' (수정됨)'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleTogglePin(notice)}
                    title={notice.pinned ? '고정 해제' : '상단 고정'}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-all ${
                      notice.pinned
                        ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100'
                        : 'border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-600'
                    }`}
                  >
                    📌
                  </button>
                  <button
                    onClick={() => openEdit(notice)}
                    className="text-xs text-[#0A192F] border border-[#0A192F] px-3 py-1.5 rounded-md hover:bg-[#0A192F] hover:text-white transition-all"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="text-xs text-red-500 border border-red-300 px-3 py-1.5 rounded-md hover:bg-red-500 hover:text-white transition-all"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 쿠폰 관리 컴포넌트 ──────────────────────────────────────────────────────
function CouponsTab() {
  const [templates, setTemplates] = useState<CouponTemplate[]>([]);
  const [issuedCoupons, setIssuedCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    type: 'percent' as 'percent' | 'fixed',
    value: '',
    minOrderAmount: '0',
    maxDiscount: '',
    triggerEvent: 'signup' as 'signup' | 'manual',
    validDays: '30',
  });

  const fetchAll = async () => {
    setLoading(true);
    const [tmplRes, couponRes] = await Promise.all([
      fetch('/api/coupon-templates'),
      fetch('/api/coupons'),
    ]);
    const tmplData = await tmplRes.json();
    const couponData = await couponRes.json();
    setTemplates(tmplData.templates || []);
    setIssuedCoupons(couponData.coupons || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.name || !form.value) { alert('코드, 이름, 할인값은 필수입니다.'); return; }
    setSaving(true);
    const res = await fetch('/api/coupon-templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        validDays: Number(form.validDays),
      }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error || '오류가 발생했습니다.'); }
    else { setShowForm(false); setForm({ code: '', name: '', type: 'percent', value: '', minOrderAmount: '0', maxDiscount: '', triggerEvent: 'signup', validDays: '30' }); fetchAll(); }
    setSaving(false);
  };

  const handleToggle = async (tmpl: CouponTemplate) => {
    await fetch(`/api/coupon-templates/${tmpl.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !tmpl.isActive }),
    });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 쿠폰 템플릿을 삭제할까요?')) return;
    await fetch(`/api/coupon-templates/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#0A192F]">쿠폰 관리</h2>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="text-sm text-gray-500 border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">refresh</span> 새로고침
          </button>
          <button onClick={() => setShowForm(true)}
            className="bg-[#0A192F] hover:bg-[#112240] text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-base">add</span> 쿠폰 생성
          </button>
        </div>
      </div>

      {/* 쿠폰 생성 폼 */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-[#0A192F]/20 p-6 mb-6">
          <h3 className="font-bold text-[#0A192F] mb-4">새 쿠폰 템플릿 생성</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">쿠폰 코드 *</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="예: WELCOME10" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0A192F] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">쿠폰 이름 *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 신규가입 10% 할인" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0A192F] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">할인 유형</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'percent' | 'fixed' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0A192F] outline-none">
                <option value="percent">퍼센트 (%)</option>
                <option value="fixed">정액 (원)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">할인값 * ({form.type === 'percent' ? '%' : '원'})</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder={form.type === 'percent' ? '예: 10' : '예: 5000'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0A192F] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">최소 주문 금액 (원)</label>
              <input type="number" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0A192F] outline-none" />
            </div>
            {form.type === 'percent' && (
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">최대 할인 금액 (원, 선택)</label>
                <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  placeholder="제한 없으면 비워두세요" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0A192F] outline-none" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">발급 트리거</label>
              <select value={form.triggerEvent} onChange={(e) => setForm({ ...form, triggerEvent: e.target.value as 'signup' | 'manual' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0A192F] outline-none">
                <option value="signup">신규가입 자동 발급</option>
                <option value="manual">수동 발급</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">유효 기간 (일)</label>
              <input type="number" value={form.validDays} onChange={(e) => setForm({ ...form, validDays: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0A192F] outline-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave} disabled={saving}
              className="bg-[#0A192F] hover:bg-[#112240] text-white font-bold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50">{
              saving ? '저장 중...' : '쿠폰 생성'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2.5 rounded-lg text-sm">취소</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><span className="material-symbols-outlined animate-spin text-4xl text-gray-400">progress_activity</span></div>
      ) : (
        <>
          {/* 쿠폰 템플릿 목록 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-[#0A192F]">쿠폰 템플릿 ({templates.length}개)</h3>
            </div>
            {templates.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <span className="material-symbols-outlined text-5xl mb-2 block">local_offer</span>
                <p>등록된 쿠폰 템플릿이 없습니다.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">코드</th>
                    <th className="px-4 py-3">이름</th>
                    <th className="px-4 py-3">할인</th>
                    <th className="px-4 py-3">최소주문</th>
                    <th className="px-4 py-3">트리거</th>
                    <th className="px-4 py-3">유효기간</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {templates.map((tmpl) => (
                    <tr key={tmpl.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#0A192F]">{tmpl.code}</td>
                      <td className="px-4 py-3 font-medium">{tmpl.name}</td>
                      <td className="px-4 py-3 text-[#c59f59] font-bold">
                        {tmpl.type === 'percent' ? `${tmpl.value}%` : `${tmpl.value.toLocaleString()}원`}
                        {tmpl.maxDiscount ? ` (최대 ${tmpl.maxDiscount.toLocaleString()}원)` : ''}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{tmpl.minOrderAmount.toLocaleString()}원 이상</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          tmpl.triggerEvent === 'signup' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {tmpl.triggerEvent === 'signup' ? '신규가입 자동' : '수동 발급'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{tmpl.validDays}일</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(tmpl)}
                          className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${
                            tmpl.isActive
                              ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                              : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
                          }`}>
                          {tmpl.isActive ? '활성' : '비활성'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(tmpl.id)}
                          className="text-xs text-red-500 border border-red-300 px-3 py-1.5 rounded-md hover:bg-red-500 hover:text-white transition-all">삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 발급된 쿠폰 목록 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-[#0A192F]">발급된 쿠폰 현황 ({issuedCoupons.length}개)</h3>
            </div>
            {issuedCoupons.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <span className="material-symbols-outlined text-5xl mb-2 block">card_giftcard</span>
                <p>발급된 쿠폰이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">코드</th>
                      <th className="px-4 py-3">이름</th>
                      <th className="px-4 py-3">할인</th>
                      <th className="px-4 py-3">사용자</th>
                      <th className="px-4 py-3">상태</th>
                      <th className="px-4 py-3">만료일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {issuedCoupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono font-bold">{coupon.code}</td>
                        <td className="px-4 py-3">{coupon.name}</td>
                        <td className="px-4 py-3 text-[#c59f59] font-bold">
                          {coupon.type === 'percent' ? `${coupon.value}%` : `${coupon.value.toLocaleString()}원`}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 font-mono truncate max-w-[120px]">{coupon.userId || '-'}</td>
                        <td className="px-4 py-3">
                          {coupon.used ? (
                            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">사용완료</span>
                          ) : new Date(coupon.expiresAt) < new Date() ? (
                            <span className="text-xs font-bold bg-red-100 text-red-500 px-2 py-0.5 rounded-full">만료</span>
                          ) : (
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">사용가능</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{new Date(coupon.expiresAt).toLocaleDateString('ko-KR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── 포인트 현황 컴포넌트 ─────────────────────────────────────────────────────
function PointsTab() {
  const [userPoints, setUserPoints] = useState<UserPoint[]>([]);
  const [allHistory, setAllHistory] = useState<PointHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [pointRes, histRes] = await Promise.all([
          fetch('/api/points/admin'),
          fetch('/api/points/admin/history'),
        ]);
        const pointData = await pointRes.json();
        const histData = await histRes.json();
        setUserPoints(pointData.userPoints || []);
        setAllHistory(histData.history || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalIssued = allHistory.filter((h) => h.type === 'earn').reduce((s, h) => s + h.amount, 0);
  const totalUsed = allHistory.filter((h) => h.type === 'use').reduce((s, h) => s + h.amount, 0);
  const totalHeld = userPoints.reduce((s, p) => s + p.total, 0);

  return (
    <div>
      <h2 className="text-xl font-bold text-[#0A192F] mb-6">포인트 현황</h2>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: '총 보유 포인트', value: `${totalHeld.toLocaleString()}P`, colorClass: 'bg-amber-50 border-amber-200 text-amber-700' },
          { label: '총 적립 포인트', value: `${totalIssued.toLocaleString()}P`, colorClass: 'bg-green-50 border-green-200 text-green-700' },
          { label: '총 사용 포인트', value: `${totalUsed.toLocaleString()}P`, colorClass: 'bg-red-50 border-red-200 text-red-700' },
        ].map((stat) => (
          <div key={stat.label} className={`border rounded-xl p-5 text-center ${stat.colorClass}`}>
            <p className="text-xs font-bold mb-1">{stat.label}</p>
            <p className="text-2xl font-extrabold">{stat.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-gray-400">progress_activity</span>
        </div>
      ) : (
        <>
          {/* 회원별 포인트 잔액 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="px-6 py-4 border-b">
              <h3 className="font-bold text-[#0A192F]">회원별 포인트 잔액 ({userPoints.length}명)</h3>
            </div>
            {userPoints.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <span className="material-symbols-outlined text-5xl mb-2 block">workspace_premium</span>
                <p>포인트 적립된 회원이 없습니다.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">사용자 ID</th>
                    <th className="px-4 py-3">보유 포인트</th>
                    <th className="px-4 py-3">마지막 업데이트</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {userPoints.map((up) => (
                    <tr key={up.userId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 truncate max-w-[200px]">{up.userId}</td>
                      <td className="px-4 py-3 font-bold text-amber-600">{up.total.toLocaleString()}P</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(up.updatedAt).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 포인트 전체 내역 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-bold text-[#0A192F]">전체 포인트 내역 ({allHistory.length}건)</h3>
            </div>
            {allHistory.length === 0 ? (
              <div className="py-12 text-center text-gray-400"><p>포인트 내역이 없습니다.</p></div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">유형</th>
                    <th className="px-4 py-3">사유</th>
                    <th className="px-4 py-3">포인트</th>
                    <th className="px-4 py-3">일시</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allHistory.slice(0, 50).map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          h.type === 'earn' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {h.type === 'earn' ? '적립' : '사용'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs max-w-[300px] truncate">{h.reason}</td>
                      <td className={`px-4 py-3 font-bold ${h.type === 'earn' ? 'text-green-600' : 'text-red-500'}`}>
                        {h.type === 'earn' ? '+' : '-'}{h.amount.toLocaleString()}P
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(h.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── 슬라이드 관리 컴포넌트 ───────────────────────────────────────────────────
const DEFAULT_SLIDE_FORM: Partial<Slide> = {
  title: '',
  subtitle: '',
  description: '',
  bgImage: '',
  bgColor: '#021127',
  overlayColor: 'rgba(2,17,39,0.7)',
  titleColor: '#ffffff',
  descColor: '#cbd5e1',
  badgeBg: '#c59f59',
  badgeText: '',
  badgeTextColor: '#ffffff',
  ctaLabel: '바로가기',
  ctaHref: '/',
  ctaLabel2: '',
  ctaHref2: '',
  couponImage: '',
  bullets: [],
};

function SlidesTab() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<Partial<Slide>>(DEFAULT_SLIDE_FORM);
  const [bulletsText, setBulletsText] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSlides = async () => {
    setLoading(true);
    const res = await fetch('/api/slides/all');
    const data = await res.json();
    setSlides(data.slides || []);
    setLoading(false);
  };

  useEffect(() => { loadSlides(); }, []);

  const openEdit = (slide: Slide) => {
    setEditing(slide);
    setForm(slide);
    setBulletsText((slide.bullets || []).join('\n'));
    setIsCreating(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(DEFAULT_SLIDE_FORM);
    setBulletsText('');
    setIsCreating(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const bullets = bulletsText.split('\n').map(l => l.trim()).filter(Boolean);
    const payload = { ...form, bullets };
    try {
      if (isCreating) {
        await fetch('/api/slides', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      } else if (editing) {
        await fetch(`/api/slides/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      await loadSlides();
      setIsCreating(false);
      setEditing(null);
    } finally { setSaving(false); }
  };

  const handleToggle = async (slide: Slide) => {
    await fetch(`/api/slides/${slide.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !slide.isActive }) });
    loadSlides();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 슬라이드를 삭제하시겠습니까?')) return;
    await fetch(`/api/slides/${id}`, { method: 'DELETE' });
    loadSlides();
  };

  const uploadSlideImage = async (e: React.ChangeEvent<HTMLInputElement>, key: 'bgImage' | 'couponImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      const storageRef = ref(storage, `slides/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);
      f(key, url);
    } catch (err) {
      console.error('슬라이드 이미지 업로드 실패:', err);
      alert('이미지 업로드에 실패했습니다. (CORS 설정이나 권한 오류일 수 있습니다.)');
    } finally {
      setSaving(false);
    }
  };

  const f = (key: keyof Slide, val: string | boolean | string[]) => setForm(prev => ({ ...prev, [key]: val }));

  const formPanel = (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h3 className="font-bold text-[#0A192F] text-lg">{isCreating ? '새 슬라이드 추가' : '슬라이드 수정'}</h3>
      
      {/* 텍스트 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">태그라인 (소제목)</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c59f59]" placeholder="WELCOME EVENT" value={form.subtitle || ''} onChange={e => f('subtitle', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">대제목 *</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c59f59]" placeholder="바다의 깊이를 담다" value={form.title || ''} onChange={e => f('title', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">설명 텍스트</label>
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c59f59] h-20 resize-none" placeholder="슬라이드 설명을 입력하세요..." value={form.description || ''} onChange={e => f('description', e.target.value)} />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">리스트 항목 (한 줄에 하나씩)</label>
        <textarea className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c59f59] h-24 resize-none" placeholder={"10% 할인쿠폰 자동 발급\n1% 포인트 적립\n시크릿 쿠폰"} value={bulletsText} onChange={e => setBulletsText(e.target.value)} />
      </div>

      {/* 이미지 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">배경 이미지 URL</label>
          <div className="flex gap-2">
            <input className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c59f59]" placeholder="https://..." value={form.bgImage || ''} onChange={e => f('bgImage', e.target.value)} />
            <label className="bg-gray-100 hover:bg-gray-200 text-[#0A192F] font-bold px-3 py-2 rounded-lg cursor-pointer text-xs flex items-center justify-center shrink-0 transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined text-sm mr-1">upload</span>
              업로드
              <input type="file" className="hidden" accept="image/*" onChange={e => uploadSlideImage(e, 'bgImage')} />
            </label>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">쿠폰/보조 이미지 URL</label>
          <div className="flex gap-2">
            <input className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c59f59]" placeholder="/welcome_coupon_10percent.png" value={form.couponImage || ''} onChange={e => f('couponImage', e.target.value)} />
            <label className="bg-gray-100 hover:bg-gray-200 text-[#0A192F] font-bold px-3 py-2 rounded-lg cursor-pointer text-xs flex items-center justify-center shrink-0 transition-colors whitespace-nowrap">
              <span className="material-symbols-outlined text-sm mr-1">upload</span>
              업로드
              <input type="file" className="hidden" accept="image/*" onChange={e => uploadSlideImage(e, 'couponImage')} />
            </label>
          </div>
        </div>
      </div>

      {/* 색상 */}
      <div>
        <p className="text-xs font-bold text-gray-600 mb-2">색상 설정</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {([
            { key: 'bgColor', label: '배경색' },
            { key: 'titleColor', label: '제목 색상' },
            { key: 'descColor', label: '설명 색상' },
            { key: 'badgeBg', label: '버튼/뱃지 색상' },
            { key: 'badgeTextColor', label: '버튼 텍스트 색상' },
          ] as { key: keyof Slide; label: string }[]).map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <input
                type="color"
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                value={typeof form[key] === 'string' && (form[key] as string).startsWith('#') ? form[key] as string : '#ffffff'}
                onChange={e => f(key, e.target.value)}
              />
              <label className="text-xs text-gray-600">{label}</label>
            </div>
          ))}
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <label className="text-xs text-gray-600">오버레이 투명도</label>
            <input type="text" className="w-28 border rounded px-2 py-1 text-xs" placeholder="rgba(2,17,39,0.7)" value={form.overlayColor || ''} onChange={e => f('overlayColor', e.target.value)} />
          </div>
        </div>
      </div>

      {/* CTA 버튼 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">버튼1 텍스트</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c59f59]" value={form.ctaLabel || ''} onChange={e => f('ctaLabel', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">버튼1 링크</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c59f59]" placeholder="/products" value={form.ctaHref || ''} onChange={e => f('ctaHref', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">버튼2 텍스트 (선택)</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c59f59]" value={form.ctaLabel2 || ''} onChange={e => f('ctaLabel2', e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">버튼2 링크</label>
          <input className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c59f59]" value={form.ctaHref2 || ''} onChange={e => f('ctaHref2', e.target.value)} />
        </div>
      </div>

      {/* 미리보기 */}
      {(form.bgColor || form.bgImage) && (
        <div>
          <p className="text-xs font-bold text-gray-600 mb-2">미리보기</p>
          <div
            className="relative h-48 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: form.bgColor || '#021127' }}
          >
            {form.bgImage && <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url('${form.bgImage}')` }} />}
            <div className="absolute inset-0" style={{ backgroundColor: form.overlayColor || 'rgba(0,0,0,0.5)' }} />
            <div className="relative z-10 text-center px-4">
              {form.subtitle && <p className="text-xs mb-1 font-bold tracking-widest uppercase" style={{ color: form.badgeTextColor || '#c59f59' }}>{form.subtitle}</p>}
              <p className="text-2xl font-bold" style={{ color: form.titleColor || '#fff' }}>{form.title || '제목'}</p>
              <p className="text-sm mt-1" style={{ color: form.descColor || '#ccc' }}>{(form.description || '').slice(0, 60)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button onClick={handleSave} disabled={saving}
          className="bg-[#c59f59] text-white font-bold px-8 py-2.5 rounded-lg hover:bg-[#b08d4a] disabled:opacity-60 transition-colors">
          {saving ? '저장 중...' : '💾 저장'}
        </button>
        <button onClick={() => { setIsCreating(false); setEditing(null); }}
          className="border border-gray-200 text-gray-600 font-bold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
          취소
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#0A192F]">슬라이드 관리</h2>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-[#0A192F] text-white font-bold px-5 py-2.5 rounded-lg hover:bg-[#112240] transition-colors">
          <span className="material-symbols-outlined text-lg">add</span> 슬라이드 추가
        </button>
      </div>

      {(isCreating) && <div className="mb-6">{formPanel}</div>}

      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-4xl text-gray-400">progress_activity</span>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, idx) => (
            <div key={slide.id} className={`bg-white rounded-xl shadow-sm border ${editing?.id === slide.id ? 'border-[#c59f59]' : 'border-gray-100'} overflow-hidden`}>
              {/* 슬라이드 카드 */}
              <div className="flex items-center gap-4 p-4">
                {/* 배경 미리보기 */}
                <div
                  className="w-32 h-20 rounded-lg flex-shrink-0 overflow-hidden relative"
                  style={{ backgroundColor: slide.bgColor }}
                >
                  {slide.bgImage && <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url('${slide.bgImage}')` }} />}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-bold drop-shadow">#{idx + 1}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[#0A192F] truncate">{slide.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${slide.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {slide.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                  {slide.subtitle && <p className="text-xs text-gray-500">{slide.subtitle}</p>}
                  <p className="text-xs text-gray-400 truncate mt-1">{slide.description}</p>
                  {slide.bullets && slide.bullets.length > 0 && (
                    <p className="text-xs text-[#c59f59] mt-1">{slide.bullets.length}개 항목</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(slide)}
                    title={slide.isActive ? '비활성화' : '활성화'}
                    className={`p-2 rounded-lg transition-colors ${slide.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <span className="material-symbols-outlined">{slide.isActive ? 'toggle_on' : 'toggle_off'}</span>
                  </button>
                  <button onClick={() => editing?.id === slide.id ? setEditing(null) : openEdit(slide)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button onClick={() => handleDelete(slide.id)}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>

              {/* 인라인 편집 패널 */}
              {editing?.id === slide.id && (
                <div className="border-t border-gray-100 p-4">
                  {formPanel}
                </div>
              )}
            </div>
          ))}

          {slides.length === 0 && (
            <div className="py-20 text-center text-gray-400">
              <span className="material-symbols-outlined text-5xl mb-3 block">slideshow</span>
              <p className="font-medium">슬라이드가 없습니다. 추가해보세요!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── 방문자 통계 컴포넌트 ───────────────────────────────────────────────────
function StatsTab() {
  const [stats, setStats] = useState<{ today: { count: number }; total: number; history: { date: string, count: number }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats/visit')
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false); });
  }, []);

  if (loading) return <div className="py-20 text-center text-gray-400">통계 데이터를 불러오는 중...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">trending_up</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">오늘의 방문자</p>
            <p className="text-2xl font-bold text-[#0A192F]">{stats?.today.count || 0}명</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">groups</span>
          </div>
          <div>
            <p className="text-sm text-gray-500">누적 방문자</p>
            <p className="text-2xl font-bold text-[#0A192F]">{stats?.total || 0}명</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-[#0A192F] mb-4">최근 30일 방문 기록</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold">
              <tr>
                <th className="px-4 py-3 text-left">날짜</th>
                <th className="px-4 py-3 text-right">방문자 수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.history.slice().reverse().map((h) => (
                <tr key={h.date} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-600">{h.date}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{h.count}명</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 어드민 페이지 ───────────────────────────────────────────────────────
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [adminPw, setAdminPw] = useState('');

  const [activeTab, setActiveTab] = useState<Tab>('register');
  const [productList, setProductList] = useState<Product[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProductList(data.products);
      })
      .catch((err) => console.error('상품 목록 불러오기 오류:', err));
  }, []);
  const [formData, setFormData] = useState<ProductFormData>({
    id: undefined,
    name: '',
    category: '프리미엄 건어물',
    description: '',
    price: '',
    image: null,
    imagePreview: '',
    tag: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoadTemplate = () => {
    if (formData.description && !confirm('현재 작성된 내용을 지우고 프리미엄 템플릿을 불러오시겠습니까?')) return;
    setFormData((prev) => ({ ...prev, description: PREMIUM_TEMPLATE }));
  };

  const quillWrapperRef = useRef<HTMLDivElement>(null);

  // 다중 이미지 커스텀 핸들러 (Firebase Storage 업로드)
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('multiple', 'multiple');
    input.click();

    input.onchange = async () => {
      const files = Array.from(input.files || []);
      if (!files.length) return;

      // wrapper div 안의 .ql-editor DOM에서 Quill 인스턴스 획득
      const wrapper = quillWrapperRef.current;
      if (!wrapper) return;
      const qlEditor = wrapper.querySelector('.ql-editor');
      if (!qlEditor) return;
      // @ts-ignore
      const Quill = (await import('quill')).default;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const quill = Quill.find(qlEditor.parentElement as Element) as any;
      if (!quill) return;

      for (const file of files) {
        try {
          // Firebase Storage에 업로드
          const storageRef = ref(storage, `products/detail_${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);
          
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', url);
          quill.setSelection(range.index + 1);
        } catch (err) {
          console.error('이미지 업로드 실패:', err);
          alert('이미지 업로드에 실패했습니다.');
        }
      }
    };
  }, []);


  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ font: [] }, { size: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), [imageHandler]);

  const quillFormats = [
    'font', 'size', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'align', 'list', 'blockquote', 'code-block',
    'link', 'image', 'video',
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: file, imagePreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.imagePreview) {
      alert('상품명, 가격, 이미지는 필수 항목입니다.');
      return;
    }
    setIsSubmitting(true);

    try {
      // 이미지를 Firebase Storage에 업로드하고 URL 획득
      let imageUrl = formData.imagePreview;
      if (formData.image) {
        try {
          const productId = String(Date.now());
          const storageRef = ref(storage, `products/${productId}_${formData.image.name}`);
          const snapshot = await uploadBytes(storageRef, formData.image);
          imageUrl = await getDownloadURL(snapshot.ref);
        } catch (uploadError) {
          console.error('Storage Upload Error:', uploadError);
          alert('이미지 업로드에 실패했습니다. (CORS 설정이나 권한 오류일 수 있습니다.) \n구글 클라우드 콘솔에서 Firebase Storage CORS 설정을 확인해주세요.');
          setIsSubmitting(false);
          return;
        }
      }
      const newProduct: Product = {
        id: formData.id || String(Date.now()),
        name: formData.name,
        category: formData.category,
        desc: formData.description.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').substring(0, 50) + '...',
        price: Number(formData.price),
        priceText: Number(formData.price).toLocaleString(),
        tag: formData.tag,
        img: imageUrl, // Storage URL (base64 아님)
        detail: formData.description,
        origin: '국내산',
        weight: '-',
      };

      console.log('Final product info to send:', newProduct);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      console.log('API Response Status:', res.status);
      if (res.ok) {
        const result = await res.json();
        console.log('Register Success Result:', result);
        if (formData.id) {
          setProductList((prev) => prev.map((p) => p.id === formData.id ? newProduct : p));
          setSuccessMessage(`"${formData.name}" 상품이 수정되었습니다!`);
        } else {
          setProductList((prev) => [...prev, newProduct]);
          setSuccessMessage(`"${formData.name}" 상품이 등록되었습니다!`);
        }
        setFormData({ id: undefined, name: '', category: '프리미엄 건어물', description: '', price: '', image: null, imagePreview: '', tag: '' });
      } else {
        const errData = await res.json();
        console.error('Register API Error Details:', errData);
        alert(`상품 등록에 실패했습니다: ${errData.error || '알 수 없는 오류'}`);
      }
    } catch (e) {
      console.error('handleSubmit error:', e);
      alert('상품 등록 중 오류가 발생했습니다. 이미지 크기를 확인해주세요.');
    }

    setIsSubmitting(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    const id = deleteConfirmId;
    console.log('Execute delete for id:', id);
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProductList((prev) => prev.filter((p) => p.id !== id));
        window.alert('상품이 성공적으로 삭제되었습니다.');
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('API Error:', errorData);
        window.alert(`삭제에 실패했습니다. (API 오류)\n${errorData.error || ''}`);
      }
    } catch (error) {
      console.error('삭제 처리 중 오류:', error);
      window.alert('삭제 처리 중 오류가 발생했습니다. 브라우저 콘솔을 확인해주세요.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'list',    label: '상품 목록',   icon: 'grid_view' },
    { key: 'register',label: '상품 등록',   icon: 'add_circle' },
    { key: 'manage',  label: '상품 관리',   icon: 'inventory_2' },
    { key: 'orders',  label: '주문 관리',   icon: 'shopping_bag' },
    { key: 'notices', label: '공지 관리',   icon: 'campaign' },
    { key: 'coupons', label: '쿠폰 관리',   icon: 'local_offer' },
    { key: 'points',  label: '포인트 현황', icon: 'workspace_premium' },
    { key: 'slides',  label: '슬라이드 관리', icon: 'slideshow' },
    { key: 'stats',   label: '방문자 통계', icon: 'monitoring' },
  ];
const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const id = adminId.trim();
    const pw = adminPw.trim();
    if (id === 'honey1004' && pw === '8432818') {
      setIsLoggedIn(true);
    } else {
      alert('아이디 또는 비밀번호가 틀렸습니다.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#021127] flex items-center justify-center p-6 bg-cover bg-center" style={{ backgroundImage: "url('/SLIDE3.jpg')" }}>
        <div className="absolute inset-0 bg-[#021127]/80 backdrop-blur-sm"></div>
        <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-[#c59f59] text-5xl mb-2">admin_panel_settings</span>
            <h2 className="text-2xl font-bold text-[#0A192F]">관리자 접속</h2>
            <p className="text-sm text-gray-500 mt-2">환영합니다, 대표님.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">아이디</label>
              <input
                type="text"
                autoComplete="off"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c59f59] text-[#0A192F]"
                placeholder="아이디를 입력하세요"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">비밀번호</label>
              <input
                type="password"
                autoComplete="new-password"
                value={adminPw}
                onChange={(e) => setAdminPw(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#c59f59] text-[#0A192F]"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            <button type="submit" className="w-full bg-[#c59f59] text-white font-bold py-3 rounded-lg hover:bg-[#b08d4a] transition-colors mt-4">
              로그인
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 underline">쇼핑몰 메인으로 돌아가기</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-gray-900">
      {/* Admin Header */}
      <header className="bg-[#0A192F] text-white px-6 md:px-10 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#c59f59] text-2xl">settings</span>
          <h1 className="text-lg font-bold">진성수산 관리자</h1>
        </div>
        <Link
          href="/"
          className="border border-white/30 text-white text-sm px-4 py-1.5 rounded hover:bg-white/10 transition-colors"
        >
          사이트 보기
        </Link>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 md:px-10">
        <nav className="flex gap-1 max-w-5xl mx-auto overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 py-4 px-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-[#0A192F] text-[#0A192F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
              {tab.key === 'orders' && (
                <span className="ml-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">!</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 md:px-10 py-8">
        {/* 성공 메시지 */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg flex items-center gap-3 animate-slide-in">
            <span className="material-symbols-outlined text-green-500">check_circle</span>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* ===== 탭 1: 상품 목록 ===== */}
        {activeTab === 'list' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productList.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url('${product.img}')` }}></div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[#0A192F]">{product.name}</h3>
                    {product.tag && (
                      <span className="text-[10px] font-bold bg-[#c59f59] text-white px-2 py-0.5 rounded-full uppercase">{product.tag}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.desc}</p>
                  <p className="font-bold text-[#0A192F]">{product.priceText}원</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===== 탭 2: 상품 등록 ===== */}
        {activeTab === 'register' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-10">
            <h2 className="text-xl font-bold text-[#0A192F] mb-8">{formData.id ? '상품 수정' : '상품 등록'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">상품명 <span className="text-red-500">*</span></label>
                <input type="text" placeholder="예: 완도산 특대 전복" value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A192F] focus:border-[#0A192F] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">카테고리 <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm appearance-none bg-white focus:ring-2 focus:ring-[#0A192F] focus:border-[#0A192F] outline-none transition-all cursor-pointer">
                    {CATEGORIES.map((cat: string) => (<option key={cat} value={cat}>{cat}</option>))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-800">상품 설명 <span className="text-red-500">*</span></label>
                  <button type="button" onClick={handleLoadTemplate}
                    className="text-xs bg-[#c59f59] hover:bg-[#b08d4a] text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors font-bold shadow-sm">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>프리미엄 템플릿 불러오기
                  </button>
                </div>
                <div ref={quillWrapperRef} className="quill-wrapper border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#0A192F] focus-within:border-[#0A192F] transition-all">
                  <ReactQuill theme="snow" value={formData.description}
                    onChange={(val: string) => setFormData({ ...formData, description: val })}
                    modules={quillModules} formats={quillFormats}
                    placeholder="상품 설명을 입력하세요..."
                    style={{ minHeight: '250px' }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">가격 (원) <span className="text-red-500">*</span></label>
                <input type="number" placeholder="예: 50000" value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A192F] focus:border-[#0A192F] outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">상품 이미지 <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-4">
                  <label className="bg-[#0A192F] hover:bg-[#112240] text-white text-sm font-bold px-5 py-2.5 rounded-lg cursor-pointer transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">folder_open</span>이미지 선택
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
                  </label>
                  <span className="text-sm text-gray-500">{formData.image ? formData.image.name : '선택된 파일 없음'}</span>
                </div>
                {formData.imagePreview && (
                  <div className="mt-4 relative inline-block">
                    <img src={formData.imagePreview} alt="미리보기" className="w-40 h-40 object-cover rounded-lg border border-gray-200 shadow-sm" />
                    <button type="button" onClick={() => setFormData({ ...formData, image: null, imagePreview: '' })}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-md">✕</button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">할인 표시 (선택)</label>
                <input type="text" placeholder="예: -20% 또는 HOT" value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#0A192F] focus:border-[#0A192F] outline-none transition-all" />
              </div>
              <div className="pt-4 space-y-3">
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-[#0A192F] hover:bg-[#112240] text-white font-bold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSubmitting ? (<><span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>저장 중...</>) : formData.id ? '상품 수정하기' : '상품 등록하기'}
                </button>
                <button type="button"
                  onClick={() => setFormData({ id: undefined, name: '', category: '프리미엄 건어물', description: '', price: '', image: null, imagePreview: '', tag: '' })}
                  className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-4 rounded-lg transition-all">취소</button>
              </div>
            </form>
          </div>
        )}

        {/* ===== 탭 3: 전체 상품 관리 ===== */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#0A192F]">전체 상품 ({productList.length}개)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3">이미지</th>
                    <th className="px-6 py-3">상품명</th>
                    <th className="px-6 py-3">가격</th>
                    <th className="px-6 py-3">태그</th>
                    <th className="px-6 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productList.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-lg bg-cover bg-center border border-gray-200" style={{ backgroundImage: `url('${product.img}')` }}></div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#0A192F] text-sm">{product.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{product.desc}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-sm text-[#0A192F]">{product.priceText}원</td>
                      <td className="px-6 py-4">
                        {product.tag ? (
                          <span className="text-[10px] font-bold bg-[#c59f59] text-white px-2 py-0.5 rounded-full uppercase">{product.tag}</span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" onClick={(e) => {
                            e.stopPropagation();
                            setFormData({ id: product.id, name: product.name, category: product.category || '프리미엄 건어물', description: product.detail, price: String(product.price), image: null, imagePreview: product.img, tag: product.tag });
                            setActiveTab('register');
                          }} className="text-xs text-[#0A192F] border border-[#0A192F] px-4 py-2 rounded-md hover:bg-[#0A192F] hover:text-white transition-all whitespace-nowrap font-bold">수정</button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(product.id); }} className="text-xs text-red-500 border border-red-300 px-4 py-2 rounded-md hover:bg-red-500 hover:text-white transition-all whitespace-nowrap font-bold">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {productList.length === 0 && (
                <div className="py-16 text-center text-gray-400">
                  <span className="material-symbols-outlined text-5xl mb-4 block">inventory_2</span>
                  <p>등록된 상품이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== 탭 4: 주문 관리 ===== */}
        {activeTab === 'orders' && <OrdersTab />}

        {/* ===== 탭 5: 공지 관리 ===== */}
        {activeTab === 'notices' && <NoticesTab />}

        {/* ===== 탭 6: 쿠폰 관리 ===== */}
        {activeTab === 'coupons' && <CouponsTab />}

        {/* ===== 탭 7: 포인트 현황 ===== */}
        {activeTab === 'points' && <PointsTab />}

        {/* ===== 탭 8: 슬라이드 관리 ===== */}
        {activeTab === 'slides' && <SlidesTab />}

        {/* ===== 탭 9: 방문자 통계 ===== */}
        {activeTab === 'stats' && <StatsTab />}
        {/* ===== 상품 삭제 확인 모달 ===== */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-80 text-center animate-slide-in">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              <h3 className="text-xl font-bold text-[#0A192F] mb-2">상품 삭제</h3>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed">정말 이 상품을 삭제하시겠습니까?<br/>삭제 후에는 복구할 수 없습니다.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">취소</button>
                <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">삭제하기</button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .quill-wrapper .ql-toolbar.ql-snow { border: none !important; border-bottom: 1px solid #e5e7eb !important; background: #fafafa; padding: 8px 12px; }
        .quill-wrapper .ql-container.ql-snow { border: none !important; font-size: 14px; min-height: 200px; }
        .quill-wrapper .ql-editor { min-height: 200px; padding: 16px; line-height: 1.6; }
        .quill-wrapper .ql-editor.ql-blank::before { color: #9ca3af; font-style: normal; }
        @keyframes slide-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
