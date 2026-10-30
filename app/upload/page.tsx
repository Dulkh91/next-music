"use client";

import React, { useEffect, useRef, useState } from "react";
import SelectField from "@/components/SelectField";
import SelectedCategory from "../../components/SelectedCategory";
import SelectStar from "../../components/SelectStar";
import Login from "@/components/Login";

type Singer = { id: number; name: string };
type Product = {id: number, name:string}

export default function UploadSong() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [singers, setSingers] = useState<Singer[]>([]);
  const [selectedSingers, setSelectedSingers] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [product, setProduct] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState("");
  const [newProduct, setNewProduct] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [authStatus, setAuthStatus] = useState<"checking" | "signed-in" | "signed-out">("checking");

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me");
        if (!cancelled) setAuthStatus(response.ok ? "signed-in" : "signed-out");
      } catch {
        if (!cancelled) setAuthStatus("signed-out");
      }
    }

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authStatus !== "signed-in") return;

    async function loadOptions() {
      try {
        const [singerResponse, productResponse] = await Promise.all([
          fetch("/api/singer"),
          fetch("/api/product"),
        ]);
        if (!singerResponse.ok) throw new Error("មិនអាចទាញបញ្ជីតារាចម្រៀងបានទេ");
        if (!productResponse.ok) throw new Error("មិនអាចទាញបញ្ជីផលិតកម្មបានទេ");
        setSingers((await singerResponse.json()) as Singer[]);
        setProduct((await productResponse.json()) as Product[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "មានបញ្ហាក្នុងការទាញទិន្នន័យ");
      }
    }

    void loadOptions();
  }, [authStatus]);

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("សូមជ្រើសរើសឯកសារចម្រៀង");
      return;
    }
    if (!title.trim() || !category.trim()) {
      setError("សូមបំពេញចំណងជើង និងប្រភេទចម្រៀង");
      return;
    }
    const productName = selectedProduct === "new" ? newProduct.trim() : selectedProduct.trim();
    if (!productName) {
      setError("សូមជ្រើសរើស ឬបញ្ចូលឈ្មោះផលិតកម្ម");
      return;
    }
    if (selectedSingers.length === 0) {
      setError("សូមជ្រើសរើស ឬបញ្ចូលតារាចម្រៀងយ៉ាងហោចណាស់ម្នាក់");
      return;
    }

    setSaving(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append("audio", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok || !uploadData.fileId) {
        throw new Error(uploadData.error || "Upload ចម្រៀងមិនបានជោគជ័យ");
      }

      const saveResponse = await fetch("/api/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          url: uploadData.fileId,
          category: category.trim(),
          product: productName,
          singers: selectedSingers,
        }),
      });
      const saveData = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(saveData.error || "មិនអាចរក្សាទុកព័ត៌មានបទចម្រៀងបានទេ");
      }

      setMessage("បានរក្សាទុកបទចម្រៀងដោយជោគជ័យ!");
      setTitle("");
      setCategory("");
      setSelectedProduct("");
      setNewProduct("");
      setSelectedSingers([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      const [singerResponse, productResponse] = await Promise.all([
        fetch("/api/singer"),
        fetch("/api/product"),
      ]);
      if (singerResponse.ok) setSingers(await singerResponse.json());
      if (productResponse.ok) setProduct(await productResponse.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "មានបញ្ហាក្នុងការរក្សាទុក");
    } finally {
      setSaving(false);
    }
  };

  
  if (authStatus === "checking") {
    return <main className="flex min-h-screen items-center justify-center bg-black/40"><span className="loading loading-spinner loading-xl"></span></main>;
  }

  if (authStatus === "signed-out") {
    return <Login onLoginSuccess={() => setAuthStatus("signed-in")} />;
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-5 rounded-xl bg-gray-800 p-6 shadow">
        <h1 className="text-2xl font-bold">បញ្ចូលបទចម្រៀង</h1>

        <label className="block space-y-2">
          <span className="font-medium">ឯកសារចម្រៀង</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            required
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setTitle(file.name.replace(/\.[^/.]+$/, ""));
            }}
            className="file-input file-input-bordered w-full"
          />
        </label>

        <label className="block space-y-2">
          <span className="font-medium">ចំណងជើងចម្រៀង</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="input input-bordered w-full"
            placeholder="ចំណងជើងចម្រៀង"
          />
        </label>

        <fieldset className="space-y-3">
          <legend className="font-medium">ប្រភេទចម្រៀង</legend>
           <SelectedCategory value={category} onChange={setCategory} />
        </fieldset>
  
        
        
       {/** ====== Field ផលិតកម្ម ======== */}     
        <SelectField
          product={product}
          titleLable="ផលិតកម្ម"
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          newProduct={newProduct}
          setNewProduct={setNewProduct}
        />

        <SelectStar
          singers={singers}
          selectedSingers={selectedSingers}
          onChange={setSelectedSingers}
        />



         
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {message && <p role="status" className="text-sm text-green-700">{message}</p>}

        <button type="submit" disabled={saving} className="btn btn-primary w-full">
          {saving ? "កំពុងរក្សាទុក..." : "រក្សាទុកបទចម្រៀង"}
        </button>
      </form>
    </main>
  );
}
