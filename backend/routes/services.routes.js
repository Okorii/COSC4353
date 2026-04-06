const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all services
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM Service ORDER BY service_id ASC"
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

// GET one service by id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM Service WHERE service_id = ?",
      [id]
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

// ADD new service
router.post("/", async (req, res) => {
  try {
    const { service_name, description, expected_duration } = req.body;

    if (!service_name || !expected_duration) {
      return res.status(400).json({
        error: "service_name and expected_duration are required"
      });
    }

    if (service_name.length > 100) {
      return res.status(400).json({
        error: "service_name must be 100 characters or less"
      });
    }

    if (description && description.length > 255) {
      return res.status(400).json({
        error: "description must be 255 characters or less"
      });
    }

    if (isNaN(expected_duration) || Number(expected_duration) <= 0) {
      return res.status(400).json({
        error: "expected_duration must be a positive number"
      });
    }

    const [result] = await pool.query(
      `INSERT INTO Service (service_name, description, expected_duration)
       VALUES (?, ?, ?)`,
      [
        service_name,
        description || null,
        Number(expected_duration)
      ]
    );

    res.status(201).json({
      message: "Service added successfully",
      service_id: result.insertId
    });
  } catch (err) {
    console.error("Error adding service:", err);
    res.status(500).json({ error: "Failed to add service" });
  }
});

// UPDATE service
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, description, expected_duration } = req.body;

    if (!service_name || !expected_duration) {
      return res.status(400).json({
        error: "service_name and expected_duration are required"
      });
    }

    if (service_name.length > 100) {
      return res.status(400).json({
        error: "service_name must be 100 characters or less"
      });
    }

    if (description && description.length > 255) {
      return res.status(400).json({
        error: "description must be 255 characters or less"
      });
    }

    if (isNaN(expected_duration) || Number(expected_duration) <= 0) {
      return res.status(400).json({
        error: "expected_duration must be a positive number"
      });
    }

    const [result] = await pool.query(
      `UPDATE Service
       SET service_name = ?, description = ?, expected_duration = ?
       WHERE service_id = ?`,
      [
        service_name,
        description || null,
        Number(expected_duration),
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({ message: "Service updated successfully" });
  } catch (err) {
    console.error("Error updating service:", err);
    res.status(500).json({ error: "Failed to update service" });
  }
});

// DELETE service
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM Service WHERE service_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    console.error("Error deleting service:", err);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

module.exports = router;