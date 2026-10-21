"use client";

import { useEffect, useState } from "react"

type CategoryType = {
    id: number;
    name: string;
}

type SelectedCategoryProps = {
    value: string;
    onChange: (category: string) => void;
};

export default function SelectedCategory({ value, onChange }: SelectedCategoryProps) {
    const [category, setCategory] = useState<CategoryType[]>([])
    const [isCreatingNew, setIsCreatingNew] = useState(false)

    useEffect(()=>{
        fetch('/api/category')
        .then((r)=>{
            if(!r.ok) throw new Error("Failed to fetch Category")
            return r.json()
        })
        .then(setCategory)
        .catch((er)=> console.error(er))
    },[])

    return (<>
        <select 
            className="select select-bordered w-full"
            required
            value={isCreatingNew ? "new" : value}
            onChange={(event) => {
                if (event.target.value === "new") {
                    setIsCreatingNew(true)
                    onChange("")
                    return
                }

                setIsCreatingNew(false)
                onChange(event.target.value)
            }}
        >
            <option
                value=""
             disabled
             >ជ្រើសរើសប្រភេទចម្រៀង
             </option>
             
            {category.map((c)=>(
                <option key={c.id} value={c.name}>
                    {c.name}
                </option>
            ))}
            <option value="new">+ បញ្ចូលប្រភេទចម្រៀងថ្មី</option>
        </select>
        {isCreatingNew && (
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="input input-bordered w-full"
                type="text"
                placeholder="បញ្ចូលប្រភេទចម្រៀងថ្មី"
                required
            />)}
        </>
    )
}
