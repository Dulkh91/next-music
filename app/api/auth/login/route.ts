import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import { prisma } from "@/lip/prisma";
import { SESSION_COOKIE, SESSION_DURATION_SECONDS } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || !("username" in body) || !("password" in body)) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const { username, password } = body as { username: unknown; password: unknown };
    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const sessionToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
    await prisma.session.create({ data: { sessionToken, userId: user.id, expiresAt } });
    (await cookies()).set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return NextResponse.json({ message: "Login successful.", user: { id: user.id, username: user.username } });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Could not log in." }, { status: 500 });
  }
}
