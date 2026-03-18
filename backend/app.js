const express = require("express");
const cors = require("cors");

const servicesRoutes = require("./routes/services.routes");
const queueStatusRoutes = require("./routes/queueStatus.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "QueueSmart backend is running" });
});

app.use("/api/services", servicesRoutes);
app.use("/api/queue-status", queueStatusRoutes);

module.exports = app;