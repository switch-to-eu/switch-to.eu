import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { getPayload } from "@/lib/payload";

const TAGS = [
  "services",
  "guides",
  "categories",
  "pages",
  "landing-pages",
] as const;

async function requireAdmin(request: NextRequest) {
  const payload = await getPayload();
  const { user } = await payload.auth({ headers: request.headers });
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  for (const tag of TAGS) {
    revalidateTag(tag);
  }

  return Response.json({ revalidated: TAGS });
}
