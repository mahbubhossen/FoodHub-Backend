import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { Application } from "express";
import { auth } from "./lib/auth";
import errorHandler from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { categoryRouter } from "./modules/category/categories.route";

const app: Application = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      process.env.APP_URL || "http://localhost:4000",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use("/api/categories", categoryRouter);


app.get("/", (req: any, res: any) => {
  res.send("Hello , World!");
});

app.use(notFound);
app.use(errorHandler);

export default app;
