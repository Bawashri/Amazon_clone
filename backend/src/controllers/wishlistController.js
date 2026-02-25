import { pool } from "../config/db.js";

export const getWishlist = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT w.id, p.id AS product_id, p.name, p.price, p.image_url
       FROM wishlist w
       JOIN products p ON p.id = w.product_id
       WHERE w.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { product_id } = req.body;
    await pool.query(
      "INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)",
      [req.user.id, product_id]
    );
    res.status(201).json({ message: "Added to wishlist" });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    await pool.query("DELETE FROM wishlist WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    next(error);
  }
};
