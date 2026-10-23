'use client'

import { playlistModes, type PlaylistMode } from "@/lib/playlistMode"

type PlaylistFilterProps = {
  mode: PlaylistMode
  onChange: (mode: PlaylistMode) => void
}

const modeLabels: Record<PlaylistMode, string> = {
  normal: "ធម្មតា",
  az: "A–Z",
  za: "Z–A",
  random: "ចាក់ចៃដន្យ",
}

export default function PlaylistFilter({ mode, onChange }: PlaylistFilterProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-300">
      <span className="sr-only">តម្រៀបបទចម្រៀង</span>
      <select
        value={mode}
        onChange={(event) => onChange(event.target.value as PlaylistMode)}
        aria-label="តម្រៀបបទចម្រៀង"
        className="max-w-32 rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-sm text-slate-200 outline-none focus:border-purple-500"
      >
        {playlistModes.map((item) => (
          <option key={item} value={item}>{modeLabels[item]}</option>
        ))}
      </select>
    </label>
  )
}
