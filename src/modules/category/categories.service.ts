import { Category } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { meals: true } } },
  });
};

const getCategoryById = async (categoryId: string) => {
  return prisma.category.findUniqueOrThrow({
    where: { id: categoryId },
    include: {
      meals: {
        where: { isAvailable: true },
        include: {
          provider: { select: { id: true, restaurantName: true } },
        },
      },
      _count: { select: { meals: true } },
    },
  });
};

const createCategory = async (data: Omit<Category, "id" | "createdAt">) => {
  const slug = data.name.toLowerCase().replace(/\s+/g, "-");
  return prisma.category.create({
    data: { ...data, slug },
  });
};

const updateCategory = async (
  categoryId: string,
  data: Partial<Omit<Category, "id" | "createdAt">>,
) => {
  if (data.name) {
    data.slug = data.name.toLowerCase().replace(/\s+/g, "-");
  }
  return prisma.category.update({
    where: { id: categoryId },
    data,
  });
};

const deleteCategory = async (categoryId: string) => {
  const mealCount = await prisma.meal.count({
    where: { categoryId },
  });

  if (mealCount > 0) {
    throw new Error(
      `Cannot delete category. It is linked to ${mealCount} meal(s). Reassign meals first.`,
    );
  }

  return prisma.category.delete({ where: { id: categoryId } });
};

export const categoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
