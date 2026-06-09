import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "스드맵 (SDM) — 결혼 준비의 시작과 끝",
  description: "스튜디오·드레스·메이크업·웨딩홀을 한 곳에서. 정찰제 가격 비교와 즉시예약.",
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
