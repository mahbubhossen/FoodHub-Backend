import { Router } from "express";
import { requireAuth, UserRole } from "../../middlewares/auth";
import { ProviderController } from "./providers.controller";

const router = Router();

// ─── Public ────────────────────────────────────────────────────────────────
// GET /api/providers              → browse all providers
// GET /api/providers/:providerId  → single provider with full menu

router.get("/", ProviderController.getAllProviders);
router.get("/:providerId", ProviderController.getProviderById);

// ─── Provider (own account) ────────────────────────────────────────────────
// GET    /api/providers/me/profile    → view own profile
// GET    /api/providers/me/dashboard  → dashboard stats
// POST   /api/providers/me/profile    → create profile (once)
// PATCH  /api/providers/me/profile    → update profile

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
