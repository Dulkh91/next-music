'use client'

import { useState } from "react"
import { ChevronRight, Music, Search } from "lucide-react"

type SearchSongProps = {
  category: string
  value: string
  onSearchChange: (value: string) => void
}

export default function SearchSong({ category, value, onSearchChange }: SearchSongProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleSearch = () => {
    if (isOpen) onSearchChange("")
    setIsOpen((open) => !open)
  }

  return (
    <div className="flex w-full min-w-0 items-center gap-2">
      <Music className="h-5 w-5 shrink-0 text-purple-400" />
      {!isOpen && (
        <h3 className="flex-1 truncate text-lg font-semibold text-slate-200">
          បញ្ជីបទចម្រៀង{category}
        </h3>
      )}
      <div className={`flex min-w-0 items-center overflow-hidden rounded-xl transition-all duration-300 ${isOpen ? "flex-1" : "w-9 shrink-0"}`}>
        <button
          type="button"
          aria-label={isOpen ? "បិទការស្វែងរក" : "បើកការស្វែងរក"}
          onClick={toggleSearch}
          className="flex h-9 w-9 shrink-0 items-center justify-center text-slate-300 transition hover:text-white"
        >
          {isOpen ? <ChevronRight className="h-5 w-5" /> : <Search className="h-5 w-5" />}
        </button>
        <input
          type="search"
          value={value}
          onChange={(event) => onSearchChange(event.target.value)}
          tabIndex={isOpen ? 0 : -1}
          aria-hidden={!isOpen}
          placeholder="ស្វែងរកចំណងជើង ឬតារាចម្រៀង"
          className={`min-w-0 rounded-xl border border-gray-400 bg-slate-800 p-1 text-white outline-none transition-all duration-300 ${isOpen ? "flex-1 opacity-100" : "w-0 border-transparent p-0 opacity-0"}`}
        />
      </div>
    </div>
  )
}
