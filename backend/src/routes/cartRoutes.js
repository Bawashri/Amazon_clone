import express from "express";
import { addToCart, getCart, removeCartItem, updateCartItem } from "../controllers/cartController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/", getCart);
router.post("/", addToCart);
router.put("/:id", updateCartItem);
router.delete("/:id", removeCartItem);

export default router;
