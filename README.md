# body post title 
```bash
{
  "title": "បទចម្រៀង",
  "url": "CQACAgUAAxkDAAMFatW9EXFc6JbkYhFjRHvZHPd6Bs0AAn8jAAKA57BWNvSMdPjWeUQ9BA",
  "category": "Pop",
  "singers": ["សិល្បករ ១", "សិល្បករ ២"]
}
```


```bash
<fieldset className="space-y-3">
          <legend className="font-medium">តារាចម្រៀង (អាចជ្រើសច្រើននាក់)</legend>
          {singers.length > 0 ? (
            <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded border p-3 sm:grid-cols-2">
              {singers.map((singer) => (
                <label key={singer.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSingers.includes(singer.name)}
                    onChange={() => toggleSinger(singer.name)}
                    className="checkbox checkbox-sm"
                  />
                  <span>{singer.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">មិនទាន់មានតារាចម្រៀងក្នុងបញ្ជីទេ។ បញ្ចូលឈ្មោះថ្មីខាងក្រោម។</p>
          )}

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
        </fieldset>
```

# multiselect 
```bash
<fieldset className="space-y-3">
          <legend className="font-medium">តារាចម្រៀង (អាចជ្រើសច្រើននាក់)</legend>
          {singers.length > 0 ? (
            <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded border p-3 sm:grid-cols-2">
              {singers.map((singer) => (
                <label key={singer.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSingers.includes(singer.name)}
                    onChange={() => toggleSinger(singer.name)}
                    className="checkbox checkbox-sm"
                  />
                  <span>{singer.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">មិនទាន់មានតារាចម្រៀងក្នុងបញ្ជីទេ។ បញ្ចូលឈ្មោះថ្មីខាងក្រោម។</p>
          )}

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
        </fieldset>
```