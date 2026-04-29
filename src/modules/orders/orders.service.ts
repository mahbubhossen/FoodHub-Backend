import { OrderStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";


const createOrder = async (userId: string, deliveryAddress: string) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      meal: {
        include: { provider: { select: { id: true } } },
      },
    },
  });

  if (cartItems.length === 0) {
    throw new Error("Your cart is empty. Add items before placing an order.");
  }

  // All meals must belong to one provider (one order per restaurant)
  const providerIds = [...new Set(cartItems.map((i) => i.meal.provider.id))];
  if (providerIds.length > 1) {
    throw new Error(
      "Your cart contains meals from multiple restaurants. Please checkout from one restaurant at a time.",
    );
  }

  const providerId = providerIds[0];
  if (!providerId) {
    throw new Error("Unable to determine the provider for the order.");
  }

  // Verify all meals are still available
  for (const item of cartItems) {
    if (!item.meal.isAvailable) {
      throw new Error(`"${item.meal.name}" is no longer available.`);
    }
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + Number(item.meal.price) * item.quantity,
    0,
  );

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        customerId: userId,
        providerId,
        deliveryAddress,
        totalPrice,
        paymentMethod: "COD",
        status: OrderStatus.PLACED,
        orderItems: {
          create: cartItems.map((item) => ({
            mealId: item.mealId,
            quantity: item.quantity,
            unitPrice: item.meal.price, // price snapshot
          })),
        },
      },
      include: {
        orderItems: {
          include: {
            meal: { select: { id: true, name: true, imageUrl: true } },
          },
        },
        provider: { select: { id: true, restaurantName: true, phone: true } },
      },
    });

    // Clear cart after successful order
    await tx.cartItem.deleteMany({ where: { userId } });

    return newOrder;
  });

  return order;
};

const getMyOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      provider: { select: { id: true, restaurantName: true, logoUrl: true } },
      orderItems: {
        include: { meal: { select: { id: true, name: true, imageUrl: true } } },
      },
      _count: { select: { orderItems: true } },
    },
  });
};

const getOrderById = async (orderId: string, userId: string, role: string) => {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          meal: {
            select: { id: true, name: true, imageUrl: true, price: true },
          },
        },
      },
      provider: {
        select: { id: true, restaurantName: true, address: true, phone: true },
      },
      reviews: {
        select: { id: true, rating: true, comment: true, customerId: true },
      },
    },
  });

  // Customers can only see their own orders
  // Providers can only see orders for their restaurant
  if (role === "CUSTOMER" && order.customerId !== userId) {
    throw new Error("Forbidden. You do not have access to this order.");
  }

  if (role === "PROVIDER") {
    const profile = await prisma.providerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile || order.providerId !== profile.id) {
      throw new Error("Forbidden. This order is not from your restaurant.");
    }
  }

  return order;
};

const cancelOrder = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { id: true, customerId: true, status: true },
  });

  if (order.customerId !== userId) {
    throw new Error("Forbidden. You do not have access to this order.");
  }

  // Only PLACED orders can be cancelled by the customer
  if (order.status !== OrderStatus.PLACED) {
    throw new Error(
      `Order cannot be cancelled. Current status: ${order.status}. Only PLACED orders can be cancelled.`,
    );
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CANCELLED },
  });
};

// ─── Provider ──────────────────────────────────────────────────────────────

const getProviderOrders = async (userId: string, status?: OrderStatus) => {
  const profile = await prisma.providerProfile.findUniqueOrThrow({
    where: { userId },
    select: { id: true },
  });

  const where: any = { providerId: profile.id };
  if (status) where.status = status;

  return prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      orderItems: {
        include: { meal: { select: { id: true, name: true } } },
      },
      _count: { select: { orderItems: true } },
    },
  });
};

const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PLACED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY],
  [OrderStatus.READY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  userId: string,
) => {
  const profile = await prisma.providerProfile.findUniqueOrThrow({
    where: { userId },
    select: { id: true },
  });

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { id: true, providerId: true, status: true },
  });

  if (order.providerId !== profile.id) {
    throw new Error("Forbidden. This order is not from your restaurant.");
  }

  const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status];
  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Invalid status transition from ${order.status} → ${newStatus}. Allowed: ${allowedTransitions.join(", ") || "none"}.`,
    );
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });
};

export const orderService = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getProviderOrders,
  updateOrderStatus,
};
