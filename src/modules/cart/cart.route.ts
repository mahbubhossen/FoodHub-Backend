import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { CartController } from "./cart.controller";

const router = Router();

// All cart routes are customer-only
// GET    /api/cart                       → view cart
// POST   /api/cart                       → add item to cart
// PATCH  /api/cart/:cartItemId           → update item quantity
// DELETE /api/cart/:cartItemId           → remove single item
// DELETE /api/cart                       → clear entire cart

router.get("/", requireAuth(UserRole.CUSTOMER), CartController.getCart);
router.post("/", requireAuth(UserRole.CUSTOMER), CartController.addToCart);
router.patch(
  "/:cartItemId",
  requireAuth(UserRole.CUSTOMER),
  CartController.updateCartItem,
);
router.delete(
  "/clear",
  requireAuth(UserRole.CUSTOMER),
  CartController.clearCart,
);
router.delete(
  "/:cartItemId",
  requireAuth(UserRole.CUSTOMER),
  CartController.removeCartItem,
);

export const cartRouter: Router = router;
