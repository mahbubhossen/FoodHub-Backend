import { ProviderProfile } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";


const getAllProviders = async (query: {
  search?: string;
  page: number;
  limit: number;
  skip: number;
}) => {
  const { search, page, limit, skip } = query;

  const where: any = {};
  if (search) {
    where.OR = [
      { restaurantName: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.providerProfile.findMany({
      where,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        restaurantName: true,
        description: true,
        logoUrl: true,
        address: true,
        phone: true,
        isOpen: true,
        createdAt: true,
        _count: { select: { meals: true } },
      },
    }),
    prisma.providerProfile.count({ where }),
  ]);

  return {
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getProviderById = async (providerId: string) => {
  const provider = await prisma.providerProfile.findUniqueOrThrow({
    where: { id: providerId },
    include: {
      meals: {
        where: { isAvailable: true },
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      },
      _count: { select: { meals: true } },
    },
  });
  return provider;
};


const getMyProfile = async (userId: string) => {
  return prisma.providerProfile.findUniqueOrThrow({
    where: { userId },
    include: { _count: { select: { meals: true, orders: true } } },
  });
};

const createProfile = async (
  data: Omit<ProviderProfile, "id" | "userId" | "createdAt" | "updatedAt">,
  userId: string,
) => {
  const existing = await prisma.providerProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (existing) {
    throw new Error("Provider profile already exists for this account.");
  }

  return prisma.providerProfile.create({
    data: { ...data, userId },
  });
};

const updateProfile = async (
  data: Partial<
    Omit<ProviderProfile, "id" | "userId" | "createdAt" | "updatedAt">
  >,
  userId: string,
) => {
  const profile = await prisma.providerProfile.findUniqueOrThrow({
    where: { userId },
    select: { id: true },
  });

  return prisma.providerProfile.update({
    where: { id: profile.id },
    data,
  });
};


const getProviderDashboard = async (userId: string) => {
  const profile = await prisma.providerProfile.findUniqueOrThrow({
    where: { userId },
    select: { id: true },
  });

  const [totalMeals, totalOrders, pendingOrders, activeOrders, totalRevenue] =
    await Promise.all([
      prisma.meal.count({ where: { providerId: profile.id } }),
      prisma.order.count({ where: { providerId: profile.id } }),
      prisma.order.count({
        where: { providerId: profile.id, status: "PLACED" },
      }),
      prisma.order.count({
        where: {
          providerId: profile.id,
          status: { in: ["PLACED", "PREPARING", "READY"] },
        },
      }),
      prisma.order.aggregate({
        where: { providerId: profile.id, status: "DELIVERED" },
        _sum: { totalPrice: true },
      }),
    ]);

  return {
    totalMeals,
    totalOrders,
    pendingOrders,
    activeOrders,
    totalRevenue: totalRevenue._sum.totalPrice ?? 0,
  };
};

export const providerService = {
  getAllProviders,
  getProviderById,
  getMyProfile,
  createProfile,
  updateProfile,
  getProviderDashboard,
};
