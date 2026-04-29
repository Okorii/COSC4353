const express = require("express");
const router = express.Router();
const pool = require("../db");

// admin reporting summary
router.get("/summary", async (req, res) => {
  try {
    const [queueStats] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM history) AS total_queue_entries,
        (SELECT COUNT(*) FROM history WHERE outcome = 'completed') AS users_served,
        (SELECT COUNT(*) FROM queue_entries WHERE status = 'WAITING') AS currently_waiting,
        (SELECT COUNT(*) FROM history WHERE outcome = 'removed') AS users_removed
    `);

    const [serviceActivity] = await pool.query(`
      SELECT
        s.service_id,
        s.name AS service_name,
        COUNT(qe.entry_id) AS queue_count
      FROM services s
      LEFT JOIN queue_entries qe ON s.service_id = qe.service_id
      GROUP BY s.service_id, s.name
      ORDER BY queue_count DESC
    `);

    const [historyRows] = await pool.query(`
      SELECT
        h.history_id AS id,
        h.date,
        h.pet_name,
        h.service_id,
        s.name AS service_name,
        h.outcome
      FROM history h
      LEFT JOIN services s ON h.service_id = s.service_id
      ORDER BY h.date DESC, h.history_id DESC
      LIMIT 50
    `);

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
    const [statsRows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM history) AS total_queue_entries,
        (SELECT COUNT(*) FROM history WHERE outcome = 'completed') AS pets_served,
        (SELECT COUNT(*) FROM queue_entries WHERE status = 'WAITING') AS currently_waiting,
        (SELECT COUNT(*) FROM history WHERE outcome = 'removed') AS removed,
        (SELECT ROUND(AVG(duration_minutes), 1) FROM services) AS avg_service_time
    `);

    const [serviceRows] = await pool.query(`
      SELECT
        s.service_id,
        s.name AS service_name,
        COUNT(qe.entry_id) AS queue_count
      FROM services s
      LEFT JOIN queue_entries qe ON s.service_id = qe.service_id
      GROUP BY s.service_id, s.name
      ORDER BY queue_count DESC
    `);

    const [historyRows] = await pool.query(`
      SELECT
        h.history_id,
        h.date,
        h.pet_name,
        s.name AS service_name,
        h.outcome
      FROM history h
      LEFT JOIN services s ON h.service_id = s.service_id
      ORDER BY h.date DESC, h.history_id DESC
    `);

    const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

    let csv = "QueueSmart Report\n\n";

    csv += "Queue Usage Statistics\n";
    csv += "Total Queue Entries,Pets Served,Currently Waiting,Removed,Average Service Time (min)\n";
    csv += [
      statsRows[0].total_queue_entries,
      statsRows[0].pets_served,
      statsRows[0].currently_waiting,
      statsRows[0].removed,
      statsRows[0].avg_service_time,
    ].join(",") + "\n\n";

    csv += "Service Activity\n";
    csv += "Service ID,Service Name,Queue Count\n";
    serviceRows.forEach((row) => {
      csv += [
        row.service_id,
        escapeCsv(row.service_name),
        row.queue_count,
      ].join(",") + "\n";
    });

    csv += "\nQueue Participation History\n";
    csv += "History ID,Date,Pet Name,Service,Outcome\n";

    historyRows.forEach((row) => {
      csv += [
        row.history_id,
        escapeCsv(
          new Date(row.date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        ),
        escapeCsv(row.pet_name),
        escapeCsv(row.service_name),
        escapeCsv(row.outcome),
      ].join(",") + "\n";
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