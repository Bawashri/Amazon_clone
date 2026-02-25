import { pool } from "../config/db.js";

export const getCart = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.stock
       FROM cart c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    const [existing] = await pool.query(
      "SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?",
      [req.user.id, product_id]
    );

    if (existing.length) {
      await pool.query("UPDATE cart SET quantity = quantity + ? WHERE id = ?", [quantity, existing[0].id]);
    } else {
      await pool.query("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)", [req.user.id, product_id, quantity]);
    }

    res.status(201).json({ message: "Added to cart" });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    await pool.query("UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?", [quantity, req.params.id, req.user.id]);
    res.json({ message: "Cart updated" });
  } catch (error) {
    next(error);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    await pool.query("DELETE FROM cart WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ message: "Removed from cart" });
  } catch (error) {
    next(error);
  }
};
