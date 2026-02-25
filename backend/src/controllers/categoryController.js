import { pool } from "../config/db.js";

export const listCategories = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT id, name FROM categories ORDER BY id");
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
