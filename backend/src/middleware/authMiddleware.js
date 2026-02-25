import { verifyToken } from "../utils/jwt.js";
import { pool } from "../config/db.js";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
   
    const decoded = verifyToken(token);

    const [rows] = await pool.query(
      "SELECT id, name, email, role, subscription, location FROM users WHERE id = ?",
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
