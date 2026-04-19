import { Meal } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

// ─── Public ────────────────────────────────────────────────────────────────

const getAllMeals = async (query: {
  search?: string;
  categoryId?: string;
  providerId?: string;
  dietaryTags?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) => {
  const {
    search,
    categoryId,
    providerId,
    dietaryTags,
    minPrice,
    maxPrice,
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  } = query;

  const where: any = { isAvailable: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) where.categoryId = categoryId;
  if (providerId) where.providerId = providerId;
  if (dietaryTags)
    where.dietaryTags = { contains: dietaryTags, mode: "insensitive" };
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  const [data, total] = await Promise.all([
    prisma.meal.findMany({
      where,
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        provider: { select: { id: true, restaurantName: true, logoUrl: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.meal.count({ where }),
  ]);

  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getMealById = async (mealId: string) => {
  const meal = await prisma.meal.findUniqueOrThrow({
    where: { id: mealId },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      provider: {
        select: {
          id: true,
          restaurantName: true,
          logoUrl: true,
          address: true,
          phone: true,
          isOpen: true,
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          rating: true,
          comment: true,
          customerId: true,
          createdAt: true,
        },
      },
      _count: { select: { reviews: true } },
    },
  });
  return meal;
};

// ─── Provider ──────────────────────────────────────────────────────────────

const createMeal = async (
  data: Omit<Meal, "id" | "createdAt" | "updatedAt" | "providerId">,
  userId: string,
) => {
  const profile = await prisma.providerProfile.findUniqueOrThrow({
    where: { userId },
    select: { id: true },
  });

  return prisma.meal.create({
    data: { ...data, providerId: profile.id },
    include: { category: true },
  });
};

const updateMeal = async (
  mealId: string,
  data: Partial<Omit<Meal, "id" | "providerId" | "createdAt" | "updatedAt">>,
  userId: string,
) => {
  const profile = await prisma.providerProfile.findUniqueOrThrow({
    where: { userId },
    select: { id: true },
  });

  const meal = await prisma.meal.findUniqueOrThrow({
    where: { id: mealId },
    select: { id: true, providerId: true },
  });

  if (meal.providerId !== profile.id) {
    throw new Error("Forbidden. This meal does not belong to your restaurant.");
  }

  return prisma.meal.update({
    where: { id: mealId },
    data,
    include: { category: true },
  });
};

const deleteMeal = async (mealId: string, userId: string) => {
  const profile = await prisma.providerProfile.findUniqueOrThrow({
    where: { userId },
    select: { id: true },
  });

  const meal = await prisma.meal.findUniqueOrThrow({
    where: { id: mealId },
    select: { id: true, providerId: true },
  });

  if (meal.providerId !== profile.id) {
    throw new Error("Forbidden. This meal does not belong to your restaurant.");
  }

  return prisma.meal.delete({ where: { id: mealId } });
};

const getProviderMeals = async (userId: string) => {
  const profile = await prisma.providerProfile.findUniqueOrThrow({
    where: { userId },
    select: { id: true },
  });

  return prisma.meal.findMany({
    where: { providerId: profile.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, name: true } },
      _count: { select: { reviews: true, orderItems: true } },
    },
  });
};

export const mealService = {
  getAllMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  getProviderMeals,
};
