import { useState } from "react";

import CareerCard from "../components/CareerCard";

export default function AssessmentPage({ onGenerate }) {
  const [career, setCareer] = useState("");

  const [skills, setSkills] = useState([]);

  const skillList = ["Java", "SQL", "Spring Boot", "Git", "Docker"];

  const [learningStyle, setLearningStyle] = useState("Video");

  const toggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const careers = [
    "Frontend Developer",
    "Backend Developer",
    "AI Engineer",
    "Fullstack Developer",
    "Mobile Developer",
    "Data Analyst",
    "Cyber Security",
  ];

  return (
    <div className="p-10">
      <h1
        className="
        text-3xl
        font-bold
        mb-8"
      >
        IT Learning Recommendation
      </h1>

      <div
        className="
grid
grid-cols-3
gap-4
"
      >
        {careers.map((role) => (
          <CareerCard
            key={role}
            title={role}
            selected={career === role}
            onClick={() => setCareer(role)}
          />
        ))}
      </div>

      <div className="mt-8">
        <h2>Skills</h2>

        {skillList.map((skill) => (
          <label
            key={skill}
            className="
              block"
          >
            <input
              type="checkbox"
              checked={skills.includes(skill)}
              onChange={() => toggleSkill(skill)}
            />{" "}
            {skill}
          </label>
        ))}
      </div>

      <select
        value={learningStyle}
        onChange={(e) => setLearningStyle(e.target.value)}
      >
        <option>Video</option>

        <option>Reading</option>

        <option>Project Based</option>
      </select>

      <button
        className="
        bg-blue-500
        text-white
        px-4
        py-2
        mt-8"
        onClick={() =>
          onGenerate({
            career,
            skills,
            learningStyle
          })
        }
      >
        Generate Recommendation
      </button>
    </div>
  );
}
