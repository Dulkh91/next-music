'use client'

import { Disc } from "lucide-react"

interface CurrentSong {
    title: string
    coverUrl?: string 
    isPlaying: boolean
}
interface DiskAnimateProp{
    currentSong: CurrentSong
}


export default function DiskAnimate({currentSong}: DiskAnimateProp){

    return(
        <div className="relative w-40 h-40 mx-auto mt-2 hidden md:flex items-center justify-center">
              <div
                className={`w-full h-full rounded-full bg-line-to-tr from-purple-600 to-indigo-500 p-1 shadow-lg shadow-purple-500/30 ${
                  currentSong.isPlaying ? "animate-spin" : ""
                }`}
                style={{ animationDuration: "12s" }}
              >
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden border-4 border-slate-800">
                  {currentSong.coverUrl ? (
                    <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                  ) : (
                    <Disc className="w-16 h-16 text-purple-400" />
                  )}
                </div>
              </div>
            </div>
    )
}