const express = require("express");
const cors = require("cors");

const app = express();

const recommendationRoutes = require("./routes/recommendationRoutes");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Backend Running",
  });
});

app.get("/test", (req, res) => {
  res.json({
    message: "test ok",
  });
});

app.use("/api", recommendationRoutes);
console.log("Route loaded");

app.listen(5000, () => {
  console.log("Server running");
});
