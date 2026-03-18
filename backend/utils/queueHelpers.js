function getServiceById(services, serviceId) {
    return services.find((s) => s.id === serviceId);
  }
  
  function calculateEtaMinutes(queueEntries, services, queueEntryId) {
    const index = queueEntries.findIndex((q) => q.id === queueEntryId);
    if (index === -1) return null;
  
    let total = 0;
  
    for (let i = 0; i < index; i++) {
      const service = getServiceById(services, queueEntries[i].serviceId);
      total += service ? service.durationMinutes : 0;
    }
  
    return total;
  }
  
  function buildQueueStatus(queueEntries, services, notifications, queueEntryId) {
    const entry = queueEntries.find((q) => q.id === queueEntryId);
    if (!entry) return null;
  
    const service = getServiceById(services, entry.serviceId);
    const position = queueEntries.findIndex((q) => q.id === queueEntryId) + 1;
    const totalInQueue = queueEntries.length;
    const etaMinutes = calculateEtaMinutes(queueEntries, services, queueEntryId);
  
    let status = entry.status;
    if (position === 2 && status === "WAITING") {
      status = "ALMOST_READY";
    }
  
    return {
      queueInfo: {
        serviceName: service ? service.name : "Unknown Service",
        petName: entry.petName,
        position,
        totalInQueue,
        etaMinutes,
        status,
        lastUpdated: new Date().toISOString(),
      },
      notifications: notifications
        .filter((n) => n.queueEntryId === queueEntryId)
        .sort((a, b) => new Date(b.time) - new Date(a.time)),
    };
  }
  
  module.exports = {
    buildQueueStatus,
  };