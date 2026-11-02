import { NextRequest } from "next/server";
import { collectAllSiteUrls } from "@/lib/site-urls";
import { submitToIndexNow } from "@/lib/indexnow";

const BATCH_SIZE = 1000;

/**
 * Payload's admin session used to guard this route. Now it takes a bearer
 * token: `Authorization: Bearer $INDEXNOW_SUBMIT_SECRET`. Without the env var
 * set, every request is rejected.
 */
function requireSecret(request: NextRequest) {
  const secret = process.env.INDEXNOW_SUBMIT_SECRET;
  const header = request.headers.get("authorization");
  if (!secret || header !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export function GET(request: NextRequest) {
  const authError = requireSecret(request);
  if (authError) return authError;

  const urls = collectAllSiteUrls();
  return Response.json({ count: urls.length });
}

export async function POST(request: NextRequest) {
  const authError = requireSecret(request);
  if (authError) return authError;

  if (process.env.VERCEL_ENV !== "production") {
    return Response.json(
      { submitted: 0, skipped: "not-production" },
      { status: 200 }
    );
  }

  const urls = collectAllSiteUrls();

  let batches = 0;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    batches += 1;
    await submitToIndexNow(urls.slice(i, i + BATCH_SIZE));
  }

  return Response.json({ submitted: urls.length, batches });
}
