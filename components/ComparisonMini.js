import Link from "next/link";
import { riskLevel } from "./RiskBadge";
const won = (n) => (n || 0).toLocaleString() + "원";
export default function ComparisonMini({ vendors, title = "비슷한 업체 비교" }) {
  return (
    <div className="rounded-[20px] bg-white shadow-[0_8px_24px_rgba(139,111,232,0.11)] p-4">
      <div className="font-extrabold text-ink text-sm mb-3">{title}</div>
      <div className="space-y-2">
        {vendors.map((v) => {
          const r = riskLevel(v.risk_score);
          return (
            <Link key={v.id} href={`/shop/${v.id}`} className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 hover:border-brand-300">
              <div className="min-w-0"><div className="font-bold text-[13px] truncate">{v.name}</div><div className="text-[11px] text-muted">{won(v.estimated_final_price)}</div></div>
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md shrink-0" style={{ color: r.color, background: r.bg }}>위험 {v.risk_score}</span>
            </Link>
          );
        })}
      </div>
      <Link href="/compare" className="mt-3 block text-center text-[13px] font-bold text-brand-700 bg-brand-50 rounded-xl py-2.5">비교함에서 보기</Link>
    </div>
  );
}
