import { NextFunction, Request, Response } from "express";
import { cartService } from "./cart.service";

const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cartService.getCart(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mealId, quantity = 1 } = req.body;
    const result = await cartService.addToCart(req.user!.id, mealId, quantity);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { quantity } = req.body;
    const result = await cartService.updateCartItem(
      req.params.cartItemId as string,
      req.user!.id,
      quantity,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await cartService.removeCartItem(
      req.params.cartItemId as string,
      req.user!.id,
    );
    res.status(200).json({ message: "Item removed from cart." });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await cartService.clearCart(req.user!.id);
    res.status(200).json({ message: "Cart cleared." });
  } catch (error) {
    next(error);
  }
};

export const CartController = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
