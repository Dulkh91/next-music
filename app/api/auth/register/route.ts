
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lip/prisma";

export async function POST(request: Request) {
  try {
    // 1. ទទួលទិន្នន័យពី Request
    const body: unknown = await request.json();

    // 2. ពិនិត្យ Username និង Password
    if (
      !body ||
      typeof body !== "object" ||
      !("username" in body) ||
      !("password" in body)
    ) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const { username, password } = body as {
      username: unknown;
      password: unknown;
    };

    // 3. ពិនិត្យប្រភេទទិន្នន័យ និងប្រវែង Password
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username.trim() === "" ||
      password.length < 8
    ) {
      return NextResponse.json(
        { error: "Enter a username and a password of at least 8 characters." },
        { status: 400 }
      );
    }

    // 4. សម្អាត Username ដោយដកចន្លោះខាងដើម និងខាងចុង
    const normalizedUsername = username.trim();

    // 5. ពិនិត្យថា Username មានអ្នកប្រើរួចហើយឬនៅ
    const existingUser = await prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken." },
        { status: 409 }
      );
    }

    // 6. Hash Password មុនរក្សាទុកក្នុង Database
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. បង្កើត User ថ្មី
    const user = await prisma.user.create({
      data: {
        username: normalizedUsername,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    // 8. ឆ្លើយតបថាបង្កើត Account បានជោគជ័យ
    return NextResponse.json(
      {
        message: "Account created successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register failed:", error);

    return NextResponse.json(
      { error: "Could not create account." },
      { status: 500 }
    );
  }
}
