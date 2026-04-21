import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { ReviewController } from "./reviews.controller";

const router = Router();

router.get("/meal/:mealId", ReviewController.getMealReviews);

router.post("/", requireAuth(UserRole.CUSTOMER), ReviewController.createReview);
router.get(
  "/my",
  requireAuth(UserRole.CUSTOMER),
  ReviewController.getMyReviews,
);

// ─── Customer (own) or Admin ───────────────────────────────────────────────
// DELETE /api/reviews/:reviewId   → delete a review

router.delete(
  "/:reviewId",
  requireAuth(UserRole.CUSTOMER, UserRole.ADMIN),
  ReviewController.deleteReview,
);

export const reviewRouter: Router = router;
