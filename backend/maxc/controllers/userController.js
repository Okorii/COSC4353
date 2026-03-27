const getMe = (req, res) => {
  const user = req.user;

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    queueStatus: user.queueStatus
  });
};

const getHistory = (req, res) => {
  res.json({
    history: req.user.history
  });
};

const getNotifications = (req, res) => {
  res.json({
    notifications: req.user.notifications
  });
};

module.exports = { getMe, getHistory, getNotifications };