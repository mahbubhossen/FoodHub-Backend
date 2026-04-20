import { prisma } from "../../lib/prisma";

const getCart = async (userId: string) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      meal: {
        include: {
          provider: { select: { id: true, restaurantName: true } },
          category: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const total = items.reduce(
    (sum, item) => sum + Number(item.meal.price) * item.quantity,
    0,
  );

  return { items, total, itemCount: items.length };
};

const addToCart = async (userId: string, mealId: string, quantity: number) => {
  // Validate meal exists and is available
  await prisma.meal.findUniqueOrThrow({
    where: { id: mealId, isAvailable: true },
    select: { id: true },
  });

  // If same meal already in cart, increment quantity
  const existing = await prisma.cartItem.findFirst({
    where: { userId, mealId },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
      include: { meal: true },
    });
  }

  return prisma.cartItem.create({
    data: { userId, mealId, quantity },
    include: { meal: true },
  });
};

const updateCartItem = async (
  cartItemId: string,
  userId: string,
  quantity: number,
) => {
  const item = await prisma.cartItem.findUniqueOrThrow({
    where: { id: cartItemId },
    select: { id: true, userId: true },
  });

  if (item.userId !== userId) {
    throw new Error("Forbidden. This cart item does not belong to you.");
  }

  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: { meal: true },
  });
};

const removeCartItem = async (cartItemId: string, userId: string) => {
  const item = await prisma.cartItem.findUniqueOrThrow({
    where: { id: cartItemId },
    select: { id: true, userId: true },
  });

  if (item.userId !== userId) {
    throw new Error("Forbidden. This cart item does not belong to you.");
  }

  return prisma.cartItem.delete({ where: { id: cartItemId } });
};

const clearCart = async (userId: string) => {
  return prisma.cartItem.deleteMany({ where: { userId } });
};

export const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
