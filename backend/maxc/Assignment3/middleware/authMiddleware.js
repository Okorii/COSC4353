const { users } = require("../data/store");

const fakeAuth = (req, res, next) => {
  const rawUserId = req.headers["x-user-id"];
  const userId = Number(rawUserId);

  if (!rawUserId) {
    return res.status(401).json({ error: "Missing x-user-id header" });
  }

  if (!Number.isInteger(userId)) {
    return res.status(401).json({ error: "Invalid x-user-id header" });
  }

  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  req.user = user;
  next();
};

module.exports = { fakeAuth };
