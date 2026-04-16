import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { CategoryController } from "./categories.controller";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────
// GET /api/categories               → all categories
// GET /api/categories/:categoryId   → category with its meals

router.get("/", CategoryController.getAllCategories);
router.get("/:categoryId", CategoryController.getCategoryById);

// ─── Admin only ────────────────────────────────────────────────────────────
// POST   /api/categories              → create new category
// PATCH  /api/categories/:categoryId  → edit category
// DELETE /api/categories/:categoryId  → delete category

router.post(
  "/",
  requireAuth(UserRole.ADMIN),
  CategoryController.createCategory,
);
router.patch(
  "/:categoryId",
  requireAuth(UserRole.ADMIN),
  CategoryController.updateCategory,
);
router.delete(
  "/:categoryId",
  requireAuth(UserRole.ADMIN),
  CategoryController.deleteCategory,
);

export const categoryRouter: Router = router;
