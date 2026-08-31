/**
 * Intellectir Enterprise HTTP Static & Streaming Delivery Server
 * 
 * Features:
 * - Zero external npm dependencies (native http, fs, path, url)
 * - Configurable port via process.env.PORT (default 3000)
 * - Safe path resolution & directory traversal defense (403/404)
 * - Clean URL routing (/company -> company.html, /solutions -> solutions.html, etc.)
 * - Stream-based file delivery (fs.createReadStream)
 * - HTTP 206 Partial Content support for Range requests (audio/video streaming)
 * - Comprehensive MIME dictionary mapping
 * - Standard HTTP status codes (200, 206, 400, 403, 404, 405, 416, 500)
 * - Enterprise security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = path.resolve(__dirname);

// Comprehensive MIME Type Dictionary
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.ogg': 'video/ogg',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.eot': 'application/vnd.ms-fontobject',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml; charset=utf-8',
    '.pdf': 'application/pdf',
    '.map': 'application/json; charset=utf-8'
};

// Security headers applied to every response
const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
};

/**
 * Send standard HTTP error response
 */
function sendError(res, statusCode, message, customHeaders = {}) {
    if (res.headersSent) return;
    const body = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${statusCode} - ${message}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
        .container { max-width: 500px; padding: 40px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; backdrop-filter: blur(10px); }
        h1 { font-size: 3rem; margin: 0 0 10px; color: #38bdf8; }
        p { color: #94a3b8; font-size: 1.1rem; line-height: 1.6; margin-bottom: 24px; }
        a { display: inline-block; color: #ffffff; background: #2563eb; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        a:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${statusCode}</h1>
        <p>${message}</p>
        <a href="/">Return to Intellectir</a>
    </div>
</body>
</html>`;

    res.writeHead(statusCode, {
        ...SECURITY_HEADERS,
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        ...customHeaders
    });
    res.end(body);
}

/**
 * Parse Range header (e.g. bytes=0-1023, bytes=1024-, bytes=-500)
 */
function parseRangeHeader(rangeHeader, totalSize) {
    if (!rangeHeader || !rangeHeader.startsWith('bytes=')) return null;

    const parts = rangeHeader.replace(/bytes=/, '').split('-');
    const startStr = parts[0].trim();
    const endStr = parts[1].trim();

    let start;
    let end;

    if (startStr === '' && endStr !== '') {
        // Suffix range: bytes=-500
        const suffixLength = parseInt(endStr, 10);
        if (isNaN(suffixLength) || suffixLength <= 0) return null;
        start = Math.max(0, totalSize - suffixLength);
        end = totalSize - 1;
    } else if (startStr !== '' && endStr === '') {
        // Start range: bytes=1024-
        start = parseInt(startStr, 10);
        if (isNaN(start) || start < 0) return null;
        end = totalSize - 1;
    } else if (startStr !== '' && endStr !== '') {
        // Exact range: bytes=0-1023
        start = parseInt(startStr, 10);
        end = parseInt(endStr, 10);
        if (isNaN(start) || isNaN(end) || start < 0 || end < start) return null;
    } else {
        return null;
    }

    if (start >= totalSize) {
        return { unsatifiable: true };
    }

    end = Math.min(end, totalSize - 1);

    return {
        start,
        end,
        chunkSize: end - start + 1,
        unsatifiable: false
    };
}

/**
 * Primary HTTP Request Handler
 */
const server = http.createServer((req, res) => {
    // Only allow GET and HEAD methods
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        return sendError(res, 405, 'Method Not Allowed. Only GET and HEAD requests are supported.', {
            'Allow': 'GET, HEAD'
        });
    }

    const rawUrl = req.url || '';

    // Direct Traversal Defense on raw URL (catches /.. before WHATWG URL normalizes it to /)
    if (rawUrl.includes('..') || /%2e%2e/i.test(rawUrl)) {
        return sendError(res, 403, 'Forbidden: Path traversal is not permitted.');
    }

    let decodedPathname;
    try {
        const parsedUrl = new URL(rawUrl, `http://${req.headers.host || 'localhost'}`);
        decodedPathname = decodeURIComponent(parsedUrl.pathname || '/');
    } catch (err) {
        return sendError(res, 400, 'Bad Request: Malformed URI encoding.');
    }

    // Defense against null byte poisoning
    if (decodedPathname.includes('\0')) {
        return sendError(res, 400, 'Bad Request: Invalid path characters.');
    }

    // Directory Traversal Defense: Reject any '..' segments in the request path
    const pathSegments = decodedPathname.split(/[\/\\]+/).filter(Boolean);
    if (pathSegments.some(segment => segment === '..' || segment === '.')) {
        return sendError(res, 403, 'Forbidden: Path traversal is not permitted.');
    }

    // Protect hidden files and agent metadata directories (e.g. .git, .agents, .env)
    if (pathSegments.some(segment => segment.startsWith('.'))) {
        return sendError(res, 403, 'Forbidden: Access to hidden resources is restricted.');
    }

    // Protect server internal source code, test files, and agent metadata
    const lowerSegments = pathSegments.map(s => s.toLowerCase());
    if (lowerSegments.includes('server.js') || lowerSegments.includes('test') || lowerSegments.includes('.agents')) {
        return sendError(res, 403, 'Forbidden: Access to server internal resources is restricted.');
    }

    // Normalize and sanitize path
    const normalizedPath = path.normalize(decodedPathname);
    let resolvedPath = path.resolve(PUBLIC_DIR, '.' + normalizedPath);

    // Verify resolved path is strictly within PUBLIC_DIR boundary
    const isWithinPublic = resolvedPath === PUBLIC_DIR || resolvedPath.startsWith(PUBLIC_DIR + path.sep);
    if (!isWithinPublic) {
        return sendError(res, 403, 'Forbidden: Access denied.');
    }

    // Double check resolved file name against restricted server resources
    const resolvedBase = path.basename(resolvedPath).toLowerCase();
    if (resolvedBase === 'server.js') {
        return sendError(res, 403, 'Forbidden: Access to server internal resources is restricted.');
    }

    // Stat check with clean URL resolution
    fs.stat(resolvedPath, (err, stats) => {
        if (err) {
            // Clean URL Fallback: Check if adding .html resolves to an existing file
            if (!path.extname(resolvedPath)) {
                const htmlPath = resolvedPath + '.html';
                const isHtmlWithinPublic = htmlPath === PUBLIC_DIR || htmlPath.startsWith(PUBLIC_DIR + path.sep);
                if (isHtmlWithinPublic) {
                    return fs.stat(htmlPath, (htmlErr, htmlStats) => {
                        if (!htmlErr && htmlStats.isFile()) {
                            return serveFile(req, res, htmlPath, htmlStats);
                        }
                        return sendError(res, 404, 'Page or asset not found.');
                    });
                }
            }
            return sendError(res, 404, 'Page or asset not found.');
        }

        // If path is a directory, look for index.html inside it
        if (stats.isDirectory()) {
            const indexFile = path.join(resolvedPath, 'index.html');
            return fs.stat(indexFile, (indexErr, indexStats) => {
                if (!indexErr && indexStats.isFile()) {
                    return serveFile(req, res, indexFile, indexStats);
                }
                return sendError(res, 404, 'Directory index not found.');
            });
        }

        if (!stats.isFile()) {
            return sendError(res, 404, 'Resource not found.');
        }

        return serveFile(req, res, resolvedPath, stats);
    });
});

/**
 * Stream file with HTTP 200 / HTTP 206 Partial Content Range support
 */
function serveFile(req, res, filePath, stats) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const totalSize = stats.size;

    // Cache policy: HTML is revalidated, static assets cached for 1 day
    const cacheControl = ext === '.html' || ext === '.htm'
        ? 'public, max-age=0, must-revalidate'
        : 'public, max-age=86400, immutable';

    const baseHeaders = {
        ...SECURITY_HEADERS,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': cacheControl,
        'Last-Modified': stats.mtime.toUTCString()
    };

    // Range Request Handling (HTTP 206)
    const rangeHeader = req.headers.range;
    if (rangeHeader) {
        const range = parseRangeHeader(rangeHeader, totalSize);

        if (range && range.unsatifiable) {
            return sendError(res, 416, 'Range Not Satisfiable', {
                'Content-Range': `bytes */${totalSize}`,
                'Accept-Ranges': 'bytes'
            });
        }

        if (range && !range.unsatifiable) {
            const rangeHeaders = {
                ...baseHeaders,
                'Content-Range': `bytes ${range.start}-${range.end}/${totalSize}`,
                'Content-Length': range.chunkSize
            };

            res.writeHead(206, rangeHeaders);

            if (req.method === 'HEAD') {
                return res.end();
            }

            const stream = fs.createReadStream(filePath, { start: range.start, end: range.end });
            
            stream.on('error', (streamErr) => {
                if (!res.headersSent) {
                    sendError(res, 500, 'Internal Server Error streaming file range.');
                } else {
                    res.destroy(streamErr);
                }
            });

            req.on('close', () => {
                stream.destroy();
            });

            return stream.pipe(res);
        }
    }

    // Full File Delivery (HTTP 200)
    const fullHeaders = {
        ...baseHeaders,
        'Content-Length': totalSize
    };

    res.writeHead(200, fullHeaders);

    if (req.method === 'HEAD') {
        return res.end();
    }

    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (streamErr) => {
        if (!res.headersSent) {
            sendError(res, 500, 'Internal Server Error streaming file.');
        } else {
            res.destroy(streamErr);
        }
    });

    req.on('close', () => {
        fileStream.destroy();
    });

    fileStream.pipe(res);
}

// Start HTTP Server only when run directly (not when required as a module in tests)
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`[Intellectir Server] Ready and listening on port ${PORT}`);
        console.log(`[Intellectir Server] Root: ${PUBLIC_DIR}`);
    });
}

// Export server instance and utilities for testing suites
module.exports = { server, MIME_TYPES, SECURITY_HEADERS, parseRangeHeader };
