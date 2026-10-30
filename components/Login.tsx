"use client";

import {useState } from "react";

type LoginProps = {
  onLoginSuccess: () => void;
};

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ចូលគណនីមិនបានជោគជ័យ");
      }

      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ចូលគណនីមិនបានជោគជ័យ");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black/60 px-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="w-full max-w-sm rounded-xl bg-gray-800 p-6 shadow-xl"
      >
        <h1 id="login-title" className="mb-5 text-2xl font-bold">
          សូមចូលគណនី
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2">
            <span>ឈ្មោះអ្នកប្រើ</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
              className="input input-bordered w-full"
            />
          </label>
          <label className="block space-y-2">
            <span>ពាក្យសម្ងាត់</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="input input-bordered w-full"
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
            {isSubmitting ? "កំពុងចូល..." : "ចូលគណនី"}
          </button>
        </form>
      </section>
    </main>
  );
}
