export async function GET(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const fileId = new URL(request.url).searchParams.get("fileId");

  if (!botToken) {
    return Response.json({ error: "Telegram server configuration is missing" }, { status: 500 });
  }

  if (!fileId) {
    return Response.json({ error: "fileId is required" }, { status: 400 });
  }

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/getFile?file_id=${encodeURIComponent(fileId)}`,
      { cache: "no-store" },
    );
    const telegramData = await telegramResponse.json();
    const filePath = telegramData.result?.file_path;

    if (!telegramResponse.ok || !telegramData.ok || typeof filePath !== "string") {
      return Response.json({ error: "Telegram file was not found" }, { status: 502 });
    }

    const range = request.headers.get("range");
    const audioResponse = await fetch(
      `https://api.telegram.org/file/bot${botToken}/${filePath}`,
      {
        headers: range ? { range } : undefined,
        cache: "no-store",
      },
    );

    if (!audioResponse.ok && audioResponse.status !== 206) {
      return Response.json({ error: "Could not retrieve audio file" }, { status: 502 });
    }

    const headers = new Headers({
      "Content-Type": audioResponse.headers.get("content-type") ?? "audio/mpeg",
      "Cache-Control": "private, no-store",
    });

    for (const name of ["content-length", "content-range", "accept-ranges"]) {
      const value = audioResponse.headers.get(name);
      if (value) headers.set(name, value);
    }

    return new Response(audioResponse.body, {
      status: audioResponse.status,
      headers,
    });
  } catch (error) {
    console.error("Audio streaming error:", error);
    return Response.json({ error: "Could not retrieve audio file" }, { status: 502 });
  }
}
