const express = require("express");
const cors = require("cors");

const servicesRoutes = require("./routes/services.routes");
const queueStatusRoutes = require("./routes/queueStatus.routes");
const queueManagementRoutes = require("./routes/queueManagement.routes");
const historyRoutes = require("./routes/history.routes");
const reportsRoutes = require("./routes/reports.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "QueueSmart backend is running" });
});

app.use("/api/services", servicesRoutes);
app.use("/api/queue-entries", queueStatusRoutes);
app.use("/api/queue-management", queueManagementRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/reports", reportsRoutes);

module.exports = app;