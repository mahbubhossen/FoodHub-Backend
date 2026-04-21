import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { AdminController } from "./admin.controller";

const router = Router();

// All admin routes are protected — ADMIN role only

// ─── Dashboard ─────────────────────────────────────────────────────────────
// GET /api/admin/stats   → platform-wide statistics

router.get(
  "/stats",
  requireAuth(UserRole.ADMIN),
  AdminController.getDashboardStats,
);

// ─── Users ─────────────────────────────────────────────────────────────────
// GET   /api/admin/users              → all users (search, filter by role/status)
// GET   /api/admin/users/:userId      → single user detail with provider profile
// PATCH /api/admin/users/:userId      → suspend or activate a user

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

// ─── Orders ────────────────────────────────────────────────────────────────
// GET /api/admin/orders   → all orders (filter by status, customer, provider)

router.get(
  "/orders",
  requireAuth(UserRole.ADMIN),
  AdminController.getAllOrders,
);

export const adminRouter: Router = router;
