import { prisma } from "@/lip/prisma";
import { error } from "console";

type SongItem = {
  id?: number;
  title: string;
  category?: string;
  product?: string;
  singers: { name: string }[];
  url: string;
};

function getDriveFileId(value: unknown) {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return "";

  if (rawValue.startsWith("http://") || rawValue.startsWith("https://")) {
    try {
      const driveUrl = new URL(rawValue);
      return (
        driveUrl.searchParams.get("id") ??
        driveUrl.pathname.match(/\/file\/d\/([^/]+)/)?.[1] ??
        ""
      );
    } catch {
      return "";
    }
  }

  return rawValue;
}

export async function GET(request: Request) {
  try {
    const classic_key = process.env.CLASSIC_KEY
    if(!classic_key){
      return Response.json(
        {error: "Classic URL is not Configured"},
        {status: 500}
      )
    }
    const sheetUrl = 
      `https://script.google.com/macros/s/${classic_key}/exec`;
    const sheetResponse = await fetch(sheetUrl);

    if (!sheetResponse.ok) {
      return Response.json(
        { error: "Failed to fetch Google Sheet data", status: sheetResponse.status },
        { status: 502 },
      );
    }

    const sheetJson = await sheetResponse.json();
    const sheetSongs: SongItem[] = (Array.isArray(sheetJson.data) ? sheetJson.data : []).map(
      (song: Record<string, unknown>) => ({
        title: String(song.SONG_TITLE ?? ""),
        product: String(song.PRODUCT ?? ""),
        singers: song.SINGER
          ? [{ name: String(song.SINGER) }]
          : [{ name: "មិនស្គាល់" }],
        rytm: String(song.SONG_RHYTM ?? ""),
        url: `/api/mixapi/${encodeURIComponent(getDriveFileId(song.SONG_URL))}/streaming`,
      }),
    );

    const songs = await prisma.song.findMany({
      select: {
        id: true,
        title: true,
        category: { select: { name: true } },
        product: { select: { name: true } },
        singers: {
          select: { singer: { select: { name: true } } },
        },
      },
    });

    const databaseSongs: SongItem[] = songs.map((song) => ({
      id: song.id,
      title: song.title,
      category: song.category.name,
      product: song.product.name,
      singers: song.singers.map(({ singer }) => ({ name: singer.name })),
      url: `/api/mixapi/${song.id}/streaming`,
    }));

    const allSongs = [...sheetSongs, ...databaseSongs];
    const url = new URL(request.url);
    const isPaginated = ["offset", "limit", "q", "sort"].some((key) =>
      url.searchParams.has(key),
    );

    if (!isPaginated) return Response.json(allSongs);

    const query = url.searchParams.get("q")?.trim().toLocaleLowerCase();
    const filteredSongs = query
      ? allSongs.filter(
          (song) =>
            song.title.toLocaleLowerCase().includes(query) ||
            song.singers.some((singer) => singer.name.toLocaleLowerCase().includes(query)),
        )
      : allSongs;

    const sort = url.searchParams.get("sort");
    const sortedSongs =
      sort === "az"
        ? [...filteredSongs].sort((a, b) => a.title.localeCompare(b.title))
        : sort === "za"
          ? [...filteredSongs].sort((a, b) => b.title.localeCompare(a.title))
          : filteredSongs;
    const offset = Math.max(
      0,
      Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0,
    );
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "100", 10) || 100),
    );
    const data = sortedSongs.slice(offset, offset + limit);
    const nextOffset = offset + data.length;

    return Response.json({
      data,
      nextOffset,
      hasMore: nextOffset < sortedSongs.length,
    });
  } catch (error) {
    console.error("Failed to fetch mixed songs:", error);
    return Response.json({ error: "Failed to fetch mixed songs" }, { status: 500 });
  }
}
