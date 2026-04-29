const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const { ownerName, serviceId } = req.query;

    let sql = `
      SELECT 
        history_id AS id,
        date,
        pet_name AS pet,
        owner_name AS ownerName,
        service_id AS serviceId,
        outcome
      FROM history
    `;

    const conditions = [];
    const params = [];

    if (ownerName) {
      conditions.push("owner_name = ?");
      params.push(ownerName);
    }

    if (serviceId && serviceId !== "all") {
      conditions.push("service_id = ?");
      params.push(Number(serviceId));
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += " ORDER BY date DESC, history_id DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("History route error:", error);
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

module.exports = router;