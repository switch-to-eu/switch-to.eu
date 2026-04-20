const ENDPOINT = "https://api.indexnow.org/indexnow";

function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";
}

function siteHost(): string {
  return new URL(siteOrigin()).host;
}

/**
 * Notify IndexNow that one or more URLs have changed. Fire-and-forget:
 * failures are logged but never thrown, and the call returns immediately
 * if the key is not configured (e.g. in local dev without an env var).
 */
export async function submitToIndexNow(
  urls: string | string[]
): Promise<void> {
  if (process.env.VERCEL_ENV !== "production") return;

  const key = process.env.INDEXNOW_KEY;
  if (!key) return;

  const urlList = (Array.isArray(urls) ? urls : [urls]).filter(Boolean);
  if (urlList.length === 0) return;

  const host = siteHost();
  const body = {
    host,
    key,
    keyLocation: `${siteOrigin()}/${key}.txt`,
    urlList,
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(
        `[indexnow] non-2xx response: ${res.status} ${res.statusText}`
      );
    }
  } catch (err) {
    console.error("[indexnow] ping failed", err);
  }
}

/**
 * Build an absolute URL from a path, using NEXT_PUBLIC_URL as the origin.
 * Paths are prefixed with both EN and NL locales.
 */
export function localizedUrls(path: string): string[] {
  const origin = siteOrigin().replace(/\/$/, "");
  const clean = path.startsWith("/") ? path : `/${path}`;
  return [`${origin}/en${clean}`, `${origin}/nl${clean}`];
}
