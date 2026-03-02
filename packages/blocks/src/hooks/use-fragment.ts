"use client";

import { useState, useEffect } from "react";

export interface FragmentState {
  /** Whether the hash fragment has been parsed (false during SSR / before hydration) */
  ready: boolean;
  /** Parsed key/value pairs from the URL hash fragment */
  params: Record<string, string>;
}

/** Parse key/value pairs from the URL hash fragment (`#key=value&token=value`).
 *  The hash fragment never leaves the browser, making it safe for E2E encryption keys. */
export function useFragment(): FragmentState {
  const [state, setState] = useState<FragmentState>({
    ready: false,
    params: {},
  });

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      setState({ ready: true, params: {} });
      return;
    }

    const fragment = hash.startsWith("#") ? hash.substring(1) : hash;
    const urlParams = new URLSearchParams(fragment);
    const result: Record<string, string> = {};
    for (const [key, value] of urlParams.entries()) {
      result[key] = value;
    }
    setState({ ready: true, params: result });
  }, []);

  return state;
}
