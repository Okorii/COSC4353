const bcrypt = require("bcrypt");
const pool = require("../config/db");

const register = async (req, res) => {
  try {
    let { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    email = email.trim().toLowerCase();
    name = name.trim();
    password = password.trim();
    phone = phone ? phone.trim() : null;

    // Check if user already exists
    const [existing] = await pool.query(
      "SELECT * FROM user_credentials WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "Email already registered",
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert into user_credentials
    const [result] = await pool.query(
      `INSERT INTO user_credentials (email, password_hash, role)
       VALUES (?, ?, ?)`,
      [email, password_hash, role || "user"]
    );

    const userId = result.insertId;

    // Insert into customers (NO date_of_birth anymore)
    await pool.query(
      `INSERT INTO customers (user_id, full_name, phone)
       VALUES (?, ?, ?)`,
      [userId, name, phone]
    );

    return res.status(201).json({
      message: "Registration successful",
      user: {
        user_id: userId,
        email,
        name,
        role: role || "user",
        phone,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      error: "Server error during registration",
    });
  }
};

const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    email = email.trim().toLowerCase();
    password = password.trim();

    const [rows] = await pool.query(
      `SELECT uc.user_id, uc.email, uc.password_hash, uc.role, c.full_name, c.phone
       FROM user_credentials uc
       LEFT JOIN customers c ON uc.user_id = c.user_id
       WHERE uc.email = ?`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    return res.status(200).json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Server error during login",
    });
  }
};

module.exports = { register, login };
