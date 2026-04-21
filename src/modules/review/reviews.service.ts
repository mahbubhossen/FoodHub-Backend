import { prisma } from "../../lib/prisma";

const createReview = async (
  userId: string,
  data: { orderId: string; mealId: string; rating: number; comment?: string },
) => {
  const { orderId, mealId, rating, comment } = data;

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }

  // Order must exist and belong to the customer
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { id: true, customerId: true, status: true },
  });

  if (order.customerId !== userId) {
    throw new Error("Forbidden. This order does not belong to you.");
  }

  if (order.status !== "DELIVERED") {
    throw new Error("You can only review after the order has been delivered.");
  }

  // The meal must be part of the order
  const orderItem = await prisma.orderItem.findFirst({
    where: { orderId, mealId },
    select: { id: true },
  });

  if (!orderItem) {
    throw new Error("This meal was not part of the specified order.");
  }

  // Prevent duplicate review for same order + meal
  const existing = await prisma.review.findFirst({
    where: { customerId: userId, orderId, mealId },
  });

  if (existing) {
    throw new Error("You have already reviewed this meal for this order.");
  }

  const commentValue = comment ?? null;

  return prisma.review.create({
    data: {
      customerId: userId,
      orderId,
      mealId,
      rating,
      comment: commentValue,
    },
    include: {
      meal: { select: { id: true, name: true } },
    },
  });
};

const getMealReviews = async (
  mealId: string,
  query: { page: number; limit: number; skip: number },
) => {
  const { page, limit, skip } = query;

  const [data, total, avgRating] = await Promise.all([
    prisma.review.findMany({
      where: { mealId },
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        customerId: true,
        createdAt: true,
      },
    }),
    prisma.review.count({ where: { mealId } }),
    prisma.review.aggregate({
      where: { mealId },
      _avg: { rating: true },
    }),
  ]);

  return {
    data,
    averageRating: avgRating._avg.rating
      ? Math.round(avgRating._avg.rating * 10) / 10
      : null,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getMyReviews = async (userId: string) => {
  return prisma.review.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      meal: { select: { id: true, name: true, imageUrl: true } },
    },
  });
};

const deleteReview = async (
  reviewId: string,
  userId: string,
  isAdmin: boolean,
) => {
  const review = await prisma.review.findUniqueOrThrow({
    where: { id: reviewId },
    select: { id: true, customerId: true },
  });

  if (!isAdmin && review.customerId !== userId) {
    throw new Error("Forbidden. You cannot delete this review.");
  }

  return prisma.review.delete({ where: { id: reviewId } });
};

export const reviewService = {
  createReview,
  getMealReviews,
  getMyReviews,
  deleteReview,
};
