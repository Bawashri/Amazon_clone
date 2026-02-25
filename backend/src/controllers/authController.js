import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { signToken } from "../utils/jwt.js";

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, location, subscription = "NORMAL" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const validSubscription = ["NORMAL", "PREMIUM"].includes(subscription) ? subscription : "NORMAL";

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, subscription, location)
       VALUES (?, ?, ?, 'USER', ?, ?)`,
      [name, email, hashedPassword, validSubscription, location || null]
    );

    const token = signToken({ id: result.insertId, role: "USER" });
    const [users] = await pool.query(
      "SELECT id, name, email, role, subscription, location, created_at FROM users WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ token, user: users[0] });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, password, role, subscription, location FROM users WHERE email = ?",
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ id: user.id, role: user.role });
    delete user.password;

    res.json({ token, user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.json({ message: "Logout successful. Remove token from client storage." });
};
