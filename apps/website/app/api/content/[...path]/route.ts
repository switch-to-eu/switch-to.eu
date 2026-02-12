import { join, normalize, extname } from "path";
import { existsSync, statSync, createReadStream } from "fs";
import { ReadableStream } from "stream/web";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: pathSegments } = await params;
  const segments =
    pathSegments[0] === "content" ? pathSegments.slice(1) : pathSegments;

  const filePath = join(process.cwd(), "content", ...segments);
  const normalizedFilePath = normalize(filePath);
  const contentDir = normalize(join(process.cwd(), "content"));

  if (!normalizedFilePath.startsWith(contentDir)) {
    return Response.json({ error: "Invalid path" }, { status: 403 });
  }

  if (!existsSync(normalizedFilePath)) {
    return Response.json(
      { error: "File not found", path: normalizedFilePath },
      { status: 404 },
    );
  }

  const stat = statSync(normalizedFilePath);
  const fileSize = stat.size;
  const range = request.headers.get("range");

  const ext = extname(normalizedFilePath).toLowerCase();
  let contentType = "application/octet-stream";
  if (ext === ".mp4") contentType = "video/mp4";
  else if (ext === ".webm") contentType = "video/webm";
  else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".png") contentType = "image/png";
  else if (ext === ".gif") contentType = "image/gif";
  else if (ext === ".svg") contentType = "image/svg+xml";

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0] ?? "0", 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const fileStream = createReadStream(normalizedFilePath, { start, end });
    const webStream = ReadableStream.from(fileStream);

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize.toString(),
      "Content-Type": contentType,
    };

    // @ts-expect-error - ReadableStream is not supported in Node.js
    return new Response(webStream, {
      status: 206,
      headers,
    });
  } else {
    const headers = {
      "Content-Length": fileSize.toString(),
      "Content-Type": contentType,
      "Accept-Ranges": "bytes",
    };

    const fileStream = createReadStream(normalizedFilePath);
    const webStream = ReadableStream.from(fileStream);

    // @ts-expect-error - ReadableStream is not supported in Node.js
    return new Response(webStream, {
      status: 200,
      headers,
    });
  }
}
