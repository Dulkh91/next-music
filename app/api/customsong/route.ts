
type SongItem = {
  id?: number;
  title: string;
  category?: string;
  product?: string;
  singers: { name: string }[];
  url: string;
};


export async function GET(request: Request) {

    try {
        const custom_key = process.env.CUSTOMSONG_KEY
        if(!custom_key){
            return Response.json(
                {error: "Custom Song API can't configured"},
                {status: 500}
            )
        };

        const customSongs_url = `https://script.google.com/macros/s/${custom_key}/exec`

       const customSongFetch = await fetch(customSongs_url)
        if(!customSongFetch.ok) {
            return Response.json(
                {error: "Failed to fetch custom song API"},
                {status: 502}
            )
        }
        
       const customSongJson = await customSongFetch.json() 
       const allSongs: SongItem[] = (Array.isArray(customSongJson.data)? customSongJson.data: []).map(
        (song: Record<string, unknown>) =>({
            title: String(song.SONG_TITLE ?? ""),
            product: String(song.SONG_PRODUCT ?? ""),
            singers: song.SINGER ? [{ name: String(song.SINGER) }] : [{ name: "មិនស្គាល់" }],
            url: `/api/customsong/${song.SONG_URL}`.trim()
        }),
       );

    {/*=== Paginatioin ====*/}
    const url = new URL(request.url)
    const isPaginated = ["offset", "limit", "q", "sort"].some((key)=> 
        url.searchParams.has(key)
    )

    if(!isPaginated) return Response.json(allSongs)

    const query = url.searchParams.get("q")?.trim().toLocaleLowerCase()
    const filteredSong = query? allSongs.filter((song)=>
            song.title.toLocaleLowerCase().includes(query) || 
            song.singers.some((singer)=>singer.name.toLocaleLowerCase().includes(query)),
         ): allSongs

    const sort = url.searchParams.get("sort")
    const sortedSongs = 
        sort === "az"
        ? [...filteredSong].sort((a,b)=>a.title.localeCompare(b.title))
        : sort === "za"? [...filteredSong].sort((a,b)=> b.title.localeCompare(a.title))
        :filteredSong;
    
    const offset = Math.max(0,Number.parseInt(url.searchParams.get("offset")?? "0", 10)|| 0,)
    const limit = Math.min(100,Math.max(1,Number.parseInt(url.searchParams.get("limit") ?? "100",10) || 100),);
    const data = sortedSongs.slice(offset, offset + limit);
    const nextOffset = offset + data.length;

         

    return Response.json({
        data,
        nextOffset,
        hasMore: nextOffset <sortedSongs.length
    })

    } catch (error) {
        console.error("Failed to fetch custom songs:", error);
        return Response.json({ error: "Failed to fetch mixed songs" }, { status: 500 });
    }
    
}