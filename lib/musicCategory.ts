'use client'

import { useSyncExternalStore } from "react"

export const musicCategories = [
  { title: "សម័យ", api: "/api/song" },
  { title: "បុរាណ", api: "/api/oldsong" },
] as const

const storageKey = "music-category"
const defaultApi = musicCategories[0].api
const categoryChangeEvent = "music-category-change"

function isMusicApi(value: string | null): value is (typeof musicCategories)[number]["api"] {
  return musicCategories.some((category) => category.api === value)
}

function getSnapshot() {
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

export function getSelectedMusicApi() {
  return getSnapshot()
}

export function selectMusicCategory(api: (typeof musicCategories)[number]["api"]) {
  try {
    localStorage.setItem(storageKey, api)
  } catch {
    // Keep the current page usable if browser storage is unavailable.
  }
  window.dispatchEvent(new CustomEvent(categoryChangeEvent, { detail: { api } }))
}
