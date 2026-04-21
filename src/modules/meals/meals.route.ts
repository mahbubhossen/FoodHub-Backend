import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { MealController } from "./meals.controller";

const router = Router();

router.get("/", MealController.getAllMeals);
router.get("/:mealId", MealController.getMealById);

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
