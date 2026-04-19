import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { MealController } from "./meals.controller";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────
// GET /api/meals                 → browse all available meals (with filters)
// GET /api/meals/:mealId         → single meal details

router.get("/", MealController.getAllMeals);
router.get("/:mealId", MealController.getMealById);

// ─── Provider (own meals management) ───────────────────────────────────────
// GET    /api/meals/provider/my-meals   → list own restaurant's meals
// POST   /api/meals/provider            → add new meal
// PUT    /api/meals/provider/:mealId    → edit meal
// DELETE /api/meals/provider/:mealId    → remove meal

router.get(
  "/provider/my-meals",
  requireAuth(UserRole.PROVIDER),
  MealController.getProviderMeals,
);
router.post(
  "/provider",
  requireAuth(UserRole.PROVIDER),
  MealController.createMeal,
);
router.put(
  "/provider/:mealId",
  requireAuth(UserRole.PROVIDER),
  MealController.updateMeal,
);
router.delete(
  "/provider/:mealId",
  requireAuth(UserRole.PROVIDER),
  MealController.deleteMeal,
);

export const mealRouter: Router = router;
