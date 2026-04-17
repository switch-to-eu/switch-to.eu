import { getPayload as getPayloadInstance, type Where } from "payload";
import { draftMode } from "next/headers";
import config from "@payload-config";

export const getPayload = () => getPayloadInstance({ config });

/**
 * True when the request has entered Next.js draft mode via the preview route.
 * Returns false when called outside a request context (e.g. build time).
 */
export async function isPreview(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

/**
 * Merge an optional `where` clause with a `_status = published` filter.
 * The filter is dropped in preview mode so drafts appear.
 */
export async function publishedWhere(where?: Where): Promise<Where> {
  if (await isPreview()) return where ?? {};
  const filter: Where = { _status: { equals: "published" } };
  if (!where) return filter;
  return { and: [filter, where] };
}
