import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lip/prisma";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { sessionToken: token } });
  }
  cookieStore.delete(SESSION_COOKIE);
  return NextResponse.json({ message: "Logged out successfully." });
}
