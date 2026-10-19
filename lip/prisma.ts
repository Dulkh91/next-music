import { PrismaClient } from "@prisma/client";

const globleForPrisma = globalThis as unknown as {prisma?: PrismaClient}

export const prisma = globleForPrisma.prisma ?? new PrismaClient()
if(process.env.NODE_ENV !== 'production') globleForPrisma.prisma = prisma