const won = (n) => (n || 0).toLocaleString() + "원";
export default function PriceSummary({ v, big }) {
  return (
    <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted font-bold">기준가</span>
        <span className="font-bold text-ink">{won(v.base_price)}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-muted font-bold text-sm">예상 최종가</span>
        <span className={`font-extrabold text-brand-700 ${big ? "text-2xl" : "text-lg"}`}>{won(v.estimated_final_price)}</span>
      </div>
      <div className="mt-2 text-xs text-risk font-bold bg-[#FFF1EC] rounded-lg px-2.5 py-1.5 inline-block">
        추가금 예상 {Math.round((v.expected_extra_min||0)/10000)}~{Math.round((v.expected_extra_max||0)/10000)}만원
      </div>
    </div>
  );
}
