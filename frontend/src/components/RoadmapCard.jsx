export default function RoadmapCard({ item }) {
  return (
    <div
      className={`
   p-4
   rounded-xl
   border

   ${item.completed ? "bg-green-100" : "bg-red-100"}
   `}
    >
      <h3>Step {item.step}</h3>

      <p>{item.title}</p>

      <p>{item.completed ? "Completed" : "Need To Learn"}</p>
    </div>
  );
}
