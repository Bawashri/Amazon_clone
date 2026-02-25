import express from "express";
import { addFeedback, getProductFeedback } from "../controllers/feedbackController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/product/:productId", getProductFeedback);
router.post("/", authenticate, addFeedback);

export default router;
