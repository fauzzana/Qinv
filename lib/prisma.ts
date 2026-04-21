import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Handle cleanup in development
if (process.env.NODE_ENV === "development") {
  process.on("beforeExit", async () => {
    console.log("Disconnecting Prisma client...")
    await prisma.$disconnect()
  })

  // Handle uncaught exceptions
  process.on("uncaughtException", async () => {
    await prisma.$disconnect()
    process.exit(1)
  })

  // Handle unhandled promise rejections
  process.on("unhandledRejection", async () => {
    await prisma.$disconnect()
    process.exit(1)
  })
}