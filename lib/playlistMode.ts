'use client'

import { useSyncExternalStore } from "react"

export const playlistModes = ["normal", "az", "za", "random"] as const
export type PlaylistMode = (typeof playlistModes)[number]

const storageKey = "playlist-mode"
const eventName = "playlist-mode-change"

function isPlaylistMode(value: string | null): value is PlaylistMode {
  return playlistModes.some((mode) => mode === value)
}

function getSnapshot(): PlaylistMode {
  try {
    const savedMode = localStorage.getItem(storageKey)
    return isPlaylistMode(savedMode) ? savedMode : "normal"
  } catch {
    return "normal"
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(eventName, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(eventName, callback)
    window.removeEventListener("storage", callback)
  }
}

export function usePlaylistMode() {
  return useSyncExternalStore<PlaylistMode>(subscribe, getSnapshot, () => "normal")
}

export function savePlaylistMode(mode: PlaylistMode) {
  try {
    localStorage.setItem(storageKey, mode)
  } catch {
    // Keep playlist controls usable when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(eventName))
}

export function getPlaylistSort(mode: PlaylistMode): "normal" | "az" | "za" {
  return mode === "random" ? "normal" : mode
}
