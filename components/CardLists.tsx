"use client"

import React from "react";
import GraphPlay from "./GraphPlay";

interface SongsProp{
    songs: SongProp[]
    isPlaying: boolean
    currentIndex: number
    audioRef: React.RefObject<HTMLAudioElement | null>
    setCurrentIndex: (value: number)=>void
    setIsPlaying: (value: boolean)=> void
    hasMore: boolean
    loadingMore: boolean
    loadMoreError: string | null
    onLoadMore: () => void
}
type SongProp = {
    title: string
    product: string
    singers: SingerProp[]
}

type SingerProp = {
    name :string
}


export default function CardLists({songs, isPlaying, currentIndex, audioRef, setCurrentIndex, setIsPlaying, hasMore, loadingMore, loadMoreError, onLoadMore}: SongsProp){

    return(
        <div
          className="flex-1 max-h-[650px] min-h-[500px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700"
          onScroll={(event) => {
            const element = event.currentTarget;
            if (hasMore && element.scrollHeight - element.scrollTop - element.clientHeight < 120) {
              onLoadMore();
            }
          }}
        >
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
                          <div className="flex items-center gap-3 overflow-hidden w-full">
                            {/* <span className={`text-sm font-semibold w-6 text-center ${isActive ? "text-purple-400" : "text-slate-500"}`}>
                              {index + 1}
                            </span> */}
                            <div className="truncate w-full">
                              <p className={`font-medium truncate ${isActive ? "text-purple-200 font-semibold" : "group-hover:text-white"}`}>
                                {song.title}
                              </p>
                              <div className=" w-full flex justify-between text-slate-400 text-xs  truncate">
                                <p>{song.singers.map(s=>s.name)}</p>
                                {song.product && <p >{song.product}</p>}
                                <p>{index+1}</p>
                              </div>
                            </div>
                          </div>
        
                          {isActive && isPlaying && (
                            <GraphPlay
                                audioRef={audioRef}
                                isPlaying={isPlaying}
                            />
                          )}
                        </button>
                      );
                    })}
                    {loadingMore && <p className="py-3 text-center text-sm text-slate-400">កំពុងផ្ទុកបទបន្ថែម...</p>}
                    {loadMoreError && (
                      <div role="alert" className="flex items-center justify-between gap-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                        <span>ផ្ទុកបទបន្ថែមមិនបាន៖ {loadMoreError}</span>
                        <button type="button" onClick={onLoadMore} className="underline">ព្យាយាមម្ដងទៀត</button>
                      </div>
                    )}
                  </div>
    )
}
