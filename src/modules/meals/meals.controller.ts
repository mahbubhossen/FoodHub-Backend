import { NextFunction, Request, Response } from "express";
import { mealService } from "./meals.service";

const getAllMeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const validSortFields = ["price", "name", "createdAt"];
    const sortBy = validSortFields.includes(req.query.sortBy as string)
      ? (req.query.sortBy as string)
      : "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? "asc" : "desc";

    const { search, categoryId, providerId, dietaryTags, minPrice, maxPrice } =
      req.query;

    const result = await mealService.getAllMeals({
      ...(search && { search: search as string }),
      ...(categoryId && { categoryId: categoryId as string }),
      ...(providerId && { providerId: providerId as string }),
      ...(dietaryTags && { dietaryTags: dietaryTags as string }),
      ...(minPrice && { minPrice: parseFloat(minPrice as string) }),
      ...(maxPrice && { maxPrice: parseFloat(maxPrice as string) }),
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getMealById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mealService.getMealById(req.params.mealId as string);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mealService.createMeal(req.body, req.user!.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await mealService.updateMeal(
      req.params.mealId as string,
      req.body,
      req.user!.id,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteMeal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await mealService.deleteMeal(req.params.mealId as string, req.user!.id);
    res.status(200).json({ message: "Meal deleted successfully." });
  } catch (error) {
    next(error);
  }
};

const getProviderMeals = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await mealService.getProviderMeals(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const MealController = {
  getAllMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  getProviderMeals,
};
