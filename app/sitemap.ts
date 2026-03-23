import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase-admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jinsungsoosan.co.kr';

  // 정적 페이지 라우트
  const routes = ['', '/products', '/notices', '/about', '/inquiry'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    // 1. 파이어베이스에서 상품 목록 가져와서 동적 사이트맵 생성
    const productsSnapshot = await db.collection('products').get();
    const products = productsSnapshot.docs.map(doc => ({
      url: `${baseUrl}/products/${doc.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

    // 2. 파이어베이스에서 공지사항 목록 가져와서 동적 사이트맵 생성
    const noticesSnapshot = await db.collection('notices').get();
    const notices = noticesSnapshot.docs.map(doc => ({
      url: `${baseUrl}/notices/${doc.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));

    return [...routes, ...products, ...notices];
  } catch (error) {
    console.error('Sitemap generation error (fallback to static routes):', error);
    // 빌드 타임 에러 방지를 위한 폴백(Fallback) - 정적 페이지만 반환
    return routes;
  }
}
