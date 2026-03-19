import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin'; // Firebase Firestore 인스턴스

// 토스페이먼츠 테스트 시크릿 키 (실제 프로젝트에서는 환경변수(process.env)로 관리)
const TOSS_SECRET_KEY = 'test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paymentKey, orderId, amount } = body;

    // 1. 토스페이먼츠 승인 API 호출 (Basic Auth 토큰 생성)
    const encryptedSecretKey = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${encryptedSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Toss Payments Confirmation Error:', errorData);
        return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const paymentData = await response.json();

    // 2. 파이어베이스 Firestore에 주문 정보 저장
    // [!] 주의: 서비스 계정이 정상적으로 등록되지 않았다면 이 부분에서 에러가 발생할 수 있습니다.
    try {
      await db.collection('orders').doc(orderId).set({
        orderId,
        paymentKey,
        amount,
        status: 'PAYMENT_COMPLETED',
        createdAt: new Date(),
        method: paymentData.method,
        orderName: paymentData.orderName,
        paymentData: paymentData, // 필요 시 전체 데이터 저장
      });
      console.log(`주문 저장 성공: ${orderId}`);
    } catch (dbError) {
      console.error('Firestore 저장 실패:', dbError);
      // DB 저장 실패 시 정책에 따라 결제 취소 API를 호출해야 할 수도 있습니다.
    }

    return NextResponse.json({ success: true, paymentData });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: '결제 승인 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
