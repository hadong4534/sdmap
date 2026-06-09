import RiskBadge from "./RiskBadge";
export default function AiSummaryCard({ v, compact }) {
  const lines = Array.isArray(v.ai_summary) ? v.ai_summary : [];
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-extrabold text-ink text-sm"><span className="text-brand-600">✦</span> 스드맵 AI 한눈에 요약</div>
        <RiskBadge score={v.risk_score} />
      </div>
      <ul className="space-y-2">
        {(compact ? lines.slice(0, 3) : lines).map((t, i) => (
          <li key={i} className="flex gap-2 text-[13px] text-body leading-relaxed"><span className="text-brand-400 mt-0.5">·</span>{t}</li>
        ))}
      </ul>
    </div>
  );
}
