// MVP 임시 데이터 (추후 Supabase 테이블로 대체)
export const categories = [
  { key: "studio", label: "스튜디오", img: "/images/studio.png" },
  { key: "dress", label: "드레스", img: "/images/dress.png" },
  { key: "makeup", label: "메이크업", img: "/images/makeup.png" },
  { key: "hall", label: "웨딩홀", img: "/images/hall.png" },
];

export const topVendors = [
  { id: 1, rank: 1, name: "루미에르 스튜디오", area: "강남 · 실내+야외", rating: 4.9, reviews: 312, price: "1,200,000원", now: true, img: "/images/studio.png" },
  { id: 2, rank: 2, name: "아뜰리에 드레스", area: "청담 · 본식+촬영", rating: 4.8, reviews: 208, price: "1,500,000원", now: false, img: "/images/dress.png" },
  { id: 3, rank: 3, name: "글로우 메이크업", area: "청담 · 헤어 포함", rating: 4.8, reviews: 176, price: "450,000원", now: true, img: "/images/makeup.png" },
  { id: 4, rank: 4, name: "더그레이스 웨딩홀", area: "삼성 · 채플형", rating: 4.9, reviews: 94, price: "식대 79,000원~", now: false, img: "/images/hall.png" },
];

export const regions = ["전국", "서울", "경기", "인천", "부산", "대구", "대전"];

export const reviews = [
  { id: 1, text: "가격이 다 공개돼 있어서 비교가 편했어요", who: "루미에르 스튜디오 · 김○○", img: "/images/studio.png" },
  { id: 2, text: "드레스 피팅 예약이 간편했습니다", who: "아뜰리에 · 이○○", img: "/images/dress.png" },
  { id: 3, text: "홀 투어 예약까지 한 번에", who: "더그레이스 · 박○○", img: "/images/hall.png" },
];
