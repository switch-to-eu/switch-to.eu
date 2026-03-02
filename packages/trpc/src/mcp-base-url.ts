import { headers } from "next/headers";

function isAllowedHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "switch-to.eu" ||
    hostname.endsWith(".switch-to.eu") ||
    hostname === "switch-to.test" ||
    hostname.endsWith(".switch-to.test") ||
    hostname.endsWith(".vercel.app")
  );
}

/**
 * Derive the base URL from the incoming request headers (production domain),
 * with an allowlist to prevent host header injection.
 * Falls back to env vars for non-allowed hosts.
 */
export async function getMcpBaseUrl(fallbackPort: number): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const hostname = host?.split(":")[0];
  if (host && hostname && isAllowedHost(hostname)) {
    const proto = h.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? fallbackPort}`;
}
