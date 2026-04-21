"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "@switch-to-eu/i18n/navigation";

interface Props {
  placeholder: string;
  submitLabel: string;
}

export function CantFindItForm({ placeholder, submitLabel }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="flex items-center gap-2 sm:gap-3 rounded-full bg-white border border-brand-green/20 pl-5 sm:pl-6 pr-1.5 py-1.5 focus-within:border-brand-green/50">
      <Search className="h-5 w-5 text-brand-green/50 shrink-0" aria-hidden="true" />
      <input
        type="search"
        name="q"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="flex-grow py-2.5 text-base text-brand-green placeholder:text-brand-green/40 bg-transparent focus:outline-none"
        aria-label={placeholder}
      />
      <button
        type="submit"
        className="shrink-0 inline-flex items-center justify-center px-5 py-2 rounded-full bg-brand-green text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
        disabled={!query.trim()}
      >
        {submitLabel}
      </button>
    </form>
  );
}
