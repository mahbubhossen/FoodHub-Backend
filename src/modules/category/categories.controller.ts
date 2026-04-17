import { NextFunction, Request, Response } from "express";
import { categoryService } from "./categories.service";

const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await categoryService.getAllCategories();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await categoryService.getCategoryById(
      req.params.categoryId as string,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await categoryService.createCategory(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await categoryService.updateCategory(
      req.params.categoryId as string,
      req.body,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await categoryService.deleteCategory(req.params.categoryId as string);
    res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const CategoryController = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
