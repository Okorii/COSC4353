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
        DATE_FORMAT(CONVERT_TZ(qe.joined_at, '+00:00', '-05:00'), '%H:%i') AS startTime,
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
  const { petName, ownerName, serviceId} = req.body;

    if (!petName) {
      return res.status(400).json({ error: "Pet Name is required" });
    }

    if (!ownerName) {
      return res.status(400).json({ error: "Owner Name is required" });
    }

    if (!serviceId) {
      return res.status(400).json({ error: "Service Id is required" });
    }

  try {

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

router.post("/leave", async (req, res) => {
  const { petName, ownerName } = req.body;

  if (!petName || !ownerName) {
    return res.status(400).json({ error: "pet_name and owner_name are required" });
  }

  try {
    const [result] = await pool.query(
      `
      DELETE FROM queue_entries
      WHERE pet_name = ? AND owner_name = ? AND status = 'WAITING'
      LIMIT 1
      `,
      [petName, ownerName]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Queue entry not found" });
    }

    res.status(200).json({ message: "Left queue successfully" });
  } catch (err) {
    console.error("Error leaving queue:", err);
    res.status(500).json({ error: "Failed to leave queue" });
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
    SET status = 'SERVED'
    WHERE entry_id = ?
    `,
    [next.id]
  );
  await pool.query(
  `
  INSERT INTO history (pet_name, owner_name, service_id, outcome, date)
  VALUES (?, ?, ?, 'completed', NOW())
  `,
  [next.petName, next.ownerName, next.serviceId]
);

  next.status = "SERVED";

  res.json({ message: "Serving next user", served: next });
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Failed to serve next user." });
}
});

// PUT mark pet as ready for pickup.
router.put("/:id/ready", async (req, res) => {
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
      return res.status(404).json({ error: "Queue entry not found." });
    }

    await pool.query(
      `
      UPDATE queue_entries
      SET status = 'SERVED'
      WHERE entry_id = ?
      `,
      [req.params.id]
    );

    const ready = rows[0];
    ready.status = "SERVED";

    // insert into history
    await pool.query(
      `
      INSERT INTO history (pet_name, owner_name, service_id, outcome, date)
      VALUES (?, ?, ?, ?, NOW())
      `,
      [
        ready.petName,
        ready.ownerName,
        ready.serviceId,
        "completed",
      ]
    );


    res.json({
      message: `${ready.petName} is ready for pickup.`,
      ready,
    });
  } catch (error) {
    console.error("Ready route error:", error);
    res.status(500).json({ error: "Failed to mark pet as ready." });
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
  await pool.query(
  `
  INSERT INTO history (pet_name, owner_name, service_id, outcome, date)
  VALUES (?, ?, ?, ?, NOW())
  `,
  [
    removed.petName,
    removed.ownerName,
    removed.serviceId,
    "removed",
  ]
);


  res.json({ message: "Removed from queue", removed });

} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Failed to remove queue entry." });
}
});

// reorder queue entries by swapping join times
router.put("/reorder", async (req, res) => {
  const { firstId, secondId } = req.body;

  if (!firstId || !secondId) {
    return res.status(400).json({ error: "firstId and secondId are required" });
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT entry_id, joined_at
      FROM queue_entries
      WHERE entry_id IN (?, ?)
      `,
      [firstId, secondId]
    );

    if (rows.length !== 2) {
      return res.status(404).json({ error: "Queue entries not found" });
    }

    const first = rows.find((row) => Number(row.entry_id) === Number(firstId));
    const second = rows.find((row) => Number(row.entry_id) === Number(secondId));

    await pool.query(
      `
      UPDATE queue_entries
      SET joined_at = ?
      WHERE entry_id = ?
      `,
      [second.joined_at, firstId]
    );

    await pool.query(
      `
      UPDATE queue_entries
      SET joined_at = ?
      WHERE entry_id = ?
      `,
      [first.joined_at, secondId]
    );

    res.json({ message: "Queue order updated." });
  } catch (error) {
    console.error("Reorder queue error:", error);
    res.status(500).json({ error: "Failed to reorder queue." });
  }
});



module.exports = router;
