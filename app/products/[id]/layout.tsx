import { Metadata } from 'next';
import { db } from '@/lib/firebase-admin';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Next.js 15: params should be awaited
  const resolvedParams = await params;

  try {
    const docRef = db.collection('products').doc(resolvedParams.id);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const product = docSnap.data();
      const productName = product?.name || '상품 상세';
      const productDesc = product?.desc?.replace(/<[^>]+>/g, '').substring(0, 150) || `${productName} - 동해안 산지직송 프리미엄 건어물`;
      const productImg = product?.img;

      return {
        title: productName,
        description: productDesc,
        openGraph: {
          title: productName,
          description: productDesc,
          images: productImg ? [{ url: productImg, width: 800, height: 800, alt: productName }] : [],
        },
        twitter: {
          card: 'summary_large_image',
          title: productName,
          description: productDesc,
          images: productImg ? [productImg] : [],
        }
      };
    }
  } catch (error) {
    console.error('Error generating metadata for product:', error);
  }
  
  return {
    title: '상품 상세',
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
