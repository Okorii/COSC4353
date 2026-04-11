const pool = require("../config/db");

const requireAuth = async (req, res, next) => {
  try {
    const userId = req.header("x-user-id");

    if (!userId) {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const [rows] = await pool.query(
      `SELECT uc.user_id, uc.email, uc.role, c.full_name, c.phone
       FROM user_credentials uc
       LEFT JOIN customers c ON uc.user_id = c.user_id
       WHERE uc.user_id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: "Invalid user",
      });
    }

    const user = rows[0];

    req.user = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      name: user.full_name,
      phone: user.phone,
      history: [],
      notifications: [],
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: "Server error during authentication",
    });
  }
};

module.exports = {
  requireAuth,
};
