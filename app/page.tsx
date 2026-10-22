"use client";

type Music = {
  id: number
  title: string
  url: string
  singers:    Singer[]
  category?: string
  coverUrl?: string
}
type Singer ={
  name: string
}

import { Music } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";


import DiskAnimate from "@/components/DiskAnimation";
import TitleSong from "@/components/TitleSong";
import ProgressBar from "@/components/ProgressBar";
import MediaControl from "@/components/MediaControl";
import CardLists from "@/components/CardLists";
import { getSelectedMusicApi, musicCategories, useMusicCategory } from "@/lib/musicCategory";


export default function Home() {
  const [songs, setSongs] = useState<Music[]>([]);
  const selectedApi = useMusicCategory();
  const category = musicCategories.find((item) => item.api === selectedApi)?.title ?? "សម័យ";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    let controller = new AbortController();

    const loadSongs = async (api: string) => {
      controller.abort();
      controller = new AbortController();
      setSongs([]);
      setCurrentIndex(0);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(true);

      try {
        const response = await fetch(api, { signal: controller.signal });
        if (!response.ok) throw new Error(`Failed to fetch ${api}`);
        setSongs(await response.json());
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error(error);
      }
    };

    const handleCategoryChange = (event: Event) => {
      const { api } = (event as CustomEvent<{ api: string }>).detail;
      void loadSongs(api);
    };

    const initialApi = getSelectedMusicApi();
    const initialController = new AbortController();
    controller = initialController;
    fetch(initialApi, { signal: initialController.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch ${initialApi}`);
        return response.json();
      })
      .then(setSongs)
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error(error);
      });

    window.addEventListener("music-category-change", handleCategoryChange);

    return () => {
      controller.abort();
      window.removeEventListener("music-category-change", handleCategoryChange);
    };
  }, []);

  const currentSong = songs[currentIndex];

  const playNextSong = useCallback(() => {
    if (songs.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % songs.length);
    setIsPlaying(true);
  }, [songs.length]);

  const playPrevSong = useCallback(() => {
    if (songs.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + songs.length) % songs.length);
    setIsPlaying(true);
  }, [songs.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong || !isPlaying) return;

    // The audio element is mounted after the playlist request completes, so
    // explicitly start it once the selected source is available.
    audio.play().catch((error: unknown) => {
      // Browsers can block audible autoplay until the user interacts with the page.
      console.warn("Audio playback could not start automatically:", error);
      setIsPlaying(false);
    });
  }, [currentSong?.url, currentSong, isPlaying]);

  useEffect(() => {
    if (!currentSong || !("mediaSession" in navigator)) return;

    const session = navigator.mediaSession;
    const audio = audioRef.current;
    if (!audio) return;

    if ("MediaMetadata" in window) {
      session.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.singers.map((singer) => singer.name).join(", "),
        album: currentSong.category,
        artwork: currentSong.coverUrl
          ? [{ src: new URL(currentSong.coverUrl, window.location.href).href }]
          : [],
      });
    }

    const setHandler = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler,
    ) => {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // Some browsers expose Media Session but do not support every action.
      }
    };

    setHandler("play", () => {
      audio.play().catch((error: unknown) => console.error("Audio playback failed:", error));
    });
    setHandler("pause", () => audio.pause());
    setHandler("previoustrack", playPrevSong);
    setHandler("nexttrack", playNextSong);

    return () => {
      for (const action of ["play", "pause", "previoustrack", "nexttrack"] as const) {
        try {
          session.setActionHandler(action, null);
        } catch {
          // Ignore unsupported actions during cleanup.
        }
      }
    };
  }, [currentSong, playNextSong, playPrevSong]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error: unknown) => {
        console.error("Audio playback failed:", error);
        setIsPlaying(false);
      });
    }
  };

   // ពេលដូរ Time តាមរយៈ Progress Bar
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };
  
  

  return (
    // <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-8 flex justify-center items-center font-sans">

      <div className="w-full max-w-4xl grid grid-cols-1 md:items-center md:grid-cols-12 gap-6 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-2xl">
        
        {/* ផ្នែក Music Player */}
            <div className="md:col-span-5 flex flex-col h-[60%] items-center justify-between bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
            <div className="w-full text-center space-y-4">

              {/* រូប Disk Animation */}
              {currentSong &&<>
                <DiskAnimate
                  currentSong={{
                    title: currentSong.title,
                    coverUrl: currentSong.coverUrl,
                    isPlaying: isPlaying
                    
                  }}
                />

                {/* ពត៌មានបទចម្រៀង */}
                <TitleSong title={currentSong.title} singers={currentSong.singers}/>
                </>}
            </div>

            {/* Audio Element & Events */}
            {currentSong && (
              <audio
                ref={audioRef}
                src={currentSong.url}
                autoPlay={isPlaying}
                onEnded={playNextSong}
                onPlay={() => {
                  setIsPlaying(true)
                }}
                onPause={() => setIsPlaying(false)}
                onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
                onLoadedMetadata={() =>setDuration(audioRef.current?.duration || 0)}
                className="hidden"
              />
            )}

            {/* ប៊ូតុងបញ្ជា និង Progress Bar */}
            <div className="w-full mt-4 space-y-3">
              {/* Progress Bar */}
              <ProgressBar
                duration={duration}
                currentTime={currentTime}
                handleProgressChange={()=>handleProgressChange}
              />
            
              {/* Media Controls */}
              <MediaControl
                playPrevSong={playPrevSong}
                togglePlay={togglePlay}
                isPlaying
                playNextSong={playNextSong}
              />
            </div>
          </div>

        {/* ផ្នែក Playlist បទចម្រៀងទាំងអស់ */}
        <div className="md:col-span-7 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-slate-200 flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-400" /> បញ្ជីបទចម្រៀង{category} ({songs.length})
          </h3>

          <CardLists
            songs={songs}
            isPlaying={isPlaying}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            setIsPlaying={setIsPlaying}
            audioRef={audioRef}
          />

        </div>

      </div>
    // </main>
  );
}


