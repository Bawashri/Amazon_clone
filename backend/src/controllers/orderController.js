import { pool } from "../config/db.js";
import { calculateExpectedDelivery } from "../services/deliveryService.js";
import { notifyAdminNewPendingOrder, notifyUserStatusChange } from "../services/notificationService.js";

export const buyNow = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { product_id, quantity, qty } = req.body;
    if (!product_id) return res.status(400).json({ message: "product_id is required" });
    const qtyValue = Math.max(1, Number(quantity ?? qty) || 1);

    
    await connection.beginTransaction();

    const [products] = await connection.query("SELECT id, stock FROM products WHERE id = ? FOR UPDATE", [product_id]);
    if (!products.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Product not found" });
    }

    if (products[0].stock < qtyValue) {
      await connection.rollback();
      return res.status(400).json({ message: "Insufficient stock for requested quantity" });
    }

    
    const initialStatus = req.user.subscription === "PREMIUM" ? "APPROVED" : "PENDING";
    const expectedDelivery = calculateExpectedDelivery(req.user.subscription);

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, product_id, quantity, status, expected_delivery)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, product_id, qtyValue, initialStatus, expectedDelivery]
    );

    if (req.user.subscription === "PREMIUM") {
      await connection.query(
        "INSERT INTO approved_orders (order_id, approved_by) VALUES (?, 'SYSTEM')",
        [orderResult.insertId]
      );
      notifyUserStatusChange(req.user.id, orderResult.insertId, "APPROVED");
    } else {
      
      notifyAdminNewPendingOrder(orderResult.insertId, req.user.id);
    }

    await connection.query("UPDATE products SET stock = stock - ? WHERE id = ?", [qtyValue, product_id]);
    await connection.commit();

    res.status(201).json({
      message: req.user.subscription === "PREMIUM" ? "Order auto-approved for PREMIUM user" : "Order placed and pending approval",
      order_id: orderResult.insertId,
      quantity: qtyValue,
      status: initialStatus,
      expected_delivery: expectedDelivery
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    if (req.user.role === "ADMIN" && req.query.all === "true") {
      const [rows] = await pool.query(
        `SELECT o.id, o.quantity, o.status, o.expected_delivery, o.created_at,
                u.id AS user_id, u.name AS user_name, u.subscription,
                p.id AS product_id, p.name AS product_name, p.price, p.image_url
         FROM orders o
         JOIN users u ON u.id = o.user_id
         JOIN products p ON p.id = o.product_id
         ORDER BY o.created_at DESC`
      );
      return res.json(rows);
    }

    const [rows] = await pool.query(
      `SELECT o.id, o.quantity, o.status, o.expected_delivery, o.created_at,
              p.id AS product_id, p.name AS product_name, p.price, p.image_url
       FROM orders o
       JOIN products p ON p.id = o.product_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const getRejectedOrders = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.order_id, r.rejected_at, r.reason,
              o.quantity, p.name AS product_name, p.price
       FROM rejected_orders r
       JOIN orders o ON o.id = r.order_id
       JOIN products p ON p.id = o.product_id
       WHERE o.user_id = ?
       ORDER BY r.rejected_at DESC`,
      [req.user.id]
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const trackOrder = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.user_id, o.quantity, o.status, o.expected_delivery, o.created_at,
              p.id AS product_id, p.name AS product_name
       FROM orders o
       JOIN products p ON p.id = o.product_id
       WHERE o.id = ?`,
      [req.params.id]
    );

    if (!rows.length) return res.status(404).json({ message: "Order not found" });
    const order = rows[0];

    if (order.user_id !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};
