const express = require("express");
const router = express.Router();

const services = require("../data/services");
const validateService = require("../utils/validateService");

router.get("/", (req, res) => {
  res.json(services);
});

router.post("/", (req, res) => {
  const errors = validateService(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const newService = {
    id: services.length ? Math.max(...services.map((s) => s.id)) + 1 : 1,
    name: req.body.name.trim(),
    description: req.body.description.trim(),
    durationMinutes: Number(req.body.durationMinutes),
    priority: req.body.priority,
    active: Boolean(req.body.active),
    updatedAt: new Date().toISOString(),
  };

  services.unshift(newService);
  res.status(201).json(newService);
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = services.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Service not found." });
  }

  const errors = validateService(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  services[index] = {
    ...services[index],
    name: req.body.name.trim(),
    description: req.body.description.trim(),
    durationMinutes: Number(req.body.durationMinutes),
    priority: req.body.priority,
    active: Boolean(req.body.active),
    updatedAt: new Date().toISOString(),
  };

  res.json(services[index]);
});

router.patch("/:id/toggle-active", (req, res) => {
  const id = Number(req.params.id);
  const service = services.find((s) => s.id === id);

  if (!service) {
    return res.status(404).json({ message: "Service not found." });
  }

  service.active = !service.active;
  service.updatedAt = new Date().toISOString();

  res.json(service);
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = services.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Service not found." });
  }

  const removed = services.splice(index, 1)[0];
  res.json({ message: "Service removed.", service: removed });
});

module.exports = router;