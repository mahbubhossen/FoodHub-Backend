import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { OrderController } from "./orders.controller";

const router = Router();

router.post("/", requireAuth(UserRole.CUSTOMER), OrderController.createOrder);
router.get("/my", requireAuth(UserRole.CUSTOMER), OrderController.getMyOrders);
router.patch(
  "/:orderId/cancel",
  requireAuth(UserRole.CUSTOMER),
  OrderController.cancelOrder,
);

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

router.get(
  "/:orderId",
  requireAuth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  OrderController.getOrderById,
);

export const orderRouter: Router = router;
