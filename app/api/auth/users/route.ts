import { NextResponse } from "next/server";
import { prisma } from "@/lip/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: { id: true, username: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users, currentUser });
  } catch (error) {
    console.error("Get users failed:", error);
    return NextResponse.json({ error: "Could not retrieve users." }, { status: 500 });
  }
}
