import { prisma } from "@/lip/prisma";
export async function GET() {
  try {
    const songs = await prisma.music.findMany({
      select: {
        id: true,
        title: true,
        category: {
          select: { category: true },
        },
        singers: {
          select: { name: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return Response.json(
      songs.map(({ category, ...song }) => ({
        ...song,
        category: category.category,
        url: `/api/song/${song.id}/streaming`,
      })),
    );
  } catch (error) {
    console.error("Failed to fetch songs:", error);

    return Response.json(
      { error: "Failed to fetch songs" },
      { status: 500 },
    );
  }
}
