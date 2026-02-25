import express from "express";
import {
  createProduct,
  deleteProduct,
  getProductById,
  listProducts,
  updateProduct
} from "../controllers/productController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/:id", getProductById);

router.post("/", authenticate, authorizeRoles("ADMIN"), createProduct);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateProduct);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteProduct);

export default router;
