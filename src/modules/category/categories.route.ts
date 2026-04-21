import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { CategoryController } from "./categories.controller";

const router = Router();

router.get("/", CategoryController.getAllCategories);
router.get("/:categoryId", CategoryController.getCategoryById);

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
