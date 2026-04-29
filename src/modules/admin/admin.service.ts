import { OrderStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";

const getAllUsers = async (query: {
  search?: string;
  role?: string;
  status?: string;
  page: number;
  limit: number;
  skip: number;
}) => {
  const { search, role, status, page, limit, skip } = query;

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }
  if (role) where.role = role;
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getUserById = async (userId: string) => {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      phone: true,
      address: true,
      createdAt: true,
      // providerProfile: {
      //   select: {
      //     id: true,
      //     restaurantName: true,
      //     isOpen: true,
      //     _count: { select: { meals: true, orders: true } },
      //   },
      // },
    },
  });
};

const updateUserStatus = async (
  userId: string,
  status: "ACTIVE" | "SUSPENDED",
) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { id: true },
  });

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
};

const getAllOrders = async (query: {
  status?: string;
  customerId?: string;
  providerId?: string;
  page: number;
  limit: number;
  skip: number;
}) => {
  const { status, customerId, providerId, page, limit, skip } = query;

  const where: any = {};
  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  if (providerId) where.providerId = providerId;

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        provider: { select: { id: true, restaurantName: true } },
        orderItems: {
          select: {
            quantity: true,
            unitPrice: true,
            meal: { select: { name: true } },
          },
        },
        _count: { select: { orderItems: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getDashboardStats = async () => {
  return prisma.$transaction(async (tx) => {
    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      suspendedUsers,
      totalMeals,
      availableMeals,
      totalCategories,
      totalOrders,
      placedOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      totalReviews,
    ] = await Promise.all([
      tx.user.count(),
      tx.user.count({ where: { role: "CUSTOMER" } }),
      tx.user.count({ where: { role: "PROVIDER" } }),
      tx.user.count({ where: { status: "SUSPENDED" } }),
      tx.meal.count(),
      tx.meal.count({ where: { isAvailable: true } }),
      tx.category.count(),
      tx.order.count(),
      tx.order.count({ where: { status: OrderStatus.PLACED } }),
      tx.order.count({ where: { status: OrderStatus.PREPARING } }),
      tx.order.count({ where: { status: OrderStatus.DELIVERED } }),
      tx.order.count({ where: { status: OrderStatus.CANCELLED } }),
      tx.order.aggregate({
        where: { status: OrderStatus.DELIVERED },
        _sum: { totalPrice: true },
      }),
      tx.review.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        customers: totalCustomers,
        providers: totalProviders,
        suspended: suspendedUsers,
      },
      meals: {
        total: totalMeals,
        available: availableMeals,
      },
      categories: totalCategories,
      orders: {
        total: totalOrders,
        placed: placedOrders,
        preparing: preparingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      revenue: totalRevenue._sum.totalPrice ?? 0,
      totalReviews,
    };
  });
};

export const adminService = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllOrders,
  getDashboardStats,
};
