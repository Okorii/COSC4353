const express = require("express");
const router = express.Router();

const queueEntries = require("../data/queueEntries");
const {validateQueueEntry,sortQueue,estimateWaitTime,
} = require("../utils/queueManagementHelpers");

// GET current queue. returns sorted.
router.get("/", (req, res) => {
  const sorted = sortQueue(queueEntries).map((entry) => ({
    ...entry,
    estimatedWaitTime: estimateWaitTime(entry, sortQueue(queueEntries)),
  }));
  //sending sorted back to frontend.
  res.json(sorted);
});

// POST join queue. adds new pet to queue.
router.post("/join", (req, res) => {
  const errors = validateQueueEntry(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  //using backend format
  const newEntry = {
    id: `q${queueEntries.length + 1}`,
    petName: req.body.petName,
    ownerName: req.body.ownerName,
    serviceId: req.body.serviceId,
    joinedAt: new Date().toISOString(),
    status: "WAITING",
  };
  //storing in memory queue array
  queueEntries.push(newEntry);

  res.status(201).json(newEntry);
});

// POST serve next. Removes next pet, marking as served.
router.post("/serve-next", (req, res) => {
    //earliest arrivals first
  const sorted = sortQueue(queueEntries);
    //incase queue empty
  if (sorted.length === 0) {
    return res.status(400).json({ error: "No one in queue." });
  }
  //next pet to be served
  const next = sorted[0];
  next.status = "SERVING";
  //remove selected pet from active queue
  const index = queueEntries.findIndex((e) => e.id === next.id);
  queueEntries.splice(index, 1);

  res.json({ message: "Serving next user", served: next });
});

// DELETE remove from queue. Removes entry by ID.
router.delete("/:id", (req, res) => {
  const index = queueEntries.findIndex((e) => e.id === req.params.id);
    //Error if does not exist.
  if (index === -1) {
    return res.status(404).json({ error: "Not found." });
  }
  //Remove entry, update status
  const removed = queueEntries.splice(index, 1)[0];
  removed.status = "REMOVED";

  res.json({ message: "Removed from queue", removed });
});

module.exports = router;