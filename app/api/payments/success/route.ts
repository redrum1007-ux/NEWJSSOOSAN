import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin'; // Firebase Firestore 인스턴스

// 토스페이먼츠 시크릿 키 (실제 운영 시 반드시 환경변수로 관리)
const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount, taxFreeAmount } = body;

    // 1. 토스페이먼츠 승인 API 호출
    const encryptedSecretKey = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Toss Payments Confirmation Error:', errorData);
        return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const paymentData = await response.json();

    // ✅ receipt.url 추출 (토스 응답에서 영수증 URL 획득)
    const receiptUrl: string | null = paymentData?.receipt?.url ?? null;
    console.log('[payments/success] receiptUrl:', receiptUrl);

    // 2. Firestore에 주문 정보 저장
    try {
      await db.collection('orders').doc(orderId).set({
        orderId,
        paymentKey,
        amount,
        taxFreeAmount: taxFreeAmount ?? 0,          // ✅ 면세금액 저장
        taxableAmount: amount - (taxFreeAmount ?? 0), // ✅ 과세금액 저장
        status: 'PAYMENT_COMPLETED',
        createdAt: new Date(),
        method: paymentData.method,
        orderName: paymentData.orderName,
        receiptUrl,                                   // ✅ 영수증 URL 저장
        paymentData,                                  // 전체 응답 백업
      });
      console.log(`주문 저장 성공: ${orderId} | 면세: ${taxFreeAmount ?? 0}원 | 영수증: ${receiptUrl}`);
    } catch (dbError) {
      console.error('Firestore 저장 실패:', dbError);
    }

    return NextResponse.json({
      success: true,
      paymentData,
      receiptUrl, // ✅ 클라이언트(success page)로 영수증 URL 전달
    });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: '결제 승인 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
