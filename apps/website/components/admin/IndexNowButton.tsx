"use client";

import { useEffect, useState } from "react";

export default function IndexNowButton() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/indexnow/submit-all", { method: "GET" })
      .then(async (r) => {
        if (!r.ok) throw new Error(r.statusText);
        const data = (await r.json()) as { count: number };
        setCount(data.count);
      })
      .catch(() => setCount(null));
  }, []);

  async function handleSubmit() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/indexnow/submit-all", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as {
        submitted: number;
        batches?: number;
        skipped?: string;
      };
      if (data.skipped) {
        setStatus(`Skipped: ${data.skipped}`);
      } else {
        setStatus(
          `Submitted ${data.submitted} URLs in ${data.batches ?? 1} batch(es)`
        );
      }
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
        <strong>IndexNow</strong>
        <div style={{ fontSize: 13, color: "var(--theme-elevation-500)" }}>
          {count === null
            ? "Counting URLs…"
            : `${count} URLs ready to submit (all locales, published only).`}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || count === 0}
          className="btn btn--style-primary"
          style={{ alignSelf: "flex-start" }}
        >
          {loading ? "Submitting…" : "Submit all URLs to IndexNow"}
        </button>
        {status && <span style={{ fontSize: 13 }}>{status}</span>}
      </div>
    </div>
  );
}
