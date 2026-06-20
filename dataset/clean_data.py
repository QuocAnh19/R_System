"""
=========================================================================
 SCRIPT (R_System)
=========================================================================

CHỨC NĂNG:
  1. Đọc job_dataset.json -> chuẩn hoá tên nghề (career), làm sạch skill
  2. Đọc Coursera.csv -> match từng skill với khóa học thật (word-boundary)
  3. Sinh ra 5 file: careers.js, skills.js, careerSkills.js,
     courses.js, roadmaps.js  (đúng format backend/src/data/ của project)

CÁCH DÙNG:
  1. Đặt các file dataset cùng thư mục với script này
  2. Chạy:  python clean_data.py
  3. Kết quả nằm ngay trong thư mục 

CÓ THỂ TÙY CHỈNH (xem phần CONFIG bên dưới):
  - MIN_JOBS_PER_CAREER : số job tối thiểu để giữ 1 nghề (lọc nhiễu)
  - SKILL_FREQ_THRESHOLD: tỷ lệ % job trong nghề phải có skill đó mới giữ
  - MAX_SKILLS_PER_CAREER: số skill tối đa hiển thị cho 1 nghề
  - MAX_COURSES_PER_SKILL: số khóa học tối đa gợi ý cho 1 skill
=========================================================================
"""

import csv
import json
import re
import collections
import os

# ===================== CONFIG - chỉnh ở đây ====================== #
JOB_DATASET_PATH   = "job_dataset.json"
COURSERA_CSV_PATH  = "Coursera.csv"
OUTPUT_DIR         = r"..\backend\src\data"
#OUTPUT_DIR         = "output"

MIN_JOBS_PER_CAREER   = 2     # nghề phải có >= N job mới được giữ
SKILL_FREQ_THRESHOLD  = 0.3   # skill phải xuất hiện ở >= 30% job của nghề đó
MAX_SKILLS_PER_CAREER = 15
MAX_COURSES_PER_SKILL = 2
# =================================================================== #


# ---------------------------------------------------------------------
# PHẦN 1: ĐỌC & LÀM SẠCH job_dataset.json
# ---------------------------------------------------------------------

LEVEL_SUFFIX_PATTERNS = [
    r"\s*-\s*(Fresher|Experienced|Entry[- ]Level|Senior[- ]Level|Mid[- ]Level|Mid[- ]Senior.*)$",
    r"\s+(Intern|Trainee|Apprentice)$",
]
TITLE_PREFIX_PATTERN = r"^(Senior|Junior|Lead|Principal|Associate|Staff|Entry[- ]level|Entry|Graduate|Trainee)\s+"
SKILL_SUFFIX_PATTERN = r"\s*(basics|fundamentals|advanced|intermediate)\s*$"


def normalize_title(title):
    """Gom các title khác nhau nhưng cùng ý nghĩa về 1 tên nghề chung.
    Ví dụ: 'Senior iOS Developer', 'iOS Developer - Fresher' -> 'iOS Developer'
    """
    t = title.strip()
    for pat in LEVEL_SUFFIX_PATTERNS:
        t = re.sub(pat, "", t, flags=re.IGNORECASE).strip()
    t = re.sub(TITLE_PREFIX_PATTERN, "", t, flags=re.IGNORECASE).strip()
    return t


def clean_skill_name(s):
    """Bỏ các hậu tố mô tả không cần thiết trong tên skill."""
    s = s.strip()
    s = re.sub(SKILL_SUFFIX_PATTERN, "", s, flags=re.IGNORECASE).strip()
    return s


def load_and_clean_jobs(path):
    with open(path, encoding="utf-8") as f:
        jobs = json.load(f)

    before = len(jobs)
    # Loại record thiếu field quan trọng
    jobs = [j for j in jobs if j.get("Title") and j.get("Skills")]
    after = len(jobs)
    print(f"[job_dataset] Đọc {before} record, giữ lại {after} record hợp lệ "
          f"(loại {before - after} record lỗi/thiếu field)")

    career_skill_counter = collections.defaultdict(collections.Counter)
    career_job_count = collections.Counter()

    for j in jobs:
        career = normalize_title(j["Title"])
        if not career:
            continue
        career_job_count[career] += 1
        for sk in j.get("Skills", []):
            career_skill_counter[career][clean_skill_name(sk)] += 1

    print(f"[job_dataset] Gom {len(career_job_count)} tên nghề khác nhau "
          f"từ {len(set(j['Title'] for j in jobs))} title gốc")

    # Lọc nghề quá hiếm (nhiễu)
    careers_kept = {c: n for c, n in career_job_count.items() if n >= MIN_JOBS_PER_CAREER}
    print(f"[job_dataset] Giữ {len(careers_kept)} nghề có >= {MIN_JOBS_PER_CAREER} job "
          f"(loại {len(career_job_count) - len(careers_kept)} nghề hiếm)")

    # Với mỗi nghề: chỉ giữ skill đủ phổ biến trong nghề đó
    career_skill_map = {}
    for career in careers_kept:
        total = career_job_count[career]
        threshold = max(1, int(total * SKILL_FREQ_THRESHOLD))
        skills = [s for s, cnt in career_skill_counter[career].most_common() if cnt >= threshold]
        career_skill_map[career] = skills[:MAX_SKILLS_PER_CAREER]

    all_skills = sorted(set(s for skills in career_skill_map.values() for s in skills))
    print(f"[job_dataset] Tổng số skill duy nhất sau khi làm sạch: {len(all_skills)}")

    careers_sorted = sorted(careers_kept.keys())
    return careers_sorted, all_skills, career_skill_map


