import { PrismaClient, SystemRole } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Default SuperAdmin credentials
  const superAdminEmail = "superadmin@example.com";
  const superAdminPassword = "SuperAdmin@123"; // Change this to a secure password
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  // Create SuperAdmin user
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {}, // No update if it exists
    create: {
      username: "superadmin",
      email: superAdminEmail,
      password: hashedPassword,
      role: SystemRole.SUPERADMIN, // Enum role
      roleIds: [], // Assign role ID
      isActive: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("✅ SuperAdmin user seeded");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
