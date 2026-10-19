"use client";
type Music = {
  id: number
  title: string
  url: string
  singers:    Singer[]
  category: string
}
type Singer ={
  name: string
}




import { useEffect, useState } from "react";

export default function Home() {
  const [songs, setSongs] = useState<Music[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch("/api/song")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch song api");
        return r.json();
      })
      .then(setSongs)
      .catch(console.error);
  }, []);

  const currentSong = songs[currentIndex];

  const playNextSong = () => {
    setCurrentIndex((prevIndex) => {
      return (prevIndex + 1) % songs.length;
    });
  };

  return (
    <main className="min-h-screen">
      {currentSong && (
        <div className="space-y-2">
          <p>{currentSong.title}</p>

          <audio
            key={currentSong.id}
            src={currentSong.url}
            controls
            preload="none"
            autoPlay
            onEnded={playNextSong}
          />
        </div>
      )}

      <div className="mt-4 space-y-2">
        {songs.map((song, index) => (
          <button
            key={song.id}
            onClick={() => setCurrentIndex(index)}
            className="block"
          >
            {song.title}
          </button>
        ))}
      </div>
    </main>
  );
}


