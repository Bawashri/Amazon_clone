import { pool } from "../config/db.js";
import { notifyUserStatusChange } from "../services/notificationService.js";

export const getPendingOrders = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.user_id, u.name AS user_name, u.subscription, o.product_id, o.quantity, p.name AS product_name,
              o.status, o.expected_delivery, o.created_at
       FROM orders o
       JOIN users u ON u.id = o.user_id
       JOIN products p ON p.id = o.product_id
       WHERE o.status = 'PENDING'
       ORDER BY o.created_at ASC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.user_id, u.name AS user_name, u.subscription, o.product_id, o.quantity, p.name AS product_name,
              o.status, o.expected_delivery, o.created_at
       FROM orders o
       JOIN users u ON u.id = o.user_id
       JOIN products p ON p.id = o.product_id
       ORDER BY o.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const approveOrder = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    // Lock row + write to approved_orders atomically to avoid partial states.
    await connection.beginTransaction();

    const [orders] = await connection.query(
      "SELECT id, user_id, status FROM orders WHERE id = ? FOR UPDATE",
      [req.params.orderId]
    );

    if (!orders.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];
    if (order.status !== "PENDING") {
      await connection.rollback();
      return res.status(400).json({ message: "Only PENDING orders can be approved" });
    }

    await connection.query("UPDATE orders SET status = 'APPROVED' WHERE id = ?", [req.params.orderId]);
    await connection.query(
      "INSERT INTO approved_orders (order_id, approved_by) VALUES (?, 'ADMIN')",
      [req.params.orderId]
    );

    await connection.commit();
    notifyUserStatusChange(order.user_id, order.id, "APPROVED");

    res.json({ message: "Order approved" });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const rejectOrder = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { reason = "Not specified" } = req.body;

    // Lock row + write rejection audit atomically.
    await connection.beginTransaction();

    const [orders] = await connection.query(
      "SELECT id, user_id, status FROM orders WHERE id = ? FOR UPDATE",
      [req.params.orderId]
    );

    if (!orders.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];
    if (order.status !== "PENDING") {
      await connection.rollback();
      return res.status(400).json({ message: "Only PENDING orders can be rejected" });
    }

    await connection.query("UPDATE orders SET status = 'REJECTED' WHERE id = ?", [req.params.orderId]);
    await connection.query(
      "INSERT INTO rejected_orders (order_id, reason) VALUES (?, ?)",
      [req.params.orderId, reason]
    );

    await connection.commit();
    notifyUserStatusChange(order.user_id, order.id, "REJECTED");

    res.json({ message: "Order rejected" });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["SHIPPED", "DELIVERED"].includes(status)) {
      return res.status(400).json({ message: "Status must be SHIPPED or DELIVERED" });
    }

    const [orders] = await pool.query("SELECT id, user_id, status FROM orders WHERE id = ?", [req.params.orderId]);
    if (!orders.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    const current = orders[0].status;
    if ((status === "SHIPPED" && current !== "APPROVED") || (status === "DELIVERED" && current !== "SHIPPED")) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.orderId]);
    notifyUserStatusChange(orders[0].user_id, req.params.orderId, status);

    res.json({ message: `Order updated to ${status}` });
  } catch (error) {
    next(error);
  }
};
