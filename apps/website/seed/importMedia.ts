/**
 * Seed helper for uploading media (images and videos) to Payload CMS.
 *
 * Handles both local file paths (relative to the content directory) and
 * external URLs. Uploaded files go through Payload's media collection,
 * which routes to Vercel Blob in production or local filesystem in dev.
 *
 * Maintains a cache to avoid re-uploading the same source file.
 */

import fs from "node:fs";
import path from "node:path";
import type { Payload } from "payload";

const CONTENT_ROOT = path.resolve(
  process.cwd(),
  "../../packages/content/content",
);

/** Map from source path/URL to Payload media document ID */
const mediaCache = new Map<string, number>();

/**
 * Guess MIME type from file extension.
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".avif": "image/avif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".ogg": "video/ogg",
  };
  return mimeTypes[ext] ?? "application/octet-stream";
}

/**
 * Resolve a media source string to a Buffer and filename.
 *
 * - If the source starts with http:// or https://, it is fetched.
 * - Otherwise it is treated as a path relative to the content directory.
 */
async function resolveMedia(
  source: string,
): Promise<{ data: Buffer; name: string; mimeType: string } | null> {
  if (source.startsWith("http://") || source.startsWith("https://")) {
    try {
      const response = await fetch(source);
      if (!response.ok) {
        console.warn(`    Failed to fetch media URL: ${source} (${response.status})`);
        return null;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const urlPath = new URL(source).pathname;
      const name = path.basename(urlPath) || "download";
      const contentType = response.headers.get("content-type");
      const mimeType = contentType?.split(";")[0]?.trim() ?? getMimeType(name);
      return { data: buffer, name, mimeType };
    } catch (err) {
      console.warn(`    Failed to fetch media URL: ${source}`, err);
      return null;
    }
  }

  // Local file path — resolve relative to content root
  const filePath = path.resolve(CONTENT_ROOT, source);
  if (!fs.existsSync(filePath)) {
    console.warn(`    Media file not found: ${filePath}`);
    return null;
  }

  const data = fs.readFileSync(filePath);
  const name = path.basename(filePath);
  const mimeType = getMimeType(filePath);
  return { data: Buffer.from(data), name, mimeType };
}

/**
 * Upload a single media file to Payload and return its document ID.
 *
 * @param payload - Payload instance
 * @param source - File path (relative to content dir) or URL
 * @param alt - Alt text for the media
 * @returns Media document ID, or undefined if upload failed
 */
export async function uploadMedia(
  payload: Payload,
  source: string,
  alt = "",
): Promise<number | undefined> {
  if (!source) return undefined;

  // Check cache first
  const cached = mediaCache.get(source);
  if (cached) return cached;

  const resolved = await resolveMedia(source);
  if (!resolved) return undefined;

  try {
    const doc = await payload.create({
      collection: "media",
      data: { alt },
      file: {
        data: resolved.data,
        mimetype: resolved.mimeType,
        name: resolved.name,
        size: resolved.data.length,
      },
    });

    const id = doc.id;
    mediaCache.set(source, id);
    console.log(`    Uploaded media: ${resolved.name} (id: ${id})`);
    return id;
  } catch (err) {
    console.warn(`    Failed to upload media: ${source}`, err);
    return undefined;
  }
}

/**
 * Clear the media cache. Called when resetting the database.
 */
export function clearMediaCache(): void {
  mediaCache.clear();
}
