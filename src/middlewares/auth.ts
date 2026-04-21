import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth"; // your better-auth instance

export enum UserRole {
  CUSTOMER = "CUSTOMER",
  PROVIDER = "PROVIDER",
  ADMIN = "ADMIN",
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        status: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Protects routes. Pass one or more roles to restrict access.
 * If no roles are passed, any authenticated user is allowed.
 *
 * Usage:
 *   router.get("/", requireAuth(), handler)                    // any logged-in user
 *   router.post("/", requireAuth(UserRole.PROVIDER), handler)  // providers only
 */
export const requireAuth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });

      if (!session?.user) {
        return res.status(401).json({ error: "Unauthorized. Please login." });
      }

      // console.log("SESSION USER:", session?.user);
      // console.log("SESSION ROLE:", (session?.user as any)?.role);

      if (
        roles.length > 0 &&
        !roles.includes(((session.user as any)?.role || UserRole.CUSTOMER) as UserRole)
      ) {
        return res.status(403).json({
          error:
            "Forbidden. You do not have permission to access this resource.",
        });
      }

      req.user = session.user as any;
      next();
    } catch {
      return res.status(401).json({ error: "Unauthorized. Session invalid." });
    }
  };
};
