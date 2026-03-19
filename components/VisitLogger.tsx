'use client';

import { useEffect } from 'react';

export default function VisitLogger() {
  useEffect(() => {
    // 세션당 한 번만 카운트하도록 체크 (브라우저 세션)
    const hasVisited = sessionStorage.getItem('js_logged_visit_today');
    if (!hasVisited) {
      fetch('/api/stats/visit', { method: 'POST' })
        .then(() => sessionStorage.setItem('js_logged_visit_today', 'true'))
        .catch(console.error);
    }
  }, []);

  return null;
}
