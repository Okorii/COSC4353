//validates entry before actually adding to system
function validateQueueEntry(entry) {
  const errors = [];

  if (!entry.petName || typeof entry.petName !== "string") {
    errors.push("Pet name is required.");
  }

  if (!entry.ownerName || typeof entry.ownerName !== "string") {
    errors.push("Owner name is required.");
  }

  if (!entry.serviceId) {
    errors.push("Service ID is required.");
  }
  //empty if everything is valid
  return errors;
}
//sorts based on arrival time
function sortQueue(entries) {
  return [...entries].sort(
    (a, b) => new Date(a.joinedAt) - new Date(b.joinedAt)
  );
}
//Estimated service durations
const serviceDurations = {
  1: 20,
  2: 30,
  3: 60,
};
//Calculates wait time based on queue
function estimateWaitTime(entry, sortedQueue) {
  let total = 0;

  for (const item of sortedQueue) {
    if (item.id === entry.id) break;
    //adds service duration of each entry
    total += serviceDurations[item.serviceId] || 30;
  }
  //total wait time
  return total;
}
//exporting purposes
module.exports = {
  validateQueueEntry,
  sortQueue,
  estimateWaitTime,
};