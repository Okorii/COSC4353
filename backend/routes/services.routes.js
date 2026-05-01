const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all services
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        service_id,
        name AS service_name,
        description,
        duration_minutes AS expected_duration,
        active,
        priority
      FROM services
      ORDER BY service_id ASC`
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// GET one service by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        service_id,
        name AS service_name,
        description,
        duration_minutes AS expected_duration,
        active,
        priority
      FROM services
      WHERE service_id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error fetching service:", err);
    res.status(500).json({ error: "Failed to fetch service" });
  }
});

// CREATE service
router.post("/", async (req, res) => {
  try {
    const { service_name, description, expected_duration, priority = "medium" } = req.body;

    if (!service_name || !expected_duration) {
      return res.status(400).json({
        error: "service_name and expected_duration are required",
      });
    }

    if (service_name.trim().length > 100) {
      return res.status(400).json({
        error: "service_name must be 100 characters or less",
      });
    }

    if (description && description.length > 255) {
      return res.status(400).json({
        error: "description must be 255 characters or less",
      });
    }

    if (isNaN(expected_duration) || Number(expected_duration) <= 0) {
      return res.status(400).json({
        error: "expected_duration must be a positive number",
      });
    }

    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        error: "priority must be low, medium, or high",
      });
    }

    const [existing] = await pool.query(
      "SELECT service_id FROM services WHERE LOWER(name) = LOWER(?)",
      [service_name.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "A service with this name already exists",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO services (name, description, duration_minutes, priority)
       VALUES (?, ?, ?, ?)`,
      [service_name.trim(), description || null, Number(expected_duration), priority]
    );

    res.status(201).json({
      message: "Service added successfully",
      service_id: result.insertId,
    });
  } catch (err) {
    console.error("Error adding service:", err);
    res.status(500).json({ error: "Failed to add service" });
  }
});

// UPDATE service
router.put("/:id", async (req, res) => {
  try {
    const { service_name, description, expected_duration, priority = "medium" } = req.body;

    if (!service_name || !expected_duration) {
      return res.status(400).json({
        error: "service_name and expected_duration are required",
      });
    }

    if (service_name.trim().length > 100) {
      return res.status(400).json({
        error: "service_name must be 100 characters or less",
      });
    }

    if (description && description.length > 255) {
      return res.status(400).json({
        error: "description must be 255 characters or less",
      });
    }

    if (isNaN(expected_duration) || Number(expected_duration) <= 0) {
      return res.status(400).json({
        error: "expected_duration must be a positive number",
      });
    }

    if (!["low", "medium", "high"].includes(priority)) {
      return res.status(400).json({
        error: "priority must be low, medium, or high",
      });
    }

    const [duplicate] = await pool.query(
      `SELECT service_id
       FROM services
       WHERE LOWER(name) = LOWER(?) AND service_id <> ?`,
      [service_name.trim(), req.params.id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        error: "A service with this name already exists",
      });
    }

    const [result] = await pool.query(
      `UPDATE services
       SET name = ?, description = ?, duration_minutes = ?, priority = ?
       WHERE service_id = ?`,
      [
        service_name.trim(),
        description || null,
        Number(expected_duration),
        priority,
        req.params.id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({
      message: "Service updated successfully",
    });
  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ error: "Failed to update service" });
  }
});

// DELETE service
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM services WHERE service_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (err) {
    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(400).json({
        error: "Cannot delete service because it is being used in queue entries",
      });
    }

    console.error("Error deleting service:", err);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

// TOGGLE active
router.patch("/:id/toggle", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT active FROM services WHERE service_id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    const currentValue = rows[0].active;
    const newValue = currentValue ? 0 : 1;

    await pool.query("UPDATE services SET active = ? WHERE service_id = ?", [
      newValue,
      req.params.id,
    ]);

    res.status(200).json({
      message: "Service status updated successfully",
      active: newValue,
    });
  } catch (err) {
    console.error("Error toggling service:", err);
    res.status(500).json({ error: "Failed to toggle service status" });
  }
});

module.exports = router;