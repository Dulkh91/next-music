import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            return NextResponse.json(
                { error: "Telegram server configuration is missing" },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const audioFile = formData.get("audio");

        if (!(audioFile instanceof File)) {
            return NextResponse.json(
                { error: "No audio file provided" },
                { status: 400 }
            );
        }

        const telegramFormData = new FormData();
        telegramFormData.append("chat_id", chatId);
        telegramFormData.append("audio", audioFile, audioFile.name);

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${botToken}/sendAudio`,
            { method: "POST", body: telegramFormData }
        );
        const telegramData = await telegramResponse.json();

        if (!telegramResponse.ok || !telegramData.ok) {
            console.error("Telegram upload failed:", telegramData.description);
            return NextResponse.json(
                { error: "Telegram upload failed" },
                { status: 502 }
            );
        }

        const audio = telegramData.result.audio;
        const fileUrl = new URL(
            `/api/audio?fileId=${encodeURIComponent(audio.file_id)}`,
            request.url
        ).toString();

        return NextResponse.json({
            success: true,
            fileUrl,
            fileId: audio.file_id,
            duration: audio.duration,
            fileName: audio.file_name,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload audio" },
            { status: 500 }
        );
    }
}
