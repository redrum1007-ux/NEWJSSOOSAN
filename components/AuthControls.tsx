'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

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
    <div className="flex items-center gap-3">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-xs text-white break-all max-w-[120px] truncate">{user.displayName || user.email?.split('@')[0]}님</span>
        <button 
          onClick={() => signOut(auth)}
          className="text-[10px] text-slate-400 hover:text-red-400 transition-colors"
        >
          로그아웃
        </button>
      </div>
      <div className="w-8 h-8 rounded-full bg-[#c59f59]/20 border border-[#c59f59]/30 overflow-hidden group relative cursor-pointer" onClick={() => signOut(auth)}>
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
  );
}
