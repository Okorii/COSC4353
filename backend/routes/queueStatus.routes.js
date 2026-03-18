const express = require("express");
const router = express.Router();

const services = require("../data/services");
const queueEntries = require("../data/queueEntries");
const notifications = require("../data/notifications");
const { buildQueueStatus } = require("../utils/queueHelpers");

router.get("/:queueEntryId", (req, res) => {
  const result = buildQueueStatus(
    queueEntries,
    services,
    notifications,
    req.params.queueEntryId
  );

  if (!result) {
    return res.status(404).json({ message: "Queue entry not found." });
  }

  res.json(result);
});

router.post("/:queueEntryId/refresh", (req, res) => {
  const entry = queueEntries.find((q) => q.id === req.params.queueEntryId);

  if (!entry) {
    return res.status(404).json({ message: "Queue entry not found." });
  }

  const currentIndex = queueEntries.findIndex((q) => q.id === req.params.queueEntryId);
  const currentPosition = currentIndex + 1;

  if (entry.status === "READY_FOR_PICKUP") {
    const result = buildQueueStatus(
      queueEntries,
      services,
      notifications,
      req.params.queueEntryId
    );
    return res.json(result);
  }

  if (entry.status === "SERVED") {
    entry.status = "READY_FOR_PICKUP";

    notifications.unshift({
      id: Date.now(),
      queueEntryId: entry.id,
      type: "success",
      text: "Ready for pickup! Please come to the front desk.",
      time: new Date().toISOString(),
    });

    const result = buildQueueStatus(
      queueEntries,
      services,
      notifications,
      req.params.queueEntryId
    );
    return res.json(result);
  }

  if (currentPosition > 1) {
    const previousEntry = queueEntries[currentIndex - 1];
    queueEntries[currentIndex - 1] = entry;
    queueEntries[currentIndex] = previousEntry;
  }

  const newIndex = queueEntries.findIndex((q) => q.id === req.params.queueEntryId);
  const newPosition = newIndex + 1;

  if (newPosition >= 3) {
    entry.status = "WAITING";
  } else if (newPosition === 2) {
    if (entry.status !== "ALMOST_READY") {
      notifications.unshift({
        id: Date.now(),
        queueEntryId: entry.id,
        type: "warning",
        text: "You’re next in line. Please be near the store.",
        time: new Date().toISOString(),
      });
    }
  
    entry.status = "ALMOST_READY";
  } else if (newPosition === 1) {
    if (entry.status !== "SERVED") {
      notifications.unshift({
        id: Date.now(),
        queueEntryId: entry.id,
        type: "success",
        text: "It’s your turn! Grooming started! We’ll notify you when your pet is ready for pickup.",
        time: new Date().toISOString(),
      });
    }
  
    entry.status = "SERVED";
  }
  
  const result = buildQueueStatus(
    queueEntries,
    services,
    notifications,
    req.params.queueEntryId
  );
  
  res.json(result);
  });

router.delete("/:queueEntryId", (req, res) => {
  const index = queueEntries.findIndex((q) => q.id === req.params.queueEntryId);

  if (index === -1) {
    return res.status(404).json({ message: "Queue entry not found." });
  }

  queueEntries.splice(index, 1);

  notifications.unshift({
    id: Date.now(),
    queueEntryId: req.params.queueEntryId,
    type: "info",
    text: "You left the queue.",
    time: new Date().toISOString(),
  });

  res.json({ message: "Left queue successfully." });
});

module.exports = router;