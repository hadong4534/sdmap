import "./globals.css";
import Script from "next/script";

const TITLE = "스드맵 (SDM) — 결혼 준비의 시작과 끝, 한 곳에서";
const DESC = "스튜디오·드레스·메이크업·웨딩홀을 정찰제로 한눈에 비교하고 바로 예약하세요. 둘이 함께 고르는 웨딩 준비, 스드맵.";

export const metadata = {
  metadataBase: new URL("https://sdmap.vercel.app"),
  title: TITLE,
  description: DESC,
  openGraph: {
    title: TITLE,
    description: DESC,
    url: "https://sdmap.vercel.app",
    siteName: "스드맵",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "스드맵" }],
    locale: "ko_KR",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/og.png"] },
  icons: { icon: "/images/logo_icon.png" },
};

export const viewport = { width: "device-width", initialScale: 1, themeColor: "#8B7BE8" };

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="font-sans">
        {children}
        <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
