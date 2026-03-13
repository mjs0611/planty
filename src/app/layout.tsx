import type { Metadata, Viewport } from "next";
import "./globals.css";
import TDSProvider from "@/components/TDSProvider";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "초록하루 🌱",
  description: "매일 돌봐주는 나의 귀여운 가상 식물",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "초록하루",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00C473",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <ThemeProvider>
          <TDSProvider>
            {children}
          </TDSProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
