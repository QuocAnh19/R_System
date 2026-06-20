const ICONS = {
  "Frontend Developer": "🖥️",
  "Backend Developer": "🛠️",
  "AI Engineer": "🧠",
  "Fullstack Developer": "⚡",
  "Data Analyst": "📊",
};

export default function CareerCard({ title, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`
        group relative w-full text-left rounded-2xl p-5 transition-all duration-200
        border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-500/70
        ${
          selected
            ? "bg-ink-700 border-signal-500/60 shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_8px_24px_-8px_rgba(34,211,238,0.35)]"
            : "bg-ink-800/60 border-ink-600/60 hover:border-ink-500 hover:bg-ink-800"
        }
      `}
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{ICONS[title] || "💼"}</span>
        {selected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-signal-500 text-ink-950 text-xs font-bold">
            ✓
          </span>
        )}
      </div>

      <h3
        className={`mt-4 font-display font-semibold text-base leading-snug ${
          selected ? "text-mist-100" : "text-mist-300"
        }`}
      >
        {title}
      </h3>

      <span
        className={`mt-1 block text-xs font-mono uppercase tracking-wider ${
          selected ? "text-signal-400" : "text-mist-400/60"
        }`}
      >
        {selected ? "Đã chọn" : "Chọn lộ trình này"}
      </span>
    </button>
  );
}
