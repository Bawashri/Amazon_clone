import { pool } from "../config/db.js";

export const addFeedback = async (req, res, next) => {
  try {
    const { product_id, rating, comment } = req.body;
    if (!product_id || !rating) {
      return res.status(400).json({ message: "product_id and rating are required" });
    }

    await pool.query(
      "INSERT INTO feedback (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)",
      [req.user.id, product_id, rating, comment || null]
    );

    res.status(201).json({ message: "Feedback submitted" });
  } catch (error) {
    next(error);
  }
};

export const getProductFeedback = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.id, f.rating, f.comment, f.created_at, u.name AS user_name
       FROM feedback f
       JOIN users u ON u.id = f.user_id
       WHERE f.product_id = ?
       ORDER BY f.created_at DESC`,
      [req.params.productId]
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};
