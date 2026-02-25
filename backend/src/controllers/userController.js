import { pool } from "../config/db.js";

export const getProfile = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, subscription, location, created_at FROM users WHERE id = ?",
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, location, subscription } = req.body;
    const nextSubscription = subscription && ["NORMAL", "PREMIUM"].includes(subscription) ? subscription : req.user.subscription;

    await pool.query(
      "UPDATE users SET name = COALESCE(?, name), location = COALESCE(?, location), subscription = ? WHERE id = ?",
      [name || null, location || null, nextSubscription, req.user.id]
    );

    const [rows] = await pool.query(
      "SELECT id, name, email, role, subscription, location, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    res.json({ message: "Profile updated", user: rows[0] });
  } catch (error) {
    next(error);
  }
};
