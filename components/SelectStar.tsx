"use client";

import { useState } from "react";

type Singer = { id: number; name: string };

type SelectStarProps = {
  singers: Singer[];
  selectedSingers: string[];
  onChange: (singers: string[]) => void;
};

export default function SelectStar({ singers, selectedSingers, onChange }: SelectStarProps) {
  const [search, setSearch] = useState("");
  const [newSinger, setNewSinger] = useState("");

  const toggleSinger = (name: string) => {
    onChange(
      selectedSingers.includes(name)
        ? selectedSingers.filter((singer) => singer !== name)
        : [...selectedSingers, name],
    );
  };

  const addSinger = () => {
    const name = newSinger.trim();
    if (name && !selectedSingers.includes(name)) {
      onChange([...selectedSingers, name]);
    }
    setNewSinger("");
  };

  const filteredSingers = singers.filter((singer) =>
    singer.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <fieldset className="space-y-3">
      <legend className="font-medium">តារាចម្រៀង (អាចជ្រើសច្រើននាក់)</legend>

      {selectedSingers.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="តារាចម្រៀងដែលបានជ្រើស">
          {selectedSingers.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggleSinger(name)}
              className="badge badge-primary badge-outline cursor-pointer"
              aria-label={`ដក ${name} ចេញ`}
            >
              {name} ×
            </button>
          ))}
        </div>
      )}

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="input input-bordered w-full"
        placeholder="វាយឈ្មោះដើម្បីស្វែងរក..."
      />

      <div className="max-h-52 overflow-y-auto rounded-lg border p-2">
        {filteredSingers.length > 0 ? (
          filteredSingers.map((singer) => (
            <label key={singer.id} className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-base-200">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={selectedSingers.includes(singer.name)}
                onChange={() => toggleSinger(singer.name)}
              />
              <span>{singer.name}</span>
            </label>
          ))
        ) : (
          <p className="p-3 text-sm text-gray-500">រកមិនឃើញតារាចម្រៀងនេះទេ។</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          value={newSinger}
          onChange={(event) => setNewSinger(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addSinger();
            }
          }}
          className="input input-bordered w-full"
          placeholder="បញ្ចូលតារាចម្រៀងថ្មី"
        />
        <button type="button" onClick={addSinger} className="btn btn-outline">
          បន្ថែម
        </button>
      </div>
    </fieldset>
  );
}
