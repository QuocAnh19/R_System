export default function CareerCard({
  title,
  selected,
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className={`
        p-6
        border
        rounded-xl
        cursor-pointer
        transition

        ${
          selected
          ? "bg-blue-500 text-white"
          : "bg-white"
        }
      `}
    >
      <h3>
        {title}
      </h3>
    </div>
  );
}