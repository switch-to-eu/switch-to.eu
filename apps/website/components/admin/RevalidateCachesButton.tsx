"use client";

import { useState } from "react";

const TAGS = ["services", "guides", "categories", "pages", "landing-pages"];

export default function RevalidateCachesButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/revalidate-caches", {
        method: "POST",
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { revalidated: string[] };
      setStatus(`Revalidated: ${data.revalidated.join(", ")}`);
    } catch (err) {
      setStatus(`Failed: ${err instanceof Error ? err.message : "unknown"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        padding: "1rem 1.25rem",
        border: "1px solid var(--theme-elevation-100)",
        borderRadius: 6,
        marginBottom: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      <div>
        <strong>Revalidate caches</strong>
        <div style={{ fontSize: 13, color: "var(--theme-elevation-500)" }}>
          Bust the Next.js data cache for {TAGS.join(", ")}. Use after changing
          media URL config or other cached fields.
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="btn btn--style-primary"
          style={{ alignSelf: "flex-start" }}
        >
          {loading ? "Revalidating…" : "Revalidate all caches"}
        </button>
        {status && <span style={{ fontSize: 13 }}>{status}</span>}
      </div>
    </div>
  );
}
