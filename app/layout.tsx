import type { Metadata } from "next";
import { Manrope, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import AuthModal from "@/components/AuthModal";
import VisitLogger from "@/components/VisitLogger";
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const notoParams = Noto_Sans_KR({
  subsets: ["latin"], // Noto Sans KR usually uses weight-based subsets or standard latin for initial loading
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jinsungsoosan.co.kr'),
  title: {
    default: "진성수산 - 동해안 산지직송 프리미엄 건어물",
    template: "%s | 진성수산",
  },
  description: "청정 동해 바다의 신선함을 산지 직송으로 전해드리는 50년 전통의 프리미엄 건어물 브랜드 진성수산(진성네이처푸드)입니다.",
  keywords: ["진성수산", "진성네이처푸드", "동해안", "산지직송", "건어물", "반건조 오징어", "오징어", "프리미엄 건어물"],
  openGraph: {
    title: "진성수산 - 동해안 산지직송 프리미엄 건어물",
    description: "청정 동해 바다의 신선함을 산지 직송으로 전해드리는 50년 전통의 프리미엄 건어물 브랜드 진성수산입니다.",
    url: "https://jinsungsoosan.co.kr",
    siteName: "진성수산",
    images: [
      {
        url: "/images/og-default.jpg", // TODO: public 폴더에 실제 대표 이미지(1200x630) 추가 필요
        width: 1200,
        height: 630,
        alt: "진성수산 대표 이미지",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "진성수산 - 동해안 산지직송 프리미엄 건어물",
    description: "청정 동해 바다의 신선함을 산지 직송으로 전해드리는 50년 전통의 프리미엄 건어물 브랜드 진성수산입니다.",
    images: ["/images/og-default.jpg"],
  },
  verification: {
    google: "구글_서치콘솔_인증키를_여기에_넣어주세요",
    other: {
      "naver-site-verification": ["네이버_서치어드바이저_인증키를_여기에_넣어주세요"],
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1" />
      </head>
      <body className={`${manrope.variable} ${notoParams.variable} antialiased font-sans bg-[#021127] text-slate-100`}>
        <AuthProvider>
          <VisitLogger />
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
