const express = require("express");
const router = express.Router();
const pool = require("../db");

// JOIN QUEUE
router.post("/", async (req, res) => {
  try {
    const { queue_id, user_id } = req.body;

    if (!queue_id || !user_id) {
      return res.status(400).json({
        error: "queue_id and user_id are required"
      });
    }

    // team schema does not use queue_id/user_id, so map them into queue_entries
    const petName = `Pet ${user_id}`;
    const ownerName = `Owner ${user_id}`;
    const serviceId = Number(queue_id);

    const [result] = await pool.query(
      `INSERT INTO queue_entries (pet_name, owner_name, service_id, joined_at, status)
       VALUES (?, ?, ?, NOW(), 'WAITING')`,
      [petName, ownerName, serviceId]
    );

    res.status(201).json({
      message: "Joined queue successfully",
      entry_id: result.insertId,
      position: result.insertId
    });
  } catch (err) {
    console.error("Error joining queue:", err);
    res.status(500).json({ error: "Failed to join queue" });
  }
});

// GET QUEUE STATUS
router.get("/:queueId", async (req, res) => {
  try {
    const { queueId } = req.params;

    const [rows] = await pool.query(
      `SELECT
         entry_id,
         service_id AS queue_id,
         pet_name AS user_id,
         joined_at AS join_time,
         status
       FROM queue_entries
       WHERE service_id = ?
       ORDER BY joined_at ASC`,
      [queueId]
    );

    const formattedRows = rows.map((row, index) => ({
      ...row,
      position: index + 1,
      status: row.status.toLowerCase()
    }));

    res.status(200).json(formattedRows);
  } catch (err) {
    console.error("Error fetching queue:", err);
    res.status(500).json({ error: "Failed to fetch queue" });
  }
});

// UPDATE STATUS
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusMap = {
      waiting: "WAITING",
      served: "SERVED",
      canceled: "REMOVED"
    };

    if (!statusMap[status]) {
      return res.status(400).json({
        error: "Invalid status value"
      });
    }

    const [result] = await pool.query(
      "UPDATE queue_entries SET status = ? WHERE entry_id = ?",
      [statusMap[status], id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Queue entry not found"
      });
    }

    res.status(200).json({
      message: "Status updated successfully"
    });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// DELETE ENTRY
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM queue_entries WHERE entry_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Queue entry not found"
      });
    }

    res.status(200).json({
      message: "Queue entry deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting entry:", err);
    res.status(500).json({ error: "Failed to delete entry" });
  }
});

module.exports = router;