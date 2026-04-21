import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { AdminController } from "./admin.controller";

const router = Router();


router.get(
  "/stats",
  requireAuth(UserRole.ADMIN),
  AdminController.getDashboardStats,
);

router.get("/users", requireAuth(UserRole.ADMIN), AdminController.getAllUsers);
router.get(
  "/users/:userId",
  requireAuth(UserRole.ADMIN),
  AdminController.getUserById,
);
router.patch(
  "/users/:userId",
  requireAuth(UserRole.ADMIN),
  AdminController.updateUserStatus,
);


router.get(
  "/orders",
  requireAuth(UserRole.ADMIN),
  AdminController.getAllOrders,
);

export const adminRouter: Router = router;
