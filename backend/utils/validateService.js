function validateService(service) {
    const errors = {};
  
    const name = (service.name || "").trim();
    const description = (service.description || "").trim();
    const duration = Number(service.durationMinutes);
  
    if (!name) {
      errors.name = "Service name is required.";
    } else if (name.length > 100) {
      errors.name = "Service name must be 100 characters or less.";
    }
  
    if (!description) {
      errors.description = "Description is required.";
    }
  
    if (
      service.durationMinutes === "" ||
      service.durationMinutes === undefined ||
      service.durationMinutes === null
    ) {
      errors.durationMinutes = "Expected duration (minutes) is required.";
    } else if (!Number.isInteger(duration)) {
      errors.durationMinutes = "Duration must be a whole number (minutes).";
    } else if (duration <= 0) {
      errors.durationMinutes = "Duration must be greater than 0 minutes.";
    } else if (duration > 600) {
      errors.durationMinutes = "Duration seems too large (max 600 minutes).";
    }
  
    if (!["low", "medium", "high"].includes(service.priority)) {
      errors.priority = "Priority must be low, medium, or high.";
    }
  
    return errors;
  }
  
  module.exports = validateService;