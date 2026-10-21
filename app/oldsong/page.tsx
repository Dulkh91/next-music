"use client";

import { useEffect, useState, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Music, Disc } from "lucide-react";

interface SongType {
  title: string;
  singer: string;
  url: string;
  coverUrl?: string;
}

export default function OldSong() {
  const [oldSong, setOldSong] = useState<SongType[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  // States សម្រាប់ Progress Bar
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch("/api/oldsong")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch api oldsong");
        return r.json();
      })
      .then((data) => {
        setOldSong(data);
      })
      .catch((e) => console.error(e));
  }, []);

  const currentSong = oldSong[currentIndex];

  const playNextSong = () => {
    if (oldSong.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % oldSong.length);
    setIsPlaying(true);
  };

  const playPrevSong = () => {
    if (oldSong.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + oldSong.length) % oldSong.length);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // ពេលដូរ Time តាមរយៈ Progress Bar
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };


  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex justify-center items-center font-sans">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-2xl">
        
        {/* ផ្នែក Music Player */}
        <div className="md:col-span-5 flex flex-col items-center justify-between bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
          <div className="w-full text-center space-y-4">
            {/* រូប Disk Animation */}
            <div className="relative w-40 h-40 mx-auto mt-2 hidden md:flex items-center justify-center">
              <div
                className={`w-full h-full rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-1 shadow-lg shadow-purple-500/30 ${
                  isPlaying ? "animate-spin" : ""
                }`}
                style={{ animationDuration: "12s" }}
              >
                <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center overflow-hidden border-4 border-slate-800">
                  {currentSong?.coverUrl ? (
                    <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
                  ) : (
                    <Disc className="w-16 h-16 text-purple-400" />
                  )}
                </div>
              </div>
            </div>

            {/* ពត៌មានបទចម្រៀង */}
            <div className="pt-1">
              <h2 className="text-lg font-bold truncate text-slate-100">
                {currentSong ? currentSong.title : "គ្មានបទចម្រៀង"}
              </h2>
              <p className="text-xs text-purple-400 font-medium mt-1 truncate">
                {currentSong ? currentSong.singer : "---"}
              </p>
            </div>
          </div>

          {/* Audio Element & Events */}
          {currentSong && (
            <audio
              ref={audioRef}
              key={currentSong.url}
              src={currentSong.url}
              autoPlay={isPlaying}
              onEnded={playNextSong}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
              onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
              className="hidden"
            />
          )}

          {/* ប៊ូតុងបញ្ជា និង Progress Bar */}
          <div className="w-full mt-4 space-y-3">
            {/* Progress Bar */}
            <div className="space-y-1">
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Media Controls */}
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
          </div>
        </div>

        {/* ផ្នែក Playlist បទចម្រៀងទាំងអស់ */}
        <div className="md:col-span-7 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-slate-200 flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-400" /> បញ្ជីបទចម្រៀងចាស់ៗ ({oldSong.length})
          </h3>

          <div className="flex-1 max-h-[380px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {oldSong.map((song, index) => {
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
                      <p className="text-xs text-slate-400 truncate">{song.singer}</p>
                    </div>
                  </div>

                  {isActive && isPlaying && (
                    <div className="flex items-end gap-0.5 h-4 ml-2">
                      <span className="w-1 bg-purple-400 animate-bounce h-full rounded-full"></span>
                      <span className="w-1 bg-purple-400 animate-bounce delay-100 h-2/3 rounded-full"></span>
                      <span className="w-1 bg-purple-400 animate-bounce delay-200 h-4/5 rounded-full"></span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}