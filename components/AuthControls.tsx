'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

export default function AuthControls() {
  const { user, loading, openAuthModal } = useAuthStore();

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#c59f59]/10 animate-pulse border border-[#c59f59]/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-slate-500 text-sm">hourglass_empty</span>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={openAuthModal}
        className="text-sm border border-[#c59f59] text-[#c59f59] hover:bg-[#c59f59] hover:text-[#021127] font-semibold px-4 py-1.5 rounded-full transition-colors whitespace-nowrap"
      >
        로그인 / 가입
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* 마이페이지 버튼 */}
      <Link
        href="/mypage"
        className="hidden md:flex items-center gap-1.5 text-xs font-bold text-[#c59f59] border border-[#c59f59]/50 hover:bg-[#c59f59] hover:text-[#021127] px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap group"
        title="쿠폰 · 포인트 확인"
      >
        <span className="material-symbols-outlined text-base group-hover:scale-110 transition-transform">
          account_circle
        </span>
        마이페이지
      </Link>

      {/* 계정 정보 & 로그아웃 */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs text-white break-all max-w-[120px] truncate">
            {user.displayName || user.email?.split('@')[0]}님
          </span>
          <button
            onClick={() => signOut(auth)}
            className="text-[10px] text-slate-400 hover:text-red-400 transition-colors"
          >
            로그아웃
          </button>
        </div>
        <div
          className="w-8 h-8 rounded-full bg-[#c59f59]/20 border border-[#c59f59]/30 overflow-hidden group relative cursor-pointer"
          onClick={() => signOut(auth)}
          title="로그아웃"
        >
          {user.photoURL ? (
            <img
              alt="User Profile"
              className="w-full h-full object-cover group-hover:opacity-70 transition-opacity"
              src={user.photoURL}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#c59f59] bg-[#031a3a] group-hover:opacity-70 transition-opacity">
              <span className="material-symbols-outlined text-xl">person</span>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full">
            <span className="material-symbols-outlined text-red-500 text-sm">logout</span>
          </div>
        </div>
      </div>

      {/* 모바일: 마이페이지 아이콘만 표시 */}
      <Link
        href="/mypage"
        className="flex md:hidden items-center justify-center w-8 h-8 rounded-full border border-[#c59f59]/40 text-[#c59f59] hover:bg-[#c59f59] hover:text-[#021127] transition-all duration-200"
        title="마이페이지"
      >
        <span className="material-symbols-outlined text-lg">account_circle</span>
      </Link>
    </div>
  );
}
