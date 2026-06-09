export function riskLevel(s) { return s >= 70 ? { label: "높음", color: "#FF8A65", bg: "#FFF1EC" } : s >= 45 ? { label: "보통", color: "#E0A12E", bg: "#FFF7E8" } : { label: "낮음", color: "#41C7A7", bg: "#E8F8F3" }; }
export default function RiskBadge({ score, showBar }) {
  const r = riskLevel(score);
  return (
    <div>
      <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg" style={{ color: r.color, background: r.bg }}>
        추가금 위험 {score} · {r.label}
      </span>
      {showBar && (
        <div className="mt-2 h-2 rounded-full bg-line overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${score}%`, background: r.color }} />
        </div>
      )}
    </div>
  );
}
