import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "마음일기 - 우리 반 AI 감정 일기장",
  description: "선생님과 AI가 함께 돌보는 우리 반 아이들의 마음 일기장",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* 눈이 편안한 한글 서체인 Noto Sans KR과 세련된 영문 서체 Outfit을 불러옵니다 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=Outfit:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
