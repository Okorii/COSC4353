const express = require("express");
const router = express.Router();
const { fakeAuth } = require("../middleware/authMiddleware");
const {
  getMe,
  getHistory,
  getNotifications
} = require("../controllers/userController");

router.get("/me", fakeAuth, getMe);
router.get("/me/history", fakeAuth, getHistory);
router.get("/me/notifications", fakeAuth, getNotifications);

module.exports = router;
