import { prisma } from "@/lip/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

async function streamFile(request: Request, fileUrl: string) {
  const range = request.headers.get("range");
  const fileResponse = await fetch(fileUrl, {
    headers: range ? { Range: range } : {},
    cache: "no-store",
  });

  if (!fileResponse.ok && fileResponse.status !== 206) {
    return Response.json({ message: "Cannot retrieve audio file" }, { status: 502 });
  }

  const headers = new Headers({
    "Content-Type": fileResponse.headers.get("content-type") || "audio/mpeg",
    "Cache-Control": "private, no-store",
  });

  for (const name of ["content-length", "content-range", "accept-ranges"]) {
    const value = fileResponse.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(fileResponse.body, {
    status: fileResponse.status,
    headers,
  });
}

export async function GET(request: Request, context: Context) {
  try {
    const { id: param } = await context.params;
    const idLength = param.length;

    // Drive file IDs are longer; short numeric IDs refer to database songs.
    if (idLength <= 10) {
      if (!/^\d+$/.test(param)) {
        return Response.json({ message: "Invalid music ID" }, { status: 400 });
      }

      const musicId = Number(param);
      if (!Number.isSafeInteger(musicId) || musicId < 1) {
        return Response.json({ message: "Invalid music ID" }, { status: 400 });
      }

      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        return Response.json({ message: "Server configuration error" }, { status: 500 });
      }

      const music = await prisma.song.findUnique({ where: { id: musicId } });
      if (!music) {
        return Response.json({ message: "Music not found" }, { status: 404 });
      }

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(music.url)}`,
        { cache: "no-store" },
      );
      if (!telegramResponse.ok) {
        return Response.json({ message: "Cannot contact Telegram" }, { status: 502 });
      }

      const fileData = await telegramResponse.json();
      if (!fileData.ok || !fileData.result?.file_path) {
        return Response.json({ message: "Telegram file not found" }, { status: 502 });
      }

      const telegramFileUrl =
        `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
      return await streamFile(request, telegramFileUrl);
    }

    if (!/^[A-Za-z0-9_-]+$/.test(param)) {
      return Response.json({ message: "Invalid Google Drive file ID" }, { status: 400 });
    }

    return await streamFile(
      request,
      `https://drive.google.com/uc?id=${encodeURIComponent(param)}`,
    );
  } catch (error) {
    console.error("Music stream error:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}
