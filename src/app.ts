import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import { auth } from "./lib/auth";
import errorHandler from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { adminRouter } from "./modules/admin/admin.route";
import { cartRouter } from "./modules/cart/cart.route";
import { categoryRouter } from "./modules/category/categories.route";
import { mealRouter } from "./modules/meals/meals.route";
import { orderRouter } from "./modules/orders/orders.route";
import { providerRouter } from "./modules/providers/providers.route";
import { reviewRouter } from "./modules/review/reviews.route";

const app: Application = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      process.env.APP_URL!,
      "http://localhost:3000",
      "https://your-frontend.vercel.app",
    ],
    credentials: true,
  }),
);

app.use((req, _res, next) => {
  console.log("➡️ REQUEST:", req.method, req.url);
  next();
});

app.use("/api/auth/", toNodeHandler(auth));

app.use("/api/categories", categoryRouter);
app.use("/api/providers", providerRouter);
app.use("/api/meals", mealRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
  console.log(`Request: ${req.method} ${req.url}`);
});

app.use(notFound);
app.use(errorHandler);

export default app;
