export default function RoadmapCard({ item, isLast }) {
  const { step, title, completed } = item;

  return (
    <div className="relative flex gap-5">
      {/* Cột trái: trạm (node) + đoạn đường nối xuống trạm kế tiếp */}
      <div className="flex flex-col items-center">
        <div
          className={`
            relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full
            font-display font-bold text-sm transition-colors duration-300
            ${
              completed
                ? "bg-signal-500 text-ink-950 shadow-[0_0_0_4px_rgba(34,211,238,0.15)]"
                : "bg-ink-800 text-ember-400 border-2 border-dashed border-ember-500/60"
            }
          `}
        >
          {completed ? "✓" : step}
        </div>

        {!isLast && (
          <svg width="2" height="100%" className="flex-1 min-h-[2.5rem]">
            <line
              x1="1"
              y1="0"
              x2="1"
              y2="100%"
              stroke={
                completed ? "var(--color-signal-500)" : "var(--color-ink-600)"
              }
              strokeWidth="2"
              className={completed ? "" : "path-flow"}
              strokeDasharray={completed ? "0" : "6 6"}
            />
          </svg>
        )}
      </div>

      {/* Nội dung trạm */}
      <div className={`flex-1 ${isLast ? "" : "pb-7"}`}>
        <div
          className={`
            rounded-xl border px-4 py-3 transition-colors duration-200
            ${
              completed
                ? "bg-signal-500/10 border-signal-500/30"
                : "bg-ink-800/50 border-ink-600/50"
            }
          `}
        >
          <p className="font-display font-semibold text-mist-100 text-sm">
            {title}
          </p>
          <p
            className={`mt-0.5 text-xs font-mono uppercase tracking-wide ${
              completed ? "text-signal-400" : "text-ember-400/80"
            }`}
          >
            {completed ? "Đã hoàn thành" : "Cần học"}
          </p>
        </div>
      </div>
    </div>
  );
}
