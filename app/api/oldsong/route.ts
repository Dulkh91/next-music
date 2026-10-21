


export async function GET() {
    try {
        
        const apiUrl = process.env.API_URL
        if (!apiUrl) {
            return Response.json(
                { error: "API_URL is not configured" },
                { status: 500 },
            )
        }

        const oldSong = await fetch(apiUrl)

        if(!oldSong.ok){
            return Response.json(
                {
                    message: "Failed to fetch api song!",
                    status: oldSong.status
                },
                {status: 502}
            );
        }
        const songs = await oldSong.json()
        const resultSongs = songs.map((s:any)=>(
            {
                "title": s[0],
                "singer": s[1]? s[1]: "unknow",
                "url": `/api/oldsong/${s[2]}`.trim()
            }
        ))
        
        return Response.json(resultSongs)

    } catch (error) {
        console.error("Failed to fecth:", error)
        return Response.json(
            {error: "Failed to fetch api song"},
            {status: 500}
        )
    }
}
