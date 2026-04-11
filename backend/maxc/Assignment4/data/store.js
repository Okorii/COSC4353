const users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
    history: [],
    notifications: [],
    queueStatus: {
      position: 0,
      peopleAhead: 0,
      waitTime: "0 min",
      serviceType: "None"
    }
  }
];

module.exports = { users };
