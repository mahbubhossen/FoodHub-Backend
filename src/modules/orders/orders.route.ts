import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { OrderController } from "./orders.controller";

const router = Router();

// ─── Customer ──────────────────────────────────────────────────────────────
// POST   /api/orders                  → place order (from cart)
// GET    /api/orders/my               → customer's order history
// GET    /api/orders/:orderId         → single order detail
// PATCH  /api/orders/:orderId/cancel  → cancel a PLACED order

router.post("/", requireAuth(UserRole.CUSTOMER), OrderController.createOrder);
router.get("/my", requireAuth(UserRole.CUSTOMER), OrderController.getMyOrders);
router.patch(
  "/:orderId/cancel",
  requireAuth(UserRole.CUSTOMER),
  OrderController.cancelOrder,
);

// ─── Provider ──────────────────────────────────────────────────────────────
// GET   /api/orders/provider            → all incoming orders for provider
// PATCH /api/orders/provider/:orderId   → update order status

router.get(
  "/provider",
  requireAuth(UserRole.PROVIDER),
  OrderController.getProviderOrders,
);
router.patch(
  "/provider/:orderId/status",
  requireAuth(UserRole.PROVIDER),
  OrderController.updateOrderStatus,
);

// ─── Shared (customer + provider + admin can view) ─────────────────────────
// GET /api/orders/:orderId

router.get(
  "/:orderId",
  requireAuth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  OrderController.getOrderById,
);

export const orderRouter: Router = router;
