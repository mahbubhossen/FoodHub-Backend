import { NextFunction, Request, Response } from "express";
import { providerService } from "./providers.service";

const getAllProviders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await providerService.getAllProviders({
      search: (req.query.search as string) || (undefined as any),
      page,
      limit,
      skip: (page - 1) * limit,
    });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getProviderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await providerService.getProviderById(
      req.params.providerId as string,
    );
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await providerService.getMyProfile(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await providerService.createProfile(req.body, req.user!.id);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await providerService.updateProfile(req.body, req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getProviderDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await providerService.getProviderDashboard(req.user!.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const ProviderController = {
  getAllProviders,
  getProviderById,
  getMyProfile,
  createProfile,
  updateProfile,
  getProviderDashboard,
};
