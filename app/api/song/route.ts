import { prisma } from "@/lip/prisma";

export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      select: {
        id: true,
        title: true,
        category: {
          select: { name: true },
        },
        product:{
          select: {name: true}
        },
        singers: {
          select: {
            singer: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    });

    const songsData = songs.map(({ category, singers,product, ...song }) => ({
      ...song,
      category: category.name,
      product: product.name,
      singers: singers.map(({ singer }) => ({ name: singer.name })),
      url: `/api/song/${song.id}/streaming`,
    }));

    return Response.json(songsData);
  } catch (error) {
    console.error("Failed to fetch songs:", error);

    return Response.json(
      { error: "Failed to fetch songs" },
      { status: 500 },
    );
  }
}