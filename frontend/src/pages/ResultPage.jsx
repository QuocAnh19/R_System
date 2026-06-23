import RoadmapCard from "../components/RoadmapCard";
import ScoreCircle from "../components/ScoreCircle";

export default function ResultPage({ result, onBack }) {
  if (!result || result.error) {
    return (
      <div className="min-h-screen bg-ink-950 map-grid-bg flex items-center justify-center text-mist-100 px-6">
        <div className="max-w-md text-center animate-fade-up">
          <h1 className="mt-4 font-display text-2xl font-bold">
            Không thể tạo lộ trình
          </h1>
          <p className="mt-2 text-mist-400">
            {result?.error || "Đã có lỗi xảy ra, vui lòng thử lại."}
          </p>
          <button
            onClick={onBack}
            className="mt-6 rounded-xl border border-ink-600 bg-ink-800 px-5 py-2.5 font-medium text-mist-200 hover:border-signal-500/50 transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const {
    career,
    score,
    missingSkills,
    recommendedCourses,
    roadmap,
    analysis,
  } = result;

  const sortedRoadmap = [...roadmap]
    .sort((a, b) => {
      if (a.completed === b.completed) return a.step - b.step;
      return a.completed ? -1 : 1;
    })
    .map((item, idx) => ({ ...item, step: idx + 1 }));

  return (
    <div className="min-h-screen bg-ink-950 map-grid-bg text-mist-100">
      <div className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between animate-fade-up">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-mist-400 hover:text-mist-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-500/70 rounded-lg px-2 py-1 -ml-2"
          >
            ← Chọn lại
          </button>
          <span className="rounded-full border border-ink-600 bg-ink-800/60 px-3 py-1 text-xs font-mono uppercase tracking-wider text-mist-400">
            Kết quả phân tích
          </span>
        </div>

        <h1
          className="mt-4 font-display text-3xl sm:text-4xl font-bold animate-fade-up"
          style={{ animationDelay: "60ms" }}
        >
          {career}
        </h1>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Cột trái: điểm số + phân tích + khoá học */}
          <div className="space-y-6">
            <div
              className="rounded-2xl border border-ink-600/60 bg-ink-800/40 p-6 flex flex-col items-center animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              <ScoreCircle score={score} />
              <p className="mt-4 text-center text-xs text-mist-400">
                Mức độ phù hợp với{" "}
                <span className="text-mist-200">{career}</span>
              </p>
            </div>

            <div
              className="rounded-2xl border border-ink-600/60 bg-ink-800/40 p-5 animate-fade-up"
              style={{ animationDelay: "150ms" }}
            >
              <h3 className="font-display font-semibold text-sm text-mist-100 flex items-center gap-2"></h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-400">
                {analysis}
              </p>
            </div>

            {missingSkills.length > 0 && (
              <div
                className="rounded-2xl border border-ink-600/60 bg-ink-800/40 p-5 animate-fade-up"
                style={{ animationDelay: "200ms" }}
              >
                <p className="mt-1 text-sm text-mist-400">Kỹ năng cần học</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-ember-500/30 bg-ember-500/10 px-3 py-1 text-xs font-medium text-ember-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {recommendedCourses.length > 0 && (
              <div
                className="rounded-2xl border border-ink-600/60 bg-ink-800/40 p-5 animate-fade-up"
                style={{ animationDelay: "250ms" }}
              >
                <p className="mt-1 text-sm text-mist-400">
                  Khóa học được đề xuất dựa trên kỹ năng còn thiếu và lộ trình
                  học tập.
                </p>
                <ul className="mt-3 space-y-2">
                  {recommendedCourses.map((course) => (
                    <li
                      key={course.title}
                      className="flex items-center gap-2 text-sm text-mist-300"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-signal-500/70 shrink-0" />
                      <span className="flex-1">{course.title}</span>
                      {course.url && (
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Mở khóa học"
                          className="ml-1 shrink-0 text-signal-400 hover:text-signal-200 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-3.5 h-3.5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                              clipRule="evenodd"
                            />
                            <path
                              fillRule="evenodd"
                              d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Cột phải: roadmap dạng đường đi */}
          <div
            className="rounded-2xl border border-ink-600/60 bg-ink-800/30 p-6 sm:p-8 animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            <h2 className="font-display text-lg font-semibold text-mist-100 flex items-center gap-2"></h2>
            <p className="mt-1 text-sm text-mist-400">
              Đi theo từng trạm để hoàn thiện kỹ năng cho vị trí {career}.
            </p>

            <div className="mt-8">
              {sortedRoadmap.length > 0 ? (
                sortedRoadmap.map((item, idx) => (
                  <RoadmapCard
                    key={item.step}
                    item={item}
                    isLast={idx === sortedRoadmap.length - 1}
                  />
                ))
              ) : (
                <p className="text-sm text-mist-400 italic">
                  Chưa có lộ trình học cho nghề này.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
