import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { ProviderController } from "./providers.controller";

const router = Router();

router.get("/", ProviderController.getAllProviders);
router.get("/:providerId", ProviderController.getProviderById);

router.get(
  "/me/profile",
  requireAuth(UserRole.PROVIDER),
  ProviderController.getMyProfile,
);
router.get(
  "/me/dashboard",
  requireAuth(UserRole.PROVIDER),
  ProviderController.getProviderDashboard,
);
router.post(
  "/me/profile",
  requireAuth(UserRole.PROVIDER),
  ProviderController.createProfile,
);
router.patch(
  "/me/profile",
  requireAuth(UserRole.PROVIDER),
  ProviderController.updateProfile,
);

export const providerRouter: Router = router;
