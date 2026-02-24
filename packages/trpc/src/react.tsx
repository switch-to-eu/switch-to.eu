"use client";

import { type QueryClient } from "@tanstack/react-query";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") return createQueryClient();
  clientQueryClientSingleton ??= createQueryClient();
  return clientQueryClientSingleton;
}

export function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export { createTRPCReact } from "@trpc/react-query";
