import { pool } from "../config/db.js";

const buildPriceFilter = (minPrice, maxPrice, params) => {
  if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
    params.push(Number(minPrice));
    return " AND p.price >= ?";
  }
  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
    params.push(Number(maxPrice));
    return " AND p.price <= ?";
  }
  return "";
};

export const listProducts = async (req, res, next) => {
  try {
    const { search = "", categoryId, minPrice, maxPrice } = req.query;

    let query = `
      SELECT p.id, p.name, p.description, p.price, p.stock, p.image_url, c.id AS category_id, c.name AS category_name
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.name LIKE ?
    `;

    const params = [`%${search}%`];

    if (categoryId) {
      query += " AND p.category_id = ?";
      params.push(categoryId);
    }

    if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
      query += " AND p.price >= ?";
      params.push(Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
      query += " AND p.price <= ?";
      params.push(Number(maxPrice));
    }
    query += " ORDER BY p.id";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.stock, p.image_url, c.id AS category_id, c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category_id, stock, image_url } = req.body;
    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, category_id, stock, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price, category_id, stock, image_url || null]
    );

    res.status(201).json({ message: "Product created", id: result.insertId });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { name, description, price, category_id, stock, image_url } = req.body;

    await pool.query(
      `UPDATE products
       SET name = COALESCE(?, name),
           description = COALESCE(?, description),
           price = COALESCE(?, price),
           category_id = COALESCE(?, category_id),
           stock = COALESCE(?, stock),
           image_url = COALESCE(?, image_url)
       WHERE id = ?`,
      [name || null, description || null, price ?? null, category_id ?? null, stock ?? null, image_url || null, req.params.id]
    );

    res.json({ message: "Product updated" });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};
