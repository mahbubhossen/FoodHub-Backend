import { betterAuth } from "better-auth";
// If your Prisma file is located elsewhere, you can change the path
import { prisma } from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
    
  }),
  
  trustedOrigins: [process.env.APP_URL!, "http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    
  },
});
