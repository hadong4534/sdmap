const STEPS = ["웨딩홀", "스드메", "본식 촬영", "드레스 투어", "본식", "신혼여행", "출산 준비", "돌잔치"];
export default function RoadmapProgress({ current = 1 }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {STEPS.map((s, i) => {
        const done = i < current, now = i === current;
        return (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] font-bold whitespace-nowrap ${now ? "bg-brand-grad text-white border-brand-600" : done ? "bg-brand-50 text-brand-700 border-brand-100" : "bg-white text-muted border-line"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${now ? "bg-white text-brand-700" : done ? "bg-brand-600 text-white" : "bg-line text-muted"}`}>{done ? "✓" : i + 1}</span>
              {s}
            </div>
            {i < STEPS.length - 1 && <span className="text-line">—</span>}
          </div>
        );
      })}
    </div>
  );
}
