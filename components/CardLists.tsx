"use client"

import GraphPlay from "./GraphPlay";

interface SongsProp{
    songs: SongProp[]
    isPlaying: boolean
    currentIndex: number
    setCurrentIndex: (value: number)=>void
    setIsPlaying: (value: boolean)=> void
}
type SongProp = {
    title: string
    singers: SingerProp[]
}

type SingerProp = {
    name :string
}

export default function CardLists({songs, isPlaying, currentIndex,setCurrentIndex,setIsPlaying}:SongsProp){
    return(
        <div className="flex-1 max-h-[380px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
                    {songs.map((song, index) => {
                      const isActive = index === currentIndex;
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentIndex(index);
                            setIsPlaying(true);
                          }}
                          className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 group text-left ${
                            isActive
                              ? "bg-purple-600/20 border border-purple-500/40 text-purple-300"
                              : "bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className={`text-sm font-semibold w-6 text-center ${isActive ? "text-purple-400" : "text-slate-500"}`}>
                              {index + 1}
                            </span>
                            <div className="truncate">
                              <p className={`font-medium truncate ${isActive ? "text-purple-200 font-semibold" : "group-hover:text-white"}`}>
                                {song.title}
                              </p>
                              <p className="text-xs text-slate-400 truncate">{song.singers.map(s=>s.name)}</p>
                            </div>
                          </div>
        
                          {isActive && isPlaying && (
                            <GraphPlay/>
                          )}
                        </button>
                      );
                    })}
                  </div>
    )
}
