import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import TDSProvider from "@/components/TDSProvider";
import { ThemeProvider } from "@/lib/theme";

const headline = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
  weight: ["600", "700", "800"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "플랜티 🌱",
  description: "매일 돌봐주는 나의 귀여운 가상 식물",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "플랜티",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3182F6",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 첫 페인트 전에 다크모드 클래스를 동기적으로 적용 (FOUC 방지) */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('theme');
            var dark = t ? t === 'dark' : true;
            if (dark) document.documentElement.classList.add('dark');
          } catch(e) { document.documentElement.classList.add('dark'); }
        `}} />
      </head>
      <body className={`${headline.variable} ${body.variable} antialiased`}>
        <ThemeProvider>
          <TDSProvider>
            {children}
          </TDSProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