# ---------------------------------------------------------------------
# PHẦN 2: ĐỌC & MATCH Coursera.csv
# ---------------------------------------------------------------------

DIFFICULTY_RANK = {
    "Beginner": 1, "Conversant": 1,
    "Intermediate": 2, "Not Calibrated": 2, "Unknown": 2,
    "Advanced": 3,
}

GENERIC_WORDS = {"advanced", "expert", "introduction", "awareness", "scripting", "tools", "basics"}


def normalize_text_keep_spaces(s):
    """Chuẩn hoá: lowercase, bỏ ký tự đặc biệt (giữ #,+ vì quan trọng với C#, C++),
    GIỮ khoảng trắng để match theo ranh giới từ, tránh lỗi 'react' khớp nhầm 'reaction'.
    """
    s = s.lower()
    s = re.sub(r"[^a-z0-9#+\s]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def split_subskills(skill):
    """Tách 1 skill phức hợp (liệt kê nhiều công nghệ, vd 'Bash, PowerShell scripting')
    thành các phần nhỏ để match riêng từng phần.
    """
    parts = re.split(r"[,/:;]| and | & ", skill)
    parts = [p.strip() for p in parts if p.strip()]
    cleaned = []
    for p in parts:
        words = [w for w in p.split() if w.lower() not in GENERIC_WORDS]
        if words:
            cleaned.append(" ".join(words))
    return cleaned or [skill]


def load_coursera_courses(path):
    with open(path, encoding="utf-8", errors="replace") as f:
        rows = list(csv.DictReader(f))

    indexed = []
    skipped = 0
    for r in rows:
        title = (r.get("Course Name") or "").strip()
        if not title:
            skipped += 1
            continue
        try:
            rating = float(r.get("Course Rating", "") or 0)
        except ValueError:
            rating = 0.0
        difficulty = (r.get("Difficulty Level") or "Unknown").strip()
        search_text = normalize_text_keep_spaces(title + " " + (r.get("Skills") or ""))
        indexed.append({
            "title": title,
            "org": (r.get("University") or "").strip(),
            "url": (r.get("Course URL") or "").strip(),
            "rating": rating,
            "difficulty": difficulty,
            "search_text": search_text,
        })

    print(f"[Coursera.csv] Đọc {len(rows)} dòng, dùng {len(indexed)} khóa học hợp lệ "
          f"(loại {skipped} dòng thiếu tên khóa học)")
    return indexed


def find_courses_for_skill(skill, indexed_courses, top_n=MAX_COURSES_PER_SKILL):
    """Tìm khóa học khớp với skill theo RANH GIỚI TỪ (word boundary),
    không dùng substring tự do để tránh match sai (vd 'css' không khớp nhầm vào từ khác chứa 'css').
    """
    for candidate in split_subskills(skill):
        key = normalize_text_keep_spaces(candidate)
        if len(key) < 2:
            continue
        pattern = re.compile(r"(?<![a-z0-9#+])" + re.escape(key) + r"(?![a-z0-9#+])")
        matches = [c for c in indexed_courses if pattern.search(c["search_text"])]
        if matches:
            matches.sort(key=lambda c: -c["rating"])
            return matches[:top_n]
    return []


def match_skills_to_courses(all_skills, indexed_courses):
    skill_courses_map = {}
    unmatched = []
    for sk in all_skills:
        found = find_courses_for_skill(sk, indexed_courses)
        if found:
            skill_courses_map[sk] = found
        else:
            unmatched.append(sk)

    print(f"[match] {len(skill_courses_map)}/{len(all_skills)} skill match được khóa học thật "
          f"({len(unmatched)} skill dùng fallback link tìm kiếm)")
    return skill_courses_map, unmatched


# ---------------------------------------------------------------------
# PHẦN 3: SINH FILE .js
# ---------------------------------------------------------------------

def js_str(s):
    return json.dumps(s, ensure_ascii=False)


def write_careers_js(path, careers):
    lines = ["module.exports = ["]
    for i, c in enumerate(careers, start=1):
        lines.append(f"  {{ id: {i}, name: {js_str(c)} }},")
    lines.append("];")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def write_skills_js(path, skills):
    lines = ["module.exports = ["]
    for s in skills:
        lines.append(f"  {js_str(s)},")
    lines.append("];")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def write_career_skills_js(path, careers, career_skill_map):
    lines = ["module.exports = {"]
    for c in careers:
        sk = career_skill_map.get(c, [])
        sk_str = ", ".join(js_str(s) for s in sk)
        lines.append(f"  {js_str(c)}: [{sk_str}],")
    lines.append("};")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def write_courses_js(path, skills, skill_courses_map):
    lines = ["module.exports = ["]
    seen = set()
    for s in skills:
        found = skill_courses_map.get(s)
        if found:
            for c in found:
                key = (s, c["title"])
                if key in seen:
                    continue
                seen.add(key)
                lines.append(
                    "  { " +
                    f"title: {js_str(c['title'])}, " +
                    f"skill: {js_str(s)}, " +
                    f"organization: {js_str(c['org'])}, " +
                    f"difficulty: {js_str(c['difficulty'])}, " +
                    f"rating: {c['rating']}, " +
                    f"url: {js_str(c['url'])}" +
                    " },"
                )
        else:
            search_url = "https://www.coursera.org/search?query=" + re.sub(r"\s+", "%20", s)
            lines.append(
                "  { " +
                f"title: {js_str(s + ' (tìm khóa học)')}, " +
                f"skill: {js_str(s)}, " +
                f"organization: {js_str('Coursera Search')}, " +
                f"difficulty: {js_str('Unknown')}, " +
                "rating: 0, " +
                f"url: {js_str(search_url)}" +
                " },"
            )
    lines.append("];")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def write_roadmaps_js(path, careers, career_skill_map, skill_courses_map):
    def skill_rank(skill):
        found = skill_courses_map.get(skill)
        if not found:
            return 2
        ranks = [DIFFICULTY_RANK.get(c["difficulty"], 2) for c in found]
        return sum(ranks) / len(ranks)

    lines = ["module.exports = {"]
    for c in careers:
        sk_list = career_skill_map.get(c, [])
        sorted_skills = sorted(sk_list, key=skill_rank)
        lines.append(f"  {js_str(c)}: [")
        for i, sk in enumerate(sorted_skills, start=1):
            found = skill_courses_map.get(sk)
            title = found[0]["title"] if found else f"{sk} (tự tìm khóa học)"
            lines.append(f"    {{ step: {i}, skill: {js_str(sk)}, title: {js_str(title)} }},")
        lines.append(
            f"    {{ step: {len(sorted_skills)+1}, skill: {js_str('Project')}, "
            f"title: {js_str('Mini Project - ' + c)} }},"
        )
        lines.append("  ],\n")
    lines.append("};")
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


# ---------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print("=" * 70)
    print("BƯỚC 1: Đọc và làm sạch job_dataset.json")
    print("=" * 70)
    careers, all_skills, career_skill_map = load_and_clean_jobs(JOB_DATASET_PATH)

    print()
    print("=" * 70)
    print("BƯỚC 2: Đọc Coursera.csv và match skill -> khóa học")
    print("=" * 70)
    indexed_courses = load_coursera_courses(COURSERA_CSV_PATH)
    skill_courses_map, unmatched_skills = match_skills_to_courses(all_skills, indexed_courses)

    print()
    print("=" * 70)
    print("BƯỚC 3: Sinh file .js")
    print("=" * 70)
    write_careers_js(os.path.join(OUTPUT_DIR, "careers.js"), careers)
    write_skills_js(os.path.join(OUTPUT_DIR, "skills.js"), all_skills)
    write_career_skills_js(os.path.join(OUTPUT_DIR, "careerSkills.js"), careers, career_skill_map)
    write_courses_js(os.path.join(OUTPUT_DIR, "courses.js"), all_skills, skill_courses_map)
    write_roadmaps_js(os.path.join(OUTPUT_DIR, "roadmaps.js"), careers, career_skill_map, skill_courses_map)

    with open(os.path.join(OUTPUT_DIR, "unmatched_skills.json"), "w", encoding="utf-8") as f:
        json.dump(unmatched_skills, f, ensure_ascii=False, indent=2)

    print(f"Đã sinh xong 5 file .js + unmatched_skills.json trong thư mục ./{OUTPUT_DIR}/")
    print()
    print("TỔNG KẾT:")
    print(f"  - {len(careers)} nghề")
    print(f"  - {len(all_skills)} skill")
    print(f"  - {len(all_skills) - len(unmatched_skills)} skill có khóa học thật")
    print(f"  - {len(unmatched_skills)} skill cần bổ sung thủ công (xem unmatched_skills.json)")


if __name__ == "__main__":
    main()
