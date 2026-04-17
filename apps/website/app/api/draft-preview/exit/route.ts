import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("path") || "/";
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";

  (await draftMode()).disable();
  redirect(safePath);
}
