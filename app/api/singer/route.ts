import { prisma } from "@/lip/prisma";

export async function GET() {
  try {
    const singers = await prisma.singer.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return Response.json(singers);
  } catch (error) {
    console.error("Failed to fetch singers:", error);
    return Response.json({ error: "Failed to fetch singers" }, { status: 500 });
  }
}
