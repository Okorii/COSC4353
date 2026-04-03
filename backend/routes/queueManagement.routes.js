const express = require("express");
const router = express.Router();
const pool = require("../db");

const {
  validateQueueEntry,
  estimateWaitTime,
} = require("../utils/queueManagementHelpers");


// GET current queue. returns sorted.
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        qe.entry_id AS id,
        qe.pet_name AS petName,
        qe.owner_name AS ownerName,
        qe.service_id AS serviceId,
        qe.joined_at AS joinedAt,
        qe.status,
        s.priority
      FROM queue_entries qe
      JOIN services s ON qe.service_id = s.service_id
      WHERE qe.status = 'WAITING'
      ORDER BY qe.joined_at ASC
    `);

    const withWaitTimes = rows.map((entry, index, arr) => ({
      ...entry,
      estimatedWaitTime: estimateWaitTime(entry, arr),
    }));

    res.json(withWaitTimes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch queue." });
  }
});

// POST join queue. adds new pet to queue.
router.post("/join", async (req, res) => {
  const errors = validateQueueEntry(req.body);

if (errors.length > 0) {
  return res.status(400).json({ errors });
}
  try {
  const { petName, ownerName, serviceId } = req.body;

  const [result] = await pool.query(
    `
    INSERT INTO queue_entries (pet_name, owner_name, service_id, joined_at, status)
    VALUES (?, ?, ?, NOW(), 'WAITING')
    `,
    [petName, ownerName, serviceId]
  );

  const [rows] = await pool.query(
    `
    SELECT
      qe.entry_id AS id,
      qe.pet_name AS petName,
      qe.owner_name AS ownerName,
      qe.service_id AS serviceId,
      qe.joined_at AS joinedAt,
      qe.status,
      s.priority
    FROM queue_entries qe
    JOIN services s ON qe.service_id = s.service_id
    WHERE qe.entry_id = ?
    `,
    [result.insertId]
);

  res.status(201).json(rows[0]);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Failed to join queue." });
}
  
});

// POST serve next. Removes next pet, marking as served.
router.post("/serve-next", async (req, res) => {
    //earliest arrivals first
  try {
  const [rows] = await pool.query(`
    SELECT
      entry_id AS id,
      pet_name AS petName,
      owner_name AS ownerName,
      service_id AS serviceId,
      joined_at AS joinedAt,
      status
    FROM queue_entries
    WHERE status = 'WAITING'
    ORDER BY joined_at ASC
    LIMIT 1
  `);

  if (rows.length === 0) {
    return res.status(400).json({ error: "No one in queue." });
  }

  const next = rows[0];

  await pool.query(
    `
    UPDATE queue_entries
    SET status = 'SERVING'
    WHERE entry_id = ?
    `,
    [next.id]
  );

  next.status = "SERVING";

  res.json({ message: "Serving next user", served: next });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Failed to serve next user." });
}
});

// DELETE remove from queue. Removes entry by ID.
router.delete("/:id", async (req, res) => {


  try {
  const [rows] = await pool.query(
    `
    SELECT
      entry_id AS id,
      pet_name AS petName,
      owner_name AS ownerName,
      service_id AS serviceId,
      joined_at AS joinedAt,
      status
    FROM queue_entries
    WHERE entry_id = ?
    `,
    [req.params.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Not found." });
  }

  const removed = rows[0];

  await pool.query(
    `
    UPDATE queue_entries
    SET status = 'REMOVED'
    WHERE entry_id = ?
    `,
    [req.params.id]
  );

  removed.status = "REMOVED";

  res.json({ message: "Removed from queue", removed });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Failed to remove queue entry." });
}
});
module.exports = router;