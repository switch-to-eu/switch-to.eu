import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const path = request.nextUrl.searchParams.get("path") || "/";

  const expected = process.env.PREVIEW_SECRET;
  if (!expected || secret !== expected) {
    return new Response("Invalid token", { status: 401 });
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return new Response("Invalid path", { status: 400 });
  }

  (await draftMode()).enable();
  redirect(path);
}
