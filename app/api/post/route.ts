import { NextResponse } from "next/server";
import { prisma } from "@/lip/prisma";

type CreateMusicBody = {
  title?: unknown;
  url?: unknown;
  singers?: unknown;
  category?: unknown;
};

export async function POST(request: Request) {
  let body: CreateMusicBody;

  try {
    body = (await request.json()) as CreateMusicBody;
  } catch {
    return NextResponse.json({ error: "សូមផ្ញើ JSON ឲ្យបានត្រឹមត្រូវ" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const submittedUrl = typeof body.url === "string" ? body.url.trim() : "";
  let url = submittedUrl;

  if (submittedUrl) {
    try {
      // Upload URLs contain the Telegram file_id; store only that ID for streaming.
      url = new URL(submittedUrl, request.url).searchParams.get("fileId") ?? submittedUrl;
    } catch {
      url = submittedUrl;
    }
  }
  const categoryName = typeof body.category === "string" ? body.category.trim() : "";
  const singers = Array.isArray(body.singers)
    ? body.singers.filter((singer): singer is string => typeof singer === "string").map((singer) => singer.trim()).filter(Boolean)
    : [];

  if (!title || !url || !categoryName) {
    return NextResponse.json(
      { error: "title, url និង category ត្រូវតែមានតម្លៃ" },
      { status: 400 },
    );
  }

  if (body.singers !== undefined && (!Array.isArray(body.singers) || singers.length !== body.singers.length)) {
    return NextResponse.json({ error: "singers ត្រូវតែជាបញ្ជីឈ្មោះ" }, { status: 400 });
  }

  try {
    const music = await prisma.$transaction(async (tx) => {
      const category = await tx.songCategory.upsert({
        where: { category: categoryName },
        update: {},
        create: { category: categoryName },
      });

      const singerRecords = await Promise.all(
        [...new Set(singers)].map(async (name) => {
          return tx.singer.upsert({
            where: { name },
            update: {},
            create: { name },
          });
        }),
      );

      return tx.music.create({
        data: {
          title,
          url,
          categoryId: category.id,
          singers: { connect: singerRecords.map(({ id }) => ({ id })) },
        },
        include: { category: true, singers: true },
      });
    });

    return NextResponse.json({ success: true, music }, { status: 201 });
  } catch (error) {
    console.error("Create music error:", error);
    return NextResponse.json({ error: "មិនអាចរក្សាទុកបទចម្រៀងបានទេ" }, { status: 500 });
  }
}
