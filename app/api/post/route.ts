import { NextResponse } from "next/server";
import { prisma } from "@/lip/prisma";

type CreateSongBody = {
  title?: unknown;
  url?: unknown;
  singers?: unknown;
  category?: unknown;
  product?: unknown;
};

export async function POST(request: Request) {
  let body: CreateSongBody;

  try {
    body = (await request.json()) as CreateSongBody;
  } catch {
    return NextResponse.json({ error: "សូមផ្ញើ JSON ឲ្យបានត្រឹមត្រូវ" }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const submittedUrl = typeof body.url === "string" ? body.url.trim() : "";
  const categoryName = typeof body.category === "string" ? body.category.trim() : "";
  const productName = typeof body.product === "string" ? body.product.trim() : "";
  const singers = Array.isArray(body.singers)
    ? body.singers
        .filter((singer): singer is string => typeof singer === "string")
        .map((singer) => singer.trim())
        .filter(Boolean)
    : [];

  let fileId = submittedUrl;
  if (submittedUrl) {
    try {
      fileId = new URL(submittedUrl, request.url).searchParams.get("fileId") ?? submittedUrl;
    } catch {
      fileId = submittedUrl;
    }
  }

  if (!title || !fileId || !categoryName || !productName) {
    return NextResponse.json(
      { error: "title, url, category និង product ត្រូវតែមានតម្លៃ" },
      { status: 400 },
    );
  }

  if (
    body.singers !== undefined &&
    (!Array.isArray(body.singers) || singers.length !== body.singers.length)
  ) {
    return NextResponse.json({ error: "singers ត្រូវតែជាបញ្ជីឈ្មោះ" }, { status: 400 });
  }

  if (singers.length === 0) {
    return NextResponse.json({ error: "សូមបញ្ចូលតារាចម្រៀងយ៉ាងហោចណាស់ម្នាក់" }, { status: 400 });
  }

  try {
    const song = await prisma.$transaction(async (tx) => {
      const [category, product] = await Promise.all([
        tx.songCategory.upsert({
          where: { name: categoryName },
          update: {},
          create: { name: categoryName },
        }),
        tx.product.upsert({
          where: { name: productName },
          update: {},
          create: { name: productName },
        }),
      ]);

      const singerRecords = await Promise.all(
        [...new Set(singers)].map(async (name) => {
          const existingSinger = await tx.singer.findFirst({ where: { name } });
          return existingSinger ?? tx.singer.create({ data: { name } });
        }),
      );

      return tx.song.create({
        data: {
          title,
          url: fileId,
          categoryId: category.id,
          productId: product.id,
          singers: {
            create: singerRecords.map((singer) => ({
              singer: { connect: { id: singer.id } },
            })),
          },
        },
        include: {
          category: true,
          product: true,
          singers: { include: { singer: true } },
        },
      });
    });

    return NextResponse.json({ success: true, song }, { status: 201 });
  } catch (error) {
    console.error("Create song error:", error);
    return NextResponse.json({ error: "មិនអាចរក្សាទុកបទចម្រៀងបានទេ" }, { status: 500 });
  }
}
