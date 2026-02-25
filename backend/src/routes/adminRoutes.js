import express from "express";
import { approveOrder, getAllOrders, getPendingOrders, rejectOrder, updateOrderStatus } from "../controllers/adminController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN"));

router.get("/orders", getAllOrders);
router.get("/orders/pending", getPendingOrders);
router.post("/orders/:orderId/approve", approveOrder);
router.post("/orders/:orderId/reject", rejectOrder);
router.patch("/orders/:orderId/status", updateOrderStatus);

export default router;
