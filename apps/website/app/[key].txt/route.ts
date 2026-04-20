export function GET(request: Request) {
  const expected = process.env.INDEXNOW_KEY;
  if (!expected) {
    return new Response("Not Found", { status: 404 });
  }

  const { pathname } = new URL(request.url);
  const key = pathname.replace(/^\//, "").replace(/\.txt$/, "");

  if (key !== expected) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(expected, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
