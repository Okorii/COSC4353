const express = require("express");
const router = express.Router();
const pool = require("../db");

// admin reporting summary
router.get("/summary", async (req, res) => {
  try {
    const { startDate, endDate, serviceId } = req.query;

    const conditions = [];
    const params = [];

    if (startDate) {
      conditions.push("qe.joined_at >= ?");
      params.push(startDate);
    }

    if (endDate) {
      conditions.push("qe.joined_at <= ?");
      params.push(endDate);
    }

    if (serviceId && serviceId !== "all") {
      conditions.push("qe.service_id = ?");
      params.push(serviceId);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [queueStats] = await pool.query(
      `
      SELECT
        COUNT(*) AS total_queue_entries,
        SUM(CASE WHEN status = 'SERVING' THEN 1 ELSE 0 END) AS users_served,
        SUM(CASE WHEN status = 'WAITING' THEN 1 ELSE 0 END) AS currently_waiting,
        SUM(CASE WHEN status = 'REMOVED' THEN 1 ELSE 0 END) AS users_removed
      FROM queue_entries qe
      ${whereClause}
      `,
      params
    );

    const [serviceActivity] = await pool.query(
      `
      SELECT
        s.service_id,
        s.name AS service_name,
        COUNT(qe.entry_id) AS queue_count
      FROM services s
      LEFT JOIN queue_entries qe ON s.service_id = qe.service_id
      ${conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : ""}
      GROUP BY s.service_id, s.name
      ORDER BY queue_count DESC
      `,
      params
    );

    const [historyRows] = await pool.query(
      `
      SELECT
        h.history_id AS id,
        h.date,
        h.pet_name,
        h.groomer_id,
        h.service_id,
        s.name AS service_name,
        h.outcome
      FROM history h
      LEFT JOIN services s ON h.service_id = s.service_id
      ORDER BY h.date DESC
      LIMIT 50
      `
    );

    res.json({
      queueStats: queueStats[0],
      serviceActivity,
      recentHistory: historyRows,
    });
  } catch (error) {
    console.error("Reports summary error:", error);
    res.status(500).json({ error: "Failed to generate report summary." });
  }
});

// CSV export report
router.get("/export/csv", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        qe.entry_id AS queue_id,
        qe.pet_name,
        qe.owner_name,
        s.name AS service_name,
        qe.joined_at,
        qe.status
      FROM queue_entries qe
      JOIN services s ON qe.service_id = s.service_id
      ORDER BY qe.joined_at DESC
    `);

    let csv = "Queue ID,Pet Name,Owner Name,Service,Joined At,Status\n";

    rows.forEach((row) => {
      csv += `${row.queue_id},"${row.pet_name}","${row.owner_name}","${row.service_name}","${row.joined_at}","${row.status}"\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("queuesmart-report.csv");
    res.send(csv);
  } catch (error) {
    console.error("CSV export error:", error);
    res.status(500).json({ error: "Failed to export CSV report." });
  }
});

module.exports = router;