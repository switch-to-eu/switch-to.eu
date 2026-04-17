import { submitToIndexNow, localizedUrls } from "@/lib/indexnow";

/**
 * Build a preview URL that routes through the draft-mode enabler.
 * Returns null when the preview secret is not configured.
 */
export function buildPreviewUrl(path: string): string | null {
  const secret = process.env.PREVIEW_SECRET;
  if (!secret) return null;
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `/api/draft-preview?secret=${encodeURIComponent(
    secret
  )}&path=${encodeURIComponent(safePath)}`;
}

/**
 * Fire IndexNow pings for the supplied paths, but only when the document
 * has been published. Drafts do not ping IndexNow.
 */
export async function pingIndexNowIfPublished(
  status: string | null | undefined,
  paths: string[]
): Promise<void> {
  if (status !== "published") return;
  const urls = paths.flatMap((p) => localizedUrls(p));
  await submitToIndexNow(urls);
}
