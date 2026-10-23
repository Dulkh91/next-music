


export async function GET(request: Request) {
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
                "singers": s[1] ? [{ name: s[1] }] : [{ name: "unknow" }],
                "url": `/api/oldsong/${s[2]}`.trim()
            }
        ))

        const url = new URL(request.url)
        const isPaginated = url.searchParams.has("offset") || url.searchParams.has("limit") || url.searchParams.has("q") || url.searchParams.has("sort")
        if (!isPaginated) return Response.json(resultSongs)

        const query = url.searchParams.get("q")?.trim().toLocaleLowerCase()
        const filteredSongs = query
            ? resultSongs.filter((song: { title: string; singers: { name: string }[] }) =>
                song.title.toLocaleLowerCase().includes(query) ||
                song.singers.some((singer) => singer.name.toLocaleLowerCase().includes(query))
            )
            : resultSongs
        const sort = url.searchParams.get("sort")
        const sortedSongs = sort === "az"
            ? [...filteredSongs].sort((a: { title: string }, b: { title: string }) => a.title.localeCompare(b.title))
            : sort === "za"
                ? [...filteredSongs].sort((a: { title: string }, b: { title: string }) => b.title.localeCompare(a.title))
                : filteredSongs
        const offset = Math.max(0, Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0)
        const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "100", 10) || 100))
        const data = sortedSongs.slice(offset, offset + limit)
        const nextOffset = offset + data.length

        return Response.json({
            data,
            nextOffset,
            hasMore: nextOffset < sortedSongs.length,
        })

    } catch (error) {
        console.error("Failed to fecth:", error)
        return Response.json(
            {error: "Failed to fetch api song"},
            {status: 500}
        )
    }
}
