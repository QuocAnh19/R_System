
import { useEffect, useState } from "react";

import CareerCard from "../components/CareerCard";
import { getCareers, getSkillsByCareer } from "../services/recommendationApi";

const LEARNING_STYLES = [
  { value: "Video", label: "Video" },
  { value: "Reading", label: "Đọc tài liệu" },
  { value: "Project Based", label: "Làm dự án" },
];

const DEFAULT_VISIBLE_CAREERS = 9;

export default function AssessmentPage({ onGenerate }) {
  const [careers, setCareers] = useState([]);
  const [career, setCareer] = useState("");
  const [careerSearch, setCareerSearch] = useState("");

  const [skillList, setSkillList] = useState([]);
  const [skills, setSkills] = useState([]);

  const [learningStyle, setLearningStyle] = useState("Video");

  const [loading, setLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCareers()
      .then((data) => setCareers(data))
      .catch(() =>
        setError("Không thể tải danh sách nghề nghiệp. Hãy kiểm tra backend."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!career) {
      setSkillList([]);
      setSkills([]);
      return;
    }

    setSkillsLoading(true);
    getSkillsByCareer(career)
      .then((data) => {
        setSkillList(data);
        setSkills([]);
      })
      .catch(() => setError("Không thể tải kỹ năng cho nghề này."))
      .finally(() => setSkillsLoading(false));
  }, [career]);

  const toggleSkill = (skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  // true khi người dùng đang gõ gì đó vào ô tìm kiếm
  const isSearching = careerSearch.trim() !== "";

  // Nếu đang search -> lọc theo tên nghề (không phân biệt hoa/thường)
  // Nếu không search -> chỉ lấy N nghề đầu tiên (DEFAULT_VISIBLE_CAREERS)
  const filteredCareers = isSearching
    ? careers.filter((c) =>
        c.name.toLowerCase().includes(careerSearch.trim().toLowerCase()),
      )
    : careers.slice(0, DEFAULT_VISIBLE_CAREERS);

  const canGenerate = career !== "" && !loading;

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 map-grid-bg flex items-center justify-center">
        <p className="font-mono text-sm text-mist-400 animate-pulse">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 map-grid-bg text-mist-100">
      <div className="mx-auto max-w-4xl px-6 py-14 sm:py-20">
        {/* Header */}
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-600 bg-ink-800/60 px-3 py-1 text-xs font-mono uppercase tracking-wider text-signal-400">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-500" />
            Định hướng nghề nghiệp IT
          </span>

          <h1 className="mt-5 font-display text-4xl sm:text-5xl font-bold leading-tight text-mist-100">
            Lộ trình nào dành cho bạn?
            <br className="hidden sm:block" />
          </h1>
          <p className="mt-3 max-w-lg text-mist-400">
            Chọn nghề bạn muốn theo đuổi, đánh dấu kỹ năng bạn đã có — hệ thống
            sẽ vẽ lộ trình học còn lại cho bạn.
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-ember-500/30 bg-ember-500/10 px-4 py-3 text-sm text-ember-400">
            {error}
          </p>
        )}

        {/* Bước 1: chọn nghề */}
        <section
          className="mt-10 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <SectionLabel index="01" title="Chọn nghề nghiệp" />

          {/* Ô tìm kiếm nghề */}
          <div className="mt-4 relative">
            <input
              type="text"
              value={careerSearch}
              onChange={(e) => setCareerSearch(e.target.value)}
              placeholder="Tìm nghề nghiệp, ví dụ: Frontend, AI, Data..."
              className="
                w-full rounded-xl border border-ink-600 bg-ink-800/60 pl-11 pr-4 py-3
                text-sm text-mist-100 placeholder:text-mist-400/50
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-signal-500/70 focus:border-signal-500/60
              "
            />
          </div>

          {!isSearching && careers.length > DEFAULT_VISIBLE_CAREERS && (
            <p className="mt-2 text-xs text-mist-400/60">
              Đang hiện {DEFAULT_VISIBLE_CAREERS}/{careers.length} nghề phổ biến
              nhất. Gõ vào ô tìm kiếm để xem toàn bộ.
            </p>
          )}

          {isSearching && (
            <p className="mt-2 text-xs text-mist-400/60">
              Tìm thấy {filteredCareers.length} nghề phù hợp với "
              {careerSearch.trim()}"
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredCareers.map((c) => (
              <CareerCard
                key={c.id}
                title={c.name}
                selected={career === c.name}
                onClick={() => setCareer(c.name)}
              />
            ))}
          </div>

          {isSearching && filteredCareers.length === 0 && (
            <p className="mt-4 text-sm text-mist-400/70 italic">
              Không tìm thấy nghề nào khớp với từ khóa này. Hãy thử một từ khóa
              khác.
            </p>
          )}
        </section>

        {/* Bước 2: chọn skill */}
        <section
          className="mt-10 animate-fade-up"
          style={{ animationDelay: "140ms" }}
        >
          <SectionLabel index="02" title="Kỹ năng bạn đã có" />

          {!career && (
            <p className="mt-4 text-sm text-mist-400/70 italic">
              Hãy chọn một nghề ở trên để xem danh sách kỹ năng liên quan.
            </p>
          )}

          {career && skillsLoading && (
            <p className="mt-4 text-sm font-mono text-mist-400 animate-pulse">
              Đang tải kỹ năng...
            </p>
          )}

          {career && !skillsLoading && (
            <div className="mt-4 flex flex-wrap gap-2">
              {skillList.map((skill) => {
                const selected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    aria-pressed={selected}
                    className={`
                      rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-500/70
                      ${
                        selected
                          ? "bg-signal-500 border-signal-500 text-ink-950"
                          : "bg-ink-800/60 border-ink-600 text-mist-300 hover:border-signal-500/50 hover:text-mist-100"
                      }
                    `}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Bước 3: phong cách học
        <section
          className="mt-10 animate-fade-up"
          style={{ animationDelay: "200ms" }}
        >
          <SectionLabel index="03" title="Phong cách học ưa thích" />
          <div className="mt-4 flex flex-wrap gap-3">
            {LEARNING_STYLES.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setLearningStyle(opt.value)}
                aria-pressed={learningStyle === opt.value}
                className={`
                  flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-150
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-500/70
                  ${
                    learningStyle === opt.value
                      ? "border-signal-500/60 bg-ink-700 text-mist-100"
                      : "border-ink-600 bg-ink-800/60 text-mist-400 hover:border-ink-500"
                  }
                `}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </section> */}

        {/* CTA */}
        <div
          className="mt-12 animate-fade-up"
          style={{ animationDelay: "260ms" }}
        >
          <button
            type="button"
            disabled={!canGenerate}
            onClick={() => onGenerate({ career, skills, learningStyle })}
            className="
              group relative w-full sm:w-auto rounded-xl px-7 py-3.5 font-display font-semibold
              text-ink-950 bg-signal-500 transition-all duration-200
              hover:bg-signal-400 hover:shadow-[0_0_24px_-4px_rgba(34,211,238,0.6)]
              disabled:bg-ink-700 disabled:text-mist-400/50 disabled:cursor-not-allowed disabled:hover:shadow-none
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950
            "
          >
            Tạo lộ trình của tôi
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>
          {!career && (
            <p className="mt-2 text-xs text-mist-400/60">
              Chọn một nghề để bắt đầu.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ index, title }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-xs text-signal-500/80">{index}</span>
      <h2 className="font-display text-lg font-semibold text-mist-100">
        {title}
      </h2>
      <span className="h-px flex-1 bg-ink-600/60" />
    </div>
  );
}
