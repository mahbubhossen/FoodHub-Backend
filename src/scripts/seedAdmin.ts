import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";

async function seedAdmin() {
  try {
    const adminData = {
      name: "Admin",
      email: "admin@gmail.com",
      role: UserRole.ADMIN,
      password: "admin1234",
    };

    // check user exist on db or not
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });
    if (existingUser) {
      throw new Error("user already exist !!!");
    }

    const singUpAdmin = await fetch(
      "http://localhost:5000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: JSON.stringify(adminData),
      },
    );

    if (singUpAdmin.ok) {
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
          role: UserRole.ADMIN,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

seedAdmin();
