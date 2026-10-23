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
type SongPage = {
  data: Music[]
  nextOffset: number
  hasMore: boolean
}
type CachedSongList = SongPage & { songs: Music[] }

function getSongCacheKey(api: string, query: string, sort: string) {
  return `${api}::${query.trim().toLocaleLowerCase()}::${sort}`;
}

import { useCallback, useEffect, useRef, useState } from "react";


import DiskAnimate from "@/components/DiskAnimation";
import TitleSong from "@/components/TitleSong";
import ProgressBar from "@/components/ProgressBar";
import MediaControl from "@/components/MediaControl";
import CardLists from "@/components/CardLists";
import Skeleton from "@/components/Skeleton";
import AlertError from "@/components/AlertError";
import SearchSong from "@/components/SearchSong";
import PlaylistFilter from "@/components/PlaylistFilter";
import { getSelectedMusicApi, musicCategories, useMusicCategory } from "@/lib/musicCategory";
import { getPlaylistSort, savePlaylistMode, usePlaylistMode } from "@/lib/playlistMode";
import type { PlaylistMode } from "@/lib/playlistMode";


export default function Home() {
  const [songs, setSongs] = useState<Music[]>([]);
  const selectedApi = useMusicCategory();
  const playlistMode = usePlaylistMode();
  const playlistSort = getPlaylistSort(playlistMode);
  const category = musicCategories.find((item) => item.api === selectedApi)?.title ?? "សម័យ";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true)
  const [errors, setErrors] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const songsCacheRef = useRef(new Map<string, CachedSongList>());
  const activeApiRef = useRef(selectedApi);
  const activeSearchRef = useRef(debouncedSearch);
  const activeSortRef = useRef(playlistSort);
  const moreControllerRef = useRef<AbortController | null>(null);
  const loadingMoreRef = useRef(false);
  

  

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const query = searchText.trim();
      if (query === debouncedSearch) return;

      setLoading(true);
      setErrors(null);
      setSongs([]);
      setHasMore(false);
      setCurrentIndex(0);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setLoadMoreError(null);
      moreControllerRef.current?.abort();
      moreControllerRef.current = null;
      loadingMoreRef.current = false;
      setLoadingMore(false);
      setDebouncedSearch(query);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [searchText, debouncedSearch]);

  useEffect(() => {
    let controller: AbortController | null = null;

    const fetchSongs = async (api: string, query: string, sort: string) => {
      controller?.abort();
      const requestController = new AbortController();
      controller = requestController;

      try {
        const params = new URLSearchParams({ offset: "0", limit: "100" });
        if (query) params.set("q", query);
        params.set("sort", sort);
        const response = await fetch(`${api}?${params}`, { signal: requestController.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const page: SongPage = await response.json();
        songsCacheRef.current.set(getSongCacheKey(api, query, sort), { ...page, songs: page.data });
        setErrors(null);
        setSongs(page.data);
        setHasMore(page.hasMore);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setErrors(error instanceof Error ? error.message : "មិនអាចទាញយកបទចម្រៀងបានទេ");
        console.error(error);
      } finally {
        if (controller === requestController && !requestController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const handleCategoryChange = (event: Event) => {
      const { api } = (event as CustomEvent<{ api: typeof selectedApi }>).detail;
      if (api === activeApiRef.current) return;
      activeApiRef.current = api;

      controller?.abort();
      moreControllerRef.current?.abort();
      moreControllerRef.current = null;
      loadingMoreRef.current = false;
      setLoadingMore(false);
      setLoadMoreError(null);

      const query = activeSearchRef.current;
      const sort = activeSortRef.current;
      const cachedList = songsCacheRef.current.get(getSongCacheKey(api, query, sort));
      if (cachedList) {
        controller = null;
        setErrors(null);
        setSongs(cachedList.songs);
        setHasMore(cachedList.hasMore);
        setCurrentIndex(0);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrors(null);
      setHasMore(false);
      setSongs([]);
      setCurrentIndex(0);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
      void fetchSongs(api, query, sort);
    };

    window.addEventListener("music-category-change", handleCategoryChange);
    const initialApi = getSelectedMusicApi();
    activeApiRef.current = initialApi;
    activeSearchRef.current = debouncedSearch;
    activeSortRef.current = playlistSort;
    void fetchSongs(initialApi, debouncedSearch, playlistSort);

    return () => {
      controller?.abort();
      moreControllerRef.current?.abort();
      moreControllerRef.current = null;
      window.removeEventListener("music-category-change", handleCategoryChange);
    };
  }, [debouncedSearch, playlistSort]);

  const loadMoreSongs = useCallback(async () => {
    const api = activeApiRef.current;
    const query = activeSearchRef.current;
    const sort = activeSortRef.current;
    const cacheKey = getSongCacheKey(api, query, sort);
    const cachedList = songsCacheRef.current.get(cacheKey);
    if (!cachedList?.hasMore || loadingMoreRef.current) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadMoreError(null);
    const controller = new AbortController();
    moreControllerRef.current = controller;

    try {
      const params = new URLSearchParams({ offset: String(cachedList.nextOffset), limit: "100" });
      if (query) params.set("q", query);
      params.set("sort", sort);
      const response = await fetch(`${api}?${params}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const page: SongPage = await response.json();
      if (controller.signal.aborted || activeApiRef.current !== api) return;

      const updatedList: CachedSongList = {
        data: [...cachedList.data, ...page.data],
        songs: [...cachedList.songs, ...page.data],
        nextOffset: page.nextOffset,
        hasMore: page.hasMore,
      };
      songsCacheRef.current.set(cacheKey, updatedList);
      setSongs(updatedList.songs);
      setHasMore(updatedList.hasMore);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setLoadMoreError(error instanceof Error ? error.message : "មិនអាចទាញយកបទបន្ថែមបានទេ");
      console.error(error);
    } finally {
      if (moreControllerRef.current === controller) {
        moreControllerRef.current = null;
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, []);

  const handlePlaylistModeChange = useCallback((mode: PlaylistMode) => {
    const nextSort = getPlaylistSort(mode);
    savePlaylistMode(mode);
    if (nextSort === playlistSort) return;

    setLoading(true);
    setErrors(null);
    setSongs([]);
    setHasMore(false);
    setCurrentIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setLoadMoreError(null);
    moreControllerRef.current?.abort();
    moreControllerRef.current = null;
    loadingMoreRef.current = false;
    setLoadingMore(false);
  }, [playlistSort]);

  const currentSong = songs[currentIndex];

  const playNextSong = useCallback(() => {
    if (songs.length === 0) return;
    if (playlistMode === "random" && songs.length > 1) {
      const jump = Math.floor(Math.random() * (songs.length - 1)) + 1;
      setCurrentIndex((prevIndex) => (prevIndex + jump) % songs.length);
    } else {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % songs.length);
    }
    setIsPlaying(true);
  }, [songs.length, playlistMode]);

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
      audioRef.current.play()
      .catch((error: unknown) => {
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

      <div className="w-full max-w-4xl grid grid-cols-1 md:items-center md:grid-cols-12 gap-6 bg-slate-900/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-2xl">
        
        {/* ផ្នែក Music Player */}
          <div className="md:col-span-5 flex flex-col  min-h-[60%] items-center justify-between bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
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
                handleProgressChange={handleProgressChange}
              />
            
              {/* Media Controls */}
              <MediaControl
                playPrevSong={playPrevSong}
                togglePlay={togglePlay}
                isPlaying={isPlaying}
                playNextSong={playNextSong}
              />
            </div>
          </div>

        {/* ផ្នែក Playlist បទចម្រៀងទាំងអស់ */}
        <div className="md:col-span-7 flex flex-col">
          <div className="mb-3 flex w-full min-w-0 items-center gap-2">
            <div className="min-w-0 flex-1">
              <SearchSong
                category={category}
                value={searchText}
                onSearchChange={setSearchText}
              />
            </div>
            <PlaylistFilter mode={playlistMode} onChange={handlePlaylistModeChange} />
          </div>
          
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} />)}
            </div>
          ) : errors ? ( 
          <AlertError title={errors}/>
          ) : songs.length === 0 ? (
            <p className="py-8 text-center text-slate-400">
              {debouncedSearch ? "រកមិនឃើញបទចម្រៀងដែលត្រូវនឹងការស្វែងរកទេ" : "មិនមានបទចម្រៀងទេ"}
            </p>
          ) : (
            <CardLists
            songs={songs}
            isPlaying={isPlaying}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            setIsPlaying={setIsPlaying}
            audioRef={audioRef}
            hasMore={hasMore}
            loadingMore={loadingMore}
            loadMoreError={loadMoreError}
            onLoadMore={loadMoreSongs}
          />
          )}

        </div>

      </div>
    
  );
}


