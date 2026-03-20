'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  getAdditionalUserInfo
} from 'firebase/auth';
import Link from 'next/link';

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useAuthStore();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  if (!isAuthModalOpen && !showWelcomePopup) return null;

  const issueCoupon = async (userId: string) => {
    await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, triggerEvent: 'signup' }),
    }).catch(console.error);
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      
      const isNewUser = getAdditionalUserInfo(res)?.isNewUser;
      if (isNewUser) {
        await issueCoupon(res.user.uid);
        closeAuthModal();
        setShowWelcomePopup(true);
      } else {
        closeAuthModal();
      }
    } catch (err: any) {
      setError(err.message || '구글 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        closeAuthModal();
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        await issueCoupon(userCredential.user.uid);
        closeAuthModal();
        setShowWelcomePopup(true);
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 사용 중인 이메일입니다.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (err.code === 'auth/weak-password') {
        setError('비밀번호는 6자리 이상이어야 합니다.');
      } else {
        setError(err.message || '인증 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // 🎉 신규가입 축하 팝업
  // ============================
  if (showWelcomePopup) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        <div className="relative bg-[#031a3a] border border-[#c59f59]/40 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl text-center"
          style={{ animation: 'welcomePopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both' }}>

          {/* 상단 골드 배너 */}
          <div className="bg-gradient-to-r from-[#c59f59] via-[#e8c97a] to-[#c59f59] py-4 px-6">
            <p className="text-[#031a3a] font-black text-lg tracking-tight">🎊 가입을 축하드립니다! 🎊</p>
          </div>

          <div className="p-6">
            {/* 쿠폰 이미지 */}
            <div className="relative mx-auto mb-5 w-64 h-36 rounded-2xl overflow-hidden shadow-xl border-2 border-[#c59f59]/50">
              <img
                src="/welcome-coupon.png"
                alt="신규가입 10% 할인쿠폰"
                className="w-full h-full object-cover"
              />
              {/* 반짝이 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ animation: 'shimmer 2s infinite' }} />
            </div>

            {/* 메시지 */}
            <h2 className="text-white font-black text-lg mb-3 leading-snug">
              진성수산몰 신규가입을<br />축하드립니다! 🐟
            </h2>
            <div className="bg-[#0a2a50] border border-[#c59f59]/30 rounded-2xl p-4 mb-5 text-left">
              <p className="text-[#e8c97a] text-sm font-bold mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">local_activity</span>
                쿠폰 발급 완료!
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                <strong className="text-white">신규가입 전품목 10% 할인 쿠폰</strong>이<br />
                발급되었습니다.<br />
                <span className="text-[#c59f59] text-xs mt-1 block">
                  ※ 쿠폰은 결제 페이지에서 사용하실 수 있습니다.
                </span>
              </p>
            </div>

            {/* 버튼 영역 */}
            <div className="flex flex-col gap-3">
              <Link
                href="/cart"
                onClick={() => setShowWelcomePopup(false)}
                className="block w-full bg-gradient-to-r from-[#c59f59] to-[#e8c97a] text-[#021127] font-black py-3 rounded-xl text-sm hover:brightness-110 transition-all active:scale-95"
              >
                🛒 바로 쇼핑하러 가기
              </Link>
              <button
                onClick={() => setShowWelcomePopup(false)}
                className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors"
              >
                나중에 확인하기
              </button>
            </div>
          </div>
        </div>

        {/* CSS 애니메이션 */}
        <style jsx>{`
          @keyframes welcomePopIn {
            0% { transform: scale(0.5) translateY(60px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  // ============================
  // 기본 로그인 / 회원가입 폼
  // ============================
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#031a3a] border border-[#c59f59]/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? '로그인' : '회원가입'}
            </h2>
            <button
              onClick={closeAuthModal}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <>
                {/* 이름 */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-[#021127] border border-[#c59f59]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c59f59] transition-colors"
                    placeholder="이름을 입력해주세요"
                  />
                </div>
                {/* 연락처 */}
                <div>
                  <label className="block text-sm text-slate-400 mb-1">
                    연락처 <span className="text-slate-500 text-xs">(선택)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#021127] border border-[#c59f59]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c59f59] transition-colors"
                    placeholder="010-0000-0000"
                  />
                </div>
              </>
            )}
            
            {/* 이메일 */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#021127] border border-[#c59f59]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c59f59] transition-colors"
                placeholder="example@email.com"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-[#021127] border border-[#c59f59]/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c59f59] transition-colors"
                placeholder="6자리 이상 비밀번호"
              />
            </div>

            {error && <p className="text-red-400 text-sm py-1">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c59f59] hover:bg-[#c59f59]/90 text-[#021127] font-bold py-3 mt-4 rounded-lg transition-transform active:scale-95 disabled:opacity-70"
            >
              {loading ? '처리 중...' : isLogin ? '로그인' : '가입하기'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-[1px] bg-slate-700"></div>
            <span className="text-slate-500 text-sm">또는</span>
            <div className="flex-1 h-[1px] bg-slate-700"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 rounded-lg transition-transform active:scale-95 disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                처리 중...
              </span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                구글로 계속하기
              </>
            )}
          </button>

          <p className="text-center text-slate-400 mt-6 text-sm">
            {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-[#c59f59] hover:underline font-bold"
            >
              {isLogin ? '회원가입' : '로그인하기'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
