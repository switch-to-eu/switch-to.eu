export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const expected = process.env.INDEXNOW_KEY;
  if (!expected || key !== expected) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(expected, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
