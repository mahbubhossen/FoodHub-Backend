import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { ReviewController } from "./reviews.controller";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────
// GET /api/reviews/meal/:mealId   → paginated reviews for a specific meal

router.get("/meal/:mealId", ReviewController.getMealReviews);

// ─── Customer ──────────────────────────────────────────────────────────────
// POST   /api/reviews             → submit a review (must be delivered order)
// GET    /api/reviews/my          → customer's own review history

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
