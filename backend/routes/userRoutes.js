const express = require("express");
const router = express.Router();

const { getMe, getHistory, getNotifications } = require("../controllers/userController");
const { requireAuth } = require("../middleware/authMiddleware");

router.get("/me", requireAuth, getMe);
router.get("/me/history", requireAuth, getHistory);
router.get("/me/notifications", requireAuth, getNotifications);

module.exports = router;