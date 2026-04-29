import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../middlewares/auth";
import { reviewService } from "./reviews.service";

const createReview = async (
  req: Request,
  res: Response,
) => {
  try {
    const result = await reviewService.createReview(req.user!.id, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
  }
};

const getMealReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await reviewService.getMealReviews(
      req.params.mealId as string,
      {
        page,
        limit,
        skip: (page - 1) * limit,
      },
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getMyReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await reviewService.getMyReviews(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isAdmin = req.user!.role === UserRole.ADMIN;
    await reviewService.deleteReview(
      req.params.reviewId as string,
      req.user!.id,
      isAdmin,
    );
    res.status(200).json({ message: "Review deleted successfully." });
  } catch (error) {
    next(error);
  }
};

export const ReviewController = {
  createReview,
  getMealReviews,
  getMyReviews,
  deleteReview,
};
