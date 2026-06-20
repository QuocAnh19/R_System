export default function SkillCard({
  skill,
  selected,
  onClick
}) {

  return (
    <button
      onClick={onClick}
      className={`
        px-4
        py-2
        rounded-full
        border

        ${
          selected
          ? "bg-green-500 text-white"
          : ""
        }
      `}
    >
      {skill}
    </button>
  );
}