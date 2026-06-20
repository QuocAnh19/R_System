import { CircularProgressbar } from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

import RoadmapCard from "../components/RoadmapCard";
import ScoreCircle from "../components/ScoreCircle";


export default function ResultPage({ result, onBack }) {
  return (
    <div className="p-10">
      <button onClick={onBack}>← Back</button>

      <h1
        className="
        text-3xl
        font-bold
        mt-4"
      >
        Result
      </h1>

      <div className="w-40 h-40">
        <ScoreCircle score={result.score} />
      </div>

      <h3 className="mt-6">Missing Skills</h3>

      <ul>
        {result.missingSkills.map((skill) => (
          <li key={skill}>{skill}</li>
        ))}
      </ul>

      <h3 className="mt-6">Courses</h3>
      <ul>
        {result.recommendedCourses.map((course) => (
          <li key={course.title}>{course.title}</li>
        ))}
      </ul>

      <h3 className="mt-8 font-bold text-xl">Learning Roadmap</h3>

      <div className="mt-4">
        {result.roadmap.map((item) => (
          <RoadmapCard key={item.step} item={item} />
        ))}
      </div>

      <div className="mt-8">
        <h2
          className="
    text-xl
    font-bold"
        >
          Recommendation Analysis
        </h2>

        <p
          className="
    mt-3
    bg-gray-100
    p-4
    rounded-lg"
        >
          {result.analysis}
        </p>
      </div>
    </div>
  );
}
