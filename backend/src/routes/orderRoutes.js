import express from "express";
import { buyNow, getMyOrders, getRejectedOrders, trackOrder } from "../controllers/orderController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { allowSubscriptions } from "../middleware/subscriptionMiddleware.js";

const router = express.Router();

router.use(authenticate);
router.post("/buy", allowSubscriptions("NORMAL", "PREMIUM"), buyNow);
router.get("/", getMyOrders);
router.get("/my", getMyOrders);
router.get("/rejected", getRejectedOrders);
router.get("/:id", trackOrder);

export default router;
