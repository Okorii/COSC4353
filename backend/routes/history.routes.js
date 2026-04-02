const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const { serviceId } = req.query;

    let sql = `
      SELECT 
        history_id AS id,
        date,
        pet_name AS pet,
        groomer_id AS groomerId,
        service_id AS serviceId,
        outcome
      FROM history
    `;

    const params = [];

    if (serviceId && serviceId !== "all") {
      sql += " WHERE service_id = ?";
      params.push(Number(serviceId));
    }

    sql += " ORDER BY date DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("History route error:", error);
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

module.exports = router;