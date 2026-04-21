import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 5000;

// Only run server locally (NOT on Vercel)
if (process.env.NODE_ENV !== "production") {
  async function main() {
    try {
      await prisma.$connect();
      console.log("Connected to the database");

      app.listen(PORT, () => {
        console.log(` Server running on http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error("An error occurred", error);
      await prisma.$disconnect();
      process.exit(1);
    }
  }

  main();
}
