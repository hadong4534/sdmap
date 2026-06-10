import "./globals.css";
import Script from "next/script";

const TITLE = "스드맵 — 웨딩부터 신혼·출산까지, 한 곳에서";
const DESC = "스드메·웨딩홀부터 신혼여행·돌잔치·신혼부부 금융까지. 결혼 준비의 시작과 끝, 그리고 그 이후를 함께하는 가족 생애주기 플랫폼 스드맵.";

export const metadata = {
  metadataBase: new URL("https://sdmap.vercel.app"),
  title: TITLE,
  description: DESC,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "스드맵", statusBarStyle: "default" },
  openGraph: {
    title: TITLE, description: DESC, url: "https://sdmap.vercel.app",
    siteName: "스드맵", images: [{ url: "/og.png", width: 1200, height: 630, alt: "스드맵" }],
    locale: "ko_KR", type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/og.png"] },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#8B7BE8" };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@600;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans">
        {children}
        <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
