import { SkipBack, SkipForward,Pause, Play } from "lucide-react"

type MediaControl = {
    playPrevSong: ()=>void
    togglePlay: ()=>void
    isPlaying: boolean
    playNextSong: ()=>void
}


export default function MediaControl({playPrevSong, togglePlay, isPlaying, playNextSong}:MediaControl){
    return(
        <div className="flex items-center justify-center gap-6 pt-2">
              <button
                onClick={playPrevSong}
                className="p-2.5 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3.5 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/40 transition transform active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={playNextSong}
                className="p-2.5 rounded-full hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
    )
}