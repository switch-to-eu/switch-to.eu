import { NextRequest } from "next/server";
import { getPayload } from "@/lib/payload";
import { collectAllSiteUrls } from "@/lib/site-urls";
import { submitToIndexNow } from "@/lib/indexnow";

const BATCH_SIZE = 1000;

async function requireAdmin(request: NextRequest) {
  const payload = await getPayload();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const urls = await collectAllSiteUrls();
  return Response.json({ count: urls.length });
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  if (process.env.VERCEL_ENV !== "production") {
    return Response.json(
      { submitted: 0, skipped: "not-production" },
      { status: 200 }
    );
  }

  const urls = await collectAllSiteUrls();

  let batches = 0;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    batches += 1;
    await submitToIndexNow(urls.slice(i, i + BATCH_SIZE));
  }

  return Response.json({ submitted: urls.length, batches });
}
