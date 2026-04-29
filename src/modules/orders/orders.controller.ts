import { NextFunction, Request, Response } from "express";

import { orderService } from "./orders.service";
import { OrderStatus } from "@prisma/client";

const createOrder = async (req: Request, res: Response,) => {
  try {
    const { deliveryAddress } = req.body;
    if (!deliveryAddress) {
      return res.status(400).json({ error: "deliveryAddress is required." });
    }
    const result = await orderService.createOrder(
      req.user!.id,
      deliveryAddress,
    );
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
  }
};

const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await orderService.getMyOrders(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await orderService.getOrderById(
      req.params.orderId as string,
      req.user!.id,
      req.user!.role,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await orderService.cancelOrder(
      req.params.orderId as string,
      req.user!.id,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getProviderOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const status = req.query.status as OrderStatus | undefined;
    const result = await orderService.getProviderOrders(req.user!.id, status);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: "status is required." });
    }
    const result = await orderService.updateOrderStatus(
      req.params.orderId as string,
      status as OrderStatus,
      req.user!.id,
    );
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

export const OrderController = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getProviderOrders,
  updateOrderStatus,
};
