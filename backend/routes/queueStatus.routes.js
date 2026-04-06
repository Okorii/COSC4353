const express = require("express");
const router = express.Router();
const pool = require("../db");

// ===============================
// JOIN QUEUE (create entry)
// ===============================
router.post("/", async (req, res) => {
  try {
    const { queue_id, user_id } = req.body;

    if (!queue_id || !user_id) {
      return res.status(400).json({
        error: "queue_id and user_id are required"
      });
    }

    // calculate next position
    const [countRows] = await pool.query(
      "SELECT COUNT(*) AS count FROM QueueEntry WHERE queue_id = ? AND status = 'waiting'",
      [queue_id]
    );

    const position = countRows[0].count + 1;

    const [result] = await pool.query(
      `INSERT INTO QueueEntry (queue_id, user_id, position)
       VALUES (?, ?, ?)`,
      [queue_id, user_id, position]
    );

    res.status(201).json({
      message: "Joined queue successfully",
      entry_id: result.insertId,
      position
    });
  } catch (err) {
    console.error("Error joining queue:", err);
    res.status(500).json({ error: "Failed to join queue" });
  }
});


// ===============================
// GET QUEUE STATUS (all entries)
// ===============================
router.get("/:queueId", async (req, res) => {
  try {
    const { queueId } = req.params;

    const [rows] = await pool.query(
      `SELECT *
       FROM QueueEntry
       WHERE queue_id = ?
       ORDER BY position ASC`,
      [queueId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching queue:", err);
    res.status(500).json({ error: "Failed to fetch queue" });
  }
});


// ===============================
// UPDATE STATUS (served/canceled)
// ===============================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["waiting", "served", "canceled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status value"
      });
    }

    const [result] = await pool.query(
      "UPDATE QueueEntry SET status = ? WHERE entry_id = ?",
      [status, id]
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


// ===============================
// DELETE ENTRY (optional)
// ===============================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM QueueEntry WHERE entry_id = ?",
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