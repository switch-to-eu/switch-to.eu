"use client";

import { useState, useEffect } from "react";

/** Parse key/value pairs from the URL hash fragment */
export function useFragment(): Record<string, string> {
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const fragment = hash.startsWith("#") ? hash.substring(1) : hash;
    const urlParams = new URLSearchParams(fragment);
    const result: Record<string, string> = {};
    for (const [key, value] of urlParams.entries()) {
      result[key] = value;
    }
    setParams(result);
  }, []);

  return params;
}
