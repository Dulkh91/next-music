'use client'

import { musicCategories, selectMusicCategory, useMusicCategory } from "@/lib/musicCategory"

export default function Navbar() {
    const activeApi = useMusicCategory()

    return (
        <div role="tablist" className="tabs tabs-lift justify-center">
            {musicCategories.map((item) => (
                <button
                    key={item.title}
                    type="button"
                    role="tab"
                    aria-selected={activeApi === item.api}
                    className={`tab ${activeApi === item.api ? "tab-active" : ""}`}
                    onClick={() => selectMusicCategory(item.api)}
                >
                    {item.title}
                </button>
            ))}
        </div>
    )
}
