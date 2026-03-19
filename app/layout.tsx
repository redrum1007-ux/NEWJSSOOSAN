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
  title: "진성네이처푸드 - 50년 전통 프리미엄 건어물",
  description: "청정 완도 바다의 신선함을 산지 직송으로 전해드리는 50년 전통의 프리미엄 건어물 브랜드 진성네이처푸드입니다.",
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
