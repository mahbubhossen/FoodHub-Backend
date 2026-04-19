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

    const result = await mealService.getAllMeals({
      search: req.query.search as string | undefined ,
      categoryId: req.query.categoryId as string | undefined,
      providerId: req.query.providerId as string | undefined,
      dietaryTags: req.query.dietaryTags as string | undefined,
      minPrice: req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined,
      maxPrice: req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined,
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
    const result = await mealService.getMealById(req.params.mealId);
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
      req.params.mealId,
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
    await mealService.deleteMeal(req.params.mealId, req.user!.id);
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
