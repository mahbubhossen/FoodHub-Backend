import { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";

const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await adminService.getDashboardStats();
    console.log(req)
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await adminService.getAllUsers({
      search: req.query.search as string,
      role: req.query.role as string,
      status: req.query.status as string,
      page,
      limit,
      skip: (page - 1) * limit,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getUserById(req.params.userId as string);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status } = req.body;

    if (!status || !["ACTIVE", "SUSPENDED"].includes(status)) {
      return res
        .status(400)
        .json({ error: "status must be one of: ACTIVE, SUSPENDED." });
    }

    const result = await adminService.updateUserStatus(
      req.params.userId as string,
      status,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};


const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await adminService.getAllOrders({
      ...(req.query.status && { status: req.query.status as string }),
      ...(req.query.customerId && { customerId: req.query.customerId as string }),
      ...(req.query.providerId && { providerId: req.query.providerId as string }),
      page,
      limit,
      skip: (page - 1) * limit,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const AdminController = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllOrders,
};
