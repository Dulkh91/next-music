import { prisma } from "@/lip/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;
    const musicId = Number(id);

    if (!Number.isSafeInteger(musicId) || musicId < 1) {
      return Response.json(
        { message: "Invalid music ID" },
        { status: 400 }
      );
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!botToken) {
      return Response.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // 1. រកចម្រៀងក្នុង Database
    const music = await prisma.music.findUnique({
      where: { id: musicId },
    });

    if (!music) {
      return Response.json(
        { message: "Music not found" },
        { status: 404 }
      );
    }

    // 2. ស្នើ Telegram ឱ្យរកទីតាំងឯកសារ
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(music.url)}`,
      { cache: "no-store" }
    );

    if (!telegramResponse.ok) {
      return Response.json(
        { message: "Cannot contact Telegram" },
        { status: 502 }
      );
    }

    const fileData = await telegramResponse.json();

    if (!fileData.ok || !fileData.result?.file_path) {
      return Response.json(
        { message: "Telegram file not found" },
        { status: 502 }
      );
    }

    // 3. ទាញយកសំឡេងពី Telegram
    const fileUrl =
      `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;

    const range = request.headers.get("range");

    const fileResponse = await fetch(fileUrl, {
      headers: range ? { Range: range } : {},
      cache: "no-store",
    });

    if (!fileResponse.ok && fileResponse.status !== 206) {
      return Response.json(
        { message: "Cannot retrieve audio file" },
        { status: 502 }
      );
    }

    // 4. បញ្ជូនសំឡេងទៅ Browser
    const headers = new Headers({
      "Content-Type":
        fileResponse.headers.get("content-type") ||
        "audio/mpeg",
      "Cache-Control": "private, no-store",
    });

    for (const name of [
      "content-length",
      "content-range",
      "accept-ranges",
    ]) {
      const value = fileResponse.headers.get(name);

      if (value) {
        headers.set(name, value);
      }
    }

    return new Response(fileResponse.body, {
      status: fileResponse.status,
      headers,
    });
  } catch (error) {
    console.error("Music stream error:", error);

    return Response.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}