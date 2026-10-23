'use client'

import { useSyncExternalStore } from "react"

export const musicCategories = [
  { title: "បុរាណ", api: "/api/oldsong" },
  { title: "សម័យ", api: "/api/song" },
] as const

const storageKey = "music-category"
const defaultApi = musicCategories[0].api
const categoryChangeEvent = "music-category-change"
export type MusicApi = (typeof musicCategories)[number]["api"]

function isMusicApi(value: string | null): value is MusicApi {
  return musicCategories.some((category) => category.api === value)
}

function getSnapshot(): MusicApi {
  try {
    const savedApi = localStorage.getItem(storageKey)
    return isMusicApi(savedApi) ? savedApi : defaultApi
  } catch {
    return defaultApi
  }
}

function getServerSnapshot() {
  return defaultApi
}

function subscribe(callback: () => void) {
  window.addEventListener(categoryChangeEvent, callback)
  window.addEventListener("storage", callback)
  return () => {
    window.removeEventListener(categoryChangeEvent, callback)
    window.removeEventListener("storage", callback)
  }
}

export function useMusicCategory() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function getSelectedMusicApi(): MusicApi {
  return getSnapshot()
}

export function selectMusicCategory(api: MusicApi) {
  try {
    localStorage.setItem(storageKey, api)
  } catch {
    // Keep the current page usable if browser storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(categoryChangeEvent, { detail: { api } }))
}
