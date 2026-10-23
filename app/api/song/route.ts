import { prisma } from "@/lip/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const isPaginated = url.searchParams.has("offset") || url.searchParams.has("limit") || url.searchParams.has("q") || url.searchParams.has("sort");
    const offset = Math.max(0, Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);
    const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "100", 10) || 100));
    const sort = url.searchParams.get("sort");
    const query = url.searchParams.get("q")?.trim();
    const where: Prisma.SongWhereInput | undefined = query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            {
              singers: {
                some: {
                  singer: { name: { contains: query, mode: "insensitive" } },
                },
              },
            },
          ],
        }
      : undefined;

    const songs = await prisma.song.findMany({
      where,
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
      orderBy: sort === "az"
        ? [{ title: "asc" }, { id: "desc" }]
        : sort === "za"
          ? [{ title: "desc" }, { id: "desc" }]
          : { id: "desc" },
      ...(isPaginated ? { skip: offset, take: limit } : {}),
    });

    const songsData = songs.map(({ category, singers,product, ...song }) => ({
      ...song,
      category: category.name,
      product: product.name,
      singers: singers.map(({ singer }) => ({ name: singer.name })),
      url: `/api/song/${song.id}/streaming`,
    }));

    if (!isPaginated) return Response.json(songsData);

    const total = await prisma.song.count({ where });
    const nextOffset = offset + songsData.length;
    return Response.json({
      data: songsData,
      nextOffset,
      hasMore: nextOffset < total,
    });
  } catch (error) {
    console.error("Failed to fetch songs:", error);

    return Response.json(
      { error: "Failed to fetch songs" },
      { status: 500 },
    );
  }
}
