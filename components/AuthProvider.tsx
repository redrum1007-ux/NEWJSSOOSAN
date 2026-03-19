'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      // 신규가입 감지: creationTime == lastSignInTime (처음 로그인)
      if (user) {
        const createdAt = user.metadata.creationTime;
        const lastSignIn = user.metadata.lastSignInTime;
        const isNewUser = createdAt === lastSignIn;

        if (isNewUser) {
          // 신규가입 트리거 쿠폰 자동 발급
          try {
            await fetch('/api/coupons', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.uid, triggerEvent: 'signup' }),
            });
          } catch (e) {
            console.error('쿠폰 자동 발급 오류:', e);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return <>{children}</>;
}

