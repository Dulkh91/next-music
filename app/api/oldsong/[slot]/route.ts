
type Context = {
    params: Promise<{slot: string}>
}

export async function GET(
    request: Request, 
    context: Context
) {
    try {  

        const {slot} = await context.params
        
        const songUrl = `https://drive.google.com/uc?id=${slot}`

        const rang = request.headers.get("range")

        const fileRes = await fetch(songUrl,{
            headers: rang? {Range: rang}: {},
            cache: 'no-store'
        })

        if(!fileRes.ok && fileRes.status !== 206){
            return Response.json({
                message: "Can't retrieve audio file "
            })
        }

         // 4. បញ្ជូនសំឡេងទៅ Browser
        const headers = new Headers({
        "Content-Type":
            fileRes.headers.get("content-type") ||
            "audio/mpeg",
            "Cache-Control": "private, no-store",
        });

        for (const name of [
            "content-length",
            "content-range",
            "accept-ranges",
            ]) {
        
            const value = fileRes.headers.get(name);

            if (value) {
                headers.set(name, value);
                }
        }

        return new Response(fileRes.body,{
            status: fileRes.status,
            headers
        })

    } catch (error) {
        console.error("Music stream error:", error);

        return Response.json(
            { message: "Internal server error" },
            { status: 500 }
            );
    }
}
