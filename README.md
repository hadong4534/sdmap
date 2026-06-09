# 스드맵 (SDM) — Web

웨딩 풀케어 플랫폼 스드맵의 웹/모바일 반응형 앱 (v0).

## 스택
- Next.js 14 (App Router) + React 18
- Tailwind CSS (브랜드 라벤더 토큰)
- Supabase (인증·DB·스토리지) — 연동 예정

## v0 범위
인트로(스플래시) → 로그인 → 홈 (PC·모바일 반응형)

## 로컬 실행
```bash
npm install
npm run dev      # http://localhost:3000
```

## 환경변수
`.env.local.example`를 `.env.local`로 복사 후 Supabase 값 입력.
Vercel 배포 시 동일한 값을 프로젝트 환경변수에 등록.

## 화면
- `/`        인트로 스플래시 (1.8초 후 /login 이동)
- `/login`   로그인 / 회원가입
- `/home`    메인 홈
