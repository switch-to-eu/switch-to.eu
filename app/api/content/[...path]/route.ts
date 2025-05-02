import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    // Ensure params is properly awaited
    const { path: pathSegments } = await params;

    try {
        // Join the path segments, but remove the first "content" if it's duplicated
        // This fixes the issue with URLs like /api/content/content/...
        const segments = pathSegments[0] === 'content'
            ? pathSegments.slice(1)
            : pathSegments;

        const filePath = path.join(process.cwd(), 'content', ...segments);

        // Security check to prevent path traversal attacks
        const normalizedFilePath = path.normalize(filePath);
        const contentDir = path.normalize(path.join(process.cwd(), 'content'));

        if (!normalizedFilePath.startsWith(contentDir)) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 403 });
        }

        // Check if the file exists
        if (!fs.existsSync(normalizedFilePath)) {
            return NextResponse.json(
                { error: 'File not found', path: normalizedFilePath },
                { status: 404 }
            );
        }

        // Read the file
        const fileBuffer = await fsPromises.readFile(normalizedFilePath);

        // Determine content type based on file extension
        const ext = path.extname(normalizedFilePath).toLowerCase();
        let contentType = 'application/octet-stream';

        // Set appropriate content type for common media files
        if (ext === '.mp4') contentType = 'video/mp4';
        if (ext === '.webm') contentType = 'video/webm';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.gif') contentType = 'image/gif';
        if (ext === '.svg') contentType = 'image/svg+xml';

        // Return the file with appropriate headers
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (error) {
        console.error('Error serving content file:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: (error as Error).message },
            { status: 500 }
        );
    }
}