'use client'

type TitleSongProp = {
    title: string,
    singers: Singer[]
}
type Singer = {
    name: string
}

export default function TitleSong({title, singers}: TitleSongProp){
    return(
        <div className="pt-1">
            <h2 className="text-lg font-bold truncate text-slate-100">
            {title ? title : "គ្មានបទចម្រៀង"}
            </h2>
            <p className="text-xs text-purple-400 font-medium mt-1 truncate">
            {singers ? singers.map((s)=>s.name) : "---"}
            </p>
        </div>
    )
}