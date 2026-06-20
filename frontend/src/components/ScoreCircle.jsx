import { CircularProgressbar } from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

export default function ScoreCircle({ score }) {
  return (
    <div
      className="
   w-40
   h-40
   "
    >
      <CircularProgressbar value={score} text={`${score}%`} />
    </div>
  );
}
