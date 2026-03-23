import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/mypage', '/cart', '/success', '/api/'],
    },
    sitemap: 'https://jinsungsoosan.co.kr/sitemap.xml',
  };
}
