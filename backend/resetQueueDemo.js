//only for testing purposes. schema.sql

const pool = require("./db");

async function resetQueue() {
  try {
    await pool.query("USE queuesmart");
    await pool.query("DELETE FROM queue_entries");

    await pool.query(`
      INSERT INTO queue_entries (pet_name, owner_name, service_id, joined_at, status)
      VALUES
      ('Coco', 'Maria Garcia', 1, NOW(), 'WAITING'),
      ('Rocky', 'Luis Perez', 2, NOW(), 'WAITING'),
      ('Luna', 'Billy Jones', 3, NOW(), 'WAITING'),
      ('Chucho', 'Manuel Avila', 4, NOW(), 'WAITING')
    `);

    const [rows] = await pool.query("SELECT * FROM queue_entries");
    console.log("Queue reset successful:");
    console.table(rows);
  } catch (error) {
    console.error("Failed to reset queue:", error);
  } finally {
    await pool.end();
  }
}

resetQueue();