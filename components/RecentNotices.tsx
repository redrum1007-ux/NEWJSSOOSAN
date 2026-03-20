'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  pinned: boolean;
  author: string;
}

export default function RecentNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/notices')
      .then((res) => res.json())
      .then((data) => {
        if (data.notices) {
          setNotices(data.notices.slice(0, 4)); // 최신 4개만 표시
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch notices:', err);
        setLoading(false);
      });
  }, []);

  if (loading || notices.length === 0) return null;

  return (
    <section className="py-20 px-6 md:px-20 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h3 className="text-[#c59f59] font-bold tracking-widest uppercase mb-2 text-sm flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#c59f59]"></span>
              News & Notices
            </h3>
            <h2 className="text-3xl font-bold text-[#0A192F]">진성수산 소식</h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-sm md:text-base">
          <ul className="divide-y divide-gray-100">
            {notices.map((notice, idx) => (
              <li key={notice.id} className="group transition-colors">
                <button 
                  onClick={() => setExpandedId(expandedId === notice.id ? null : notice.id)}
                  className="w-full text-left flex flex-col md:flex-row items-start md:items-center px-6 py-5 gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex-shrink-0 flex items-center gap-2 w-24">
                    {notice.pinned ? (
                      <span className="bg-[#c59f59] text-white text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">공지</span>
                    ) : (
                      <span className="text-gray-400 font-bold text-lg">{String(idx + (notice.pinned ? 0 : 1)).padStart(2, '0')}</span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold text-[#0A192F] group-hover:text-[#c59f59] transition-colors">{notice.title}</p>
                    {expandedId === notice.id ? (
                      <div className="mt-4 text-gray-600 leading-relaxed font-normal whitespace-pre-wrap">
                        {notice.content}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm mt-1 line-clamp-1">{notice.content}</p>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 text-sm text-gray-400 font-mono mt-2 md:mt-0 flex items-center gap-4">
                    {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                    <span className="material-symbols-outlined text-gray-300">
                      {expandedId === notice.id ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
