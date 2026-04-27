const getMe = (req, res) => {
  const user = req.user;

  res.json({
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || null,
  });
};

const getHistory = (req, res) => {
  res.json({
    history: req.user.history || [],
  });
};

const getNotifications = (req, res) => {
  res.json({
    notifications: req.user.notifications || [],
  });
};

module.exports = { getMe, getHistory, getNotifications };