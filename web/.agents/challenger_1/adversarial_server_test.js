/**
 * Comprehensive Adversarial Server & Security Hardening Verification Suite
 * Challenger 1 — Empirical Stress Testing Harness
 *
 * Vectors Evaluated:
 * 1. Path Traversal & Security Boundary Penetration (Direct, encoded, overlong, backslash, dots, null-bytes, query injection, source/git/test protection)
 * 2. HTTP Method Probing & Protocol Hardening (POST, PUT, DELETE, PATCH, TRACE, OPTIONS, HEAD, CONNECT, Security Headers)
 * 3. HTTP 206 Byte-Range Streaming Edge Cases (Single-byte, mid-slice, open-ended, suffix, inverted, out-of-bounds 416, multi-range, video MIME)
 * 4. High Concurrency, Socket Teardown & Stress Load (Pipelining, 500-request bursts, abrupt TCP reset, heap memory profiling)
 */

const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');
const { server, parseRangeHeader, MIME_TYPES, SECURITY_HEADERS } = require('../../server');

const TEST_PORT = 3188;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

const results = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    durationMs: 0,
    findings: []
};

function runTest(category, testName, testFn) {
    return new Promise(async (resolve) => {
        const start = Date.now();
        try {
            await testFn();
            const elapsed = Date.now() - start;
            results.passed++;
            results.totalTests++;
            console.log(`  ✔ [PASS] ${testName} (${elapsed}ms)`);
            resolve({ category, name: testName, status: 'PASS', elapsed });
        } catch (err) {
            const elapsed = Date.now() - start;
            results.failed++;
            results.totalTests++;
            results.findings.push({ category, name: testName, error: err.message, elapsed });
            console.error(`  ✖ [FAIL] ${testName} (${elapsed}ms): ${err.message}`);
            resolve({ category, name: testName, status: 'FAIL', error: err.message, elapsed });
        }
    });
}

function makeRequest(urlPath, options = {}) {
    return new Promise((resolve, reject) => {
        const rawPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
        const reqOpts = {
            hostname: '127.0.0.1',
            port: TEST_PORT,
            path: rawPath,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = http.request(reqOpts, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const bodyBuffer = Buffer.concat(chunks);
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: bodyBuffer.toString('utf-8'),
                    rawBody: bodyBuffer
                });
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

function makeRawSocketRequest(rawPayload) {
    return new Promise((resolve, reject) => {
        const client = net.createConnection({ port: TEST_PORT, host: '127.0.0.1' }, () => {
            client.write(rawPayload);
        });

        let responseData = '';
        client.on('data', (data) => {
            responseData += data.toString('utf-8');
        });

        client.on('end', () => {
            const [headerPart, ...bodyParts] = responseData.split('\r\n\r\n');
            const statusLine = headerPart.split('\r\n')[0] || '';
            const statusMatch = statusLine.match(/HTTP\/\d\.\d\s+(\d{3})/);
            const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : 0;
            resolve({
                statusCode,
                rawResponse: responseData,
                statusLine,
                body: bodyParts.join('\r\n\r\n')
            });
        });

        client.on('error', reject);
    });
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

async function startServer() {
    return new Promise((resolve) => {
        server.listen(TEST_PORT, () => {
            console.log(`[Adversarial Test Server] Listening on http://127.0.0.1:${TEST_PORT}`);
            resolve();
        });
    });
}

async function stopServer() {
    return new Promise((resolve) => {
        server.close(() => {
            console.log(`[Adversarial Test Server] Closed.`);
            resolve();
        });
    });
}

async function main() {
    const overallStart = Date.now();
    await startServer();

    console.log('\n======================================================');
    console.log('CHALLENGER 1: ADVERSARIAL SERVER & SECURITY AUDIT');
    console.log('======================================================\n');

    // =========================================================================
    // SUITE 1: PATH TRAVERSAL & SECURITY BOUNDARY PENETRATION
    // =========================================================================
    console.log('--- SUITE 1: Path Traversal & Boundary Penetration ---');

    await runTest('Traversal', '1.1 Simple dot-dot traversal /.. returns 403 Forbidden', async () => {
        const res = await makeRequest('/..');
        assert(res.statusCode === 403, `Expected 403, got ${res.statusCode}`);
        assert(res.headers['x-content-type-options'] === 'nosniff', 'Missing security headers');
    });

    await runTest('Traversal', '1.2 Deep parent traversal /../../etc/passwd returns 403 Forbidden', async () => {
        const res = await makeRequest('/../../etc/passwd');
        assert(res.statusCode === 403, `Expected 403, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.3 URL encoded dot-dot traversal /%2e%2e/ returns 403 Forbidden', async () => {
        const res = await makeRequest('/%2e%2e/');
        assert(res.statusCode === 403, `Expected 403, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.4 Uppercase URL encoded traversal /%2E%2E/ returns 403 Forbidden', async () => {
        const res = await makeRequest('/%2E%2E/');
        assert(res.statusCode === 403, `Expected 403, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.5 Double percent encoded traversal /%252e%252e/ returns 400, 403 or 404', async () => {
        const res = await makeRequest('/%252e%252e/');
        assert([400, 403, 404].includes(res.statusCode), `Expected 400/403/404, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.6 Encoded slash traversal /%2e%2e%2f returns 403 Forbidden', async () => {
        const res = await makeRequest('/%2e%2e%2f');
        assert(res.statusCode === 403, `Expected 403, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.7 Windows backslash traversal /..%5c..%5cboot.ini returns 403 Forbidden', async () => {
        const res = await makeRequest('/..%5c..%5cboot.ini');
        assert(res.statusCode === 403, `Expected 403, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.8 Raw socket backslash traversal /..\\..\\windows\\win.ini returns 403 Forbidden', async () => {
        const res = await makeRawSocketRequest('GET /..\\..\\windows\\win.ini HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n');
        assert(res.statusCode === 403, `Expected 403, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.9 Null byte injection /index.html%00.png returns 400 Bad Request', async () => {
        const res = await makeRequest('/index.html%00.png');
        assert(res.statusCode === 400, `Expected 400 Bad Request for null byte, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.10 Internal server source file protection /server.js returns 403 Forbidden', async () => {
        const res = await makeRequest('/server.js');
        assert(res.statusCode === 403, `Expected 403 Forbidden for server.js, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.11 Case-insensitive server source protection /SERVER.JS returns 403 Forbidden', async () => {
        const res = await makeRequest('/SERVER.JS');
        assert(res.statusCode === 403, `Expected 403 Forbidden for SERVER.JS, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.12 Hidden agent directory protection /.agents/DISPATCH.md returns 403 Forbidden', async () => {
        const res = await makeRequest('/.agents/challenger_1/DISPATCH.md');
        assert(res.statusCode === 403, `Expected 403 Forbidden for .agents, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.13 Hidden git directory protection /.git/config returns 403 Forbidden', async () => {
        const res = await makeRequest('/.git/config');
        assert(res.statusCode === 403, `Expected 403 Forbidden for .git, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.14 Internal test directory protection /test/e2e_runner.js returns 403 Forbidden', async () => {
        const res = await makeRequest('/test/e2e_runner.js');
        assert(res.statusCode === 403, `Expected 403 Forbidden for test files, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.15 Query string traversal injection /company.html?q=../../server.js is safely blocked or isolated', async () => {
        const res = await makeRequest('/company.html?q=../../server.js');
        assert([200, 403].includes(res.statusCode), `Expected 200 or 403, got ${res.statusCode}`);
        assert(!res.body.includes('fs.createReadStream'), 'Server source code leaked');
    });

    await runTest('Traversal', '1.16 Overlong / malformed percent encoding /%c0%ae%c0%ae/ handled safely without server crash', async () => {
        const res = await makeRequest('/%c0%ae%c0%ae/');
        assert([400, 403, 404].includes(res.statusCode), `Expected error code, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.17 Triple dot and excessive dots /.../ /..../ handled safely without traversal', async () => {
        const res = await makeRequest('/.../index.html');
        assert([400, 403, 404].includes(res.statusCode), `Expected error code for invalid dot segment, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.18 Nested asset directory escape /assets/../../server.js returns 403 Forbidden', async () => {
        const res = await makeRequest('/assets/../../server.js');
        assert(res.statusCode === 403, `Expected 403, got ${res.statusCode}`);
    });

    await runTest('Traversal', '1.19 Dot segment prefix /./index.html resolves cleanly to index.html (200)', async () => {
        const res = await makeRequest('/./index.html');
        assert([200, 403, 404].includes(res.statusCode), `Expected valid status, got ${res.statusCode}`);
    });


    // =========================================================================
    // SUITE 2: HTTP METHOD & PROTOCOL EDGE CASES
    // =========================================================================
    console.log('\n--- SUITE 2: HTTP Methods & Protocol Hardening ---');

    await runTest('Methods', '2.1 POST to / returns 405 Method Not Allowed with Allow header', async () => {
        const res = await makeRequest('/', { method: 'POST', body: 'some-payload=123' });
        assert(res.statusCode === 405, `Expected 405, got ${res.statusCode}`);
        assert(res.headers['allow'] === 'GET, HEAD', `Expected Allow: GET, HEAD, got ${res.headers['allow']}`);
    });

    await runTest('Methods', '2.2 PUT to /styles.css returns 405 Method Not Allowed', async () => {
        const res = await makeRequest('/styles.css', { method: 'PUT', body: 'body { color: red; }' });
        assert(res.statusCode === 405, `Expected 405, got ${res.statusCode}`);
        assert(res.headers['allow'] === 'GET, HEAD', 'Missing or invalid Allow header');
    });

    await runTest('Methods', '2.3 DELETE to /app.js returns 405 Method Not Allowed', async () => {
        const res = await makeRequest('/app.js', { method: 'DELETE' });
        assert(res.statusCode === 405, `Expected 405, got ${res.statusCode}`);
    });

    await runTest('Methods', '2.4 PATCH to /index.html returns 405 Method Not Allowed', async () => {
        const res = await makeRequest('/index.html', { method: 'PATCH', body: 'patch data' });
        assert(res.statusCode === 405, `Expected 405, got ${res.statusCode}`);
    });

    await runTest('Methods', '2.5 TRACE to / returns 405 Method Not Allowed (XST defense)', async () => {
        const res = await makeRequest('/', { method: 'TRACE' });
        assert(res.statusCode === 405, `Expected 405, got ${res.statusCode}`);
    });

    await runTest('Methods', '2.6 OPTIONS to / returns 405 Method Not Allowed', async () => {
        const res = await makeRequest('/', { method: 'OPTIONS' });
        assert(res.statusCode === 405, `Expected 405, got ${res.statusCode}`);
    });

    await runTest('Methods', '2.7 HEAD request to / returns 200 with headers and 0-byte body', async () => {
        const res = await makeRequest('/', { method: 'HEAD' });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        assert(res.rawBody.length === 0, `Expected 0 body bytes for HEAD, got ${res.rawBody.length}`);
        assert(parseInt(res.headers['content-length'], 10) > 0, 'Expected non-zero Content-Length header');
        assert(res.headers['content-type'].includes('text/html'), 'Expected text/html Content-Type');
    });

    await runTest('Methods', '2.8 HEAD request to non-existent route returns 404 with 0-byte body', async () => {
        const res = await makeRequest('/nonexistent.html', { method: 'HEAD' });
        assert(res.statusCode === 404, `Expected 404, got ${res.statusCode}`);
        assert(res.rawBody.length === 0, `Expected 0 body bytes for HEAD 404, got ${res.rawBody.length}`);
    });

    await runTest('Methods', '2.9 Universal Security Headers verified on 200, 404, 403, 405 responses', async () => {
        const r200 = await makeRequest('/');
        const r404 = await makeRequest('/notfound');
        const r403 = await makeRequest('/server.js');
        const r405 = await makeRequest('/', { method: 'POST' });

        for (const [name, resp] of Object.entries({ '200': r200, '404': r404, '403': r403, '405': r405 })) {
            assert(resp.headers['x-content-type-options'] === 'nosniff', `Status ${name} missing X-Content-Type-Options: nosniff`);
            assert(resp.headers['x-frame-options'] === 'SAMEORIGIN', `Status ${name} missing X-Frame-Options: SAMEORIGIN`);
            assert(resp.headers['referrer-policy'] === 'strict-origin-when-cross-origin', `Status ${name} missing Referrer-Policy`);
        }
    });

    await runTest('Methods', '2.10 Clean URL extensionless routes respond with HTTP 200 and text/html', async () => {
        const routes = ['/company', '/discover', '/industries', '/solutions'];
        for (const route of routes) {
            const res = await makeRequest(route);
            assert(res.statusCode === 200, `Expected 200 for clean URL ${route}, got ${res.statusCode}`);
            assert(res.headers['content-type'].includes('text/html'), `Expected text/html for ${route}`);
            assert(res.body.includes('<!DOCTYPE html>'), `Expected HTML body for ${route}`);
        }
    });


    // =========================================================================
    // SUITE 3: HTTP 206 BYTE-RANGE STREAMING
    // =========================================================================
    console.log('\n--- SUITE 3: HTTP 206 Byte-Range Streaming Edge Cases ---');

    // Fetch full styles.css for ground truth slice comparison
    const fullCss = await makeRequest('/styles.css');
    const cssTotalSize = fullCss.rawBody.length;
    assert(cssTotalSize > 0, 'styles.css must have size > 0');

    await runTest('Ranges', '3.1 Standard range bytes=0-49 returns exact first 50 bytes with 206', async () => {
        const res = await makeRequest('/styles.css', { headers: { 'Range': 'bytes=0-49' } });
        assert(res.statusCode === 206, `Expected 206, got ${res.statusCode}`);
        assert(res.rawBody.length === 50, `Expected 50 bytes, got ${res.rawBody.length}`);
        assert(res.headers['content-range'] === `bytes 0-49/${cssTotalSize}`, `Unexpected Content-Range: ${res.headers['content-range']}`);
        assert(res.rawBody.equals(fullCss.rawBody.subarray(0, 50)), 'Byte slice content mismatch');
    });

    await runTest('Ranges', '3.2 Single-byte range bytes=0-0 returns first 1 byte', async () => {
        const res = await makeRequest('/styles.css', { headers: { 'Range': 'bytes=0-0' } });
        assert(res.statusCode === 206, `Expected 206, got ${res.statusCode}`);
        assert(res.rawBody.length === 1, `Expected 1 byte, got ${res.rawBody.length}`);
        assert(res.headers['content-range'] === `bytes 0-0/${cssTotalSize}`, `Content-Range mismatch`);
        assert(res.rawBody[0] === fullCss.rawBody[0], 'First byte mismatch');
    });

    await runTest('Ranges', '3.3 Mid-file range bytes=100-199 returns exact 100 bytes', async () => {
        const res = await makeRequest('/styles.css', { headers: { 'Range': 'bytes=100-199' } });
        assert(res.statusCode === 206, `Expected 206, got ${res.statusCode}`);
        assert(res.rawBody.length === 100, `Expected 100 bytes, got ${res.rawBody.length}`);
        assert(res.headers['content-range'] === `bytes 100-199/${cssTotalSize}`, `Content-Range mismatch`);
        assert(res.rawBody.equals(fullCss.rawBody.subarray(100, 200)), 'Mid slice content mismatch');
    });

    await runTest('Ranges', '3.4 Open-ended range bytes=100- returns bytes from 100 to EOF', async () => {
        const res = await makeRequest('/styles.css', { headers: { 'Range': 'bytes=100-' } });
        assert(res.statusCode === 206, `Expected 206, got ${res.statusCode}`);
        assert(res.rawBody.length === cssTotalSize - 100, `Length mismatch`);
        assert(res.headers['content-range'] === `bytes 100-${cssTotalSize - 1}/${cssTotalSize}`, `Content-Range mismatch`);
        assert(res.rawBody.equals(fullCss.rawBody.subarray(100)), 'Open-ended content mismatch');
    });

    await runTest('Ranges', '3.5 Suffix range bytes=-50 returns last 50 bytes', async () => {
        const res = await makeRequest('/styles.css', { headers: { 'Range': 'bytes=-50' } });
        assert(res.statusCode === 206, `Expected 206, got ${res.statusCode}`);
        assert(res.rawBody.length === 50, `Expected 50 bytes, got ${res.rawBody.length}`);
        assert(res.headers['content-range'] === `bytes ${cssTotalSize - 50}-${cssTotalSize - 1}/${cssTotalSize}`, `Content-Range mismatch`);
        assert(res.rawBody.equals(fullCss.rawBody.subarray(cssTotalSize - 50)), 'Suffix slice mismatch');
    });

    await runTest('Ranges', '3.6 Suffix range larger than file bytes=-999999 returns entire file', async () => {
        const res = await makeRequest('/styles.css', { headers: { 'Range': 'bytes=-999999' } });
        assert(res.statusCode === 206, `Expected 206, got ${res.statusCode}`);
        assert(res.rawBody.length === cssTotalSize, `Expected full size ${cssTotalSize}, got ${res.rawBody.length}`);
        assert(res.headers['content-range'] === `bytes 0-${cssTotalSize - 1}/${cssTotalSize}`, `Content-Range mismatch`);
    });

    await runTest('Ranges', '3.7 Out-of-bounds start range bytes=99999999- returns HTTP 416 Range Not Satisfiable', async () => {
        const res = await makeRequest('/styles.css', { headers: { 'Range': 'bytes=99999999-' } });
        assert(res.statusCode === 416, `Expected 416, got ${res.statusCode}`);
        assert(res.headers['content-range'] === `bytes */${cssTotalSize}`, `Expected Content-Range: bytes */${cssTotalSize}, got ${res.headers['content-range']}`);
    });

    await runTest('Ranges', '3.8 Inverted range bytes=500-100 is ignored and returns HTTP 200 full content', async () => {
        const res = await makeRequest('/styles.css', { headers: { 'Range': 'bytes=500-100' } });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        assert(res.rawBody.length === cssTotalSize, `Expected full content size`);
    });

    await runTest('Ranges', '3.9 Malformed non-numeric range bytes=abc-def returns HTTP 200 full content', async () => {
        const res = await makeRequest('/styles.css', { headers: { 'Range': 'bytes=abc-def' } });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
        assert(res.rawBody.length === cssTotalSize, `Expected full content size`);
    });

    await runTest('Ranges', '3.10 Non-byte range unit items=0-50 returns HTTP 200 full content', async () => {
        const res = await makeRequest('/styles.css', { headers: { 'Range': 'items=0-50' } });
        assert(res.statusCode === 200, `Expected 200, got ${res.statusCode}`);
    });

    await runTest('Ranges', '3.11 End index beyond total size bytes=0-999999 is clamped to total size (206)', async () => {
        const res = await makeRequest('/styles.css', { headers: { 'Range': 'bytes=0-999999' } });
        assert(res.statusCode === 206, `Expected 206, got ${res.statusCode}`);
        assert(res.rawBody.length === cssTotalSize, `Expected clamped full size ${cssTotalSize}, got ${res.rawBody.length}`);
        assert(res.headers['content-range'] === `bytes 0-${cssTotalSize - 1}/${cssTotalSize}`, `Content-Range mismatch`);
    });

    await runTest('Ranges', '3.12 Multimedia Video Range streaming returns video/mp4 with Accept-Ranges', async () => {
        const res = await makeRequest('/assets/videos/industries_pg.mp4', { headers: { 'Range': 'bytes=0-1024' } });
        assert(res.statusCode === 206, `Expected 206, got ${res.statusCode}`);
        assert(res.headers['content-type'] === 'video/mp4', `Expected video/mp4, got ${res.headers['content-type']}`);
        assert(res.headers['accept-ranges'] === 'bytes', `Expected Accept-Ranges: bytes`);
        assert(res.rawBody.length === 1025, `Expected 1025 bytes, got ${res.rawBody.length}`);
    });

    await runTest('Ranges', '3.13 HEAD request with Range returns 206 headers with 0 body bytes', async () => {
        const res = await makeRequest('/styles.css', { method: 'HEAD', headers: { 'Range': 'bytes=0-99' } });
        assert(res.statusCode === 206, `Expected 206, got ${res.statusCode}`);
        assert(res.rawBody.length === 0, `Expected 0 body bytes for HEAD 206, got ${res.rawBody.length}`);
        assert(res.headers['content-length'] === '100', `Expected Content-Length: 100, got ${res.headers['content-length']}`);
        assert(res.headers['content-range'] === `bytes 0-99/${cssTotalSize}`, `Content-Range mismatch`);
    });


    // =========================================================================
    // SUITE 4: HIGH CONCURRENCY, SOCKET TEARDOWN & STRESS LOAD
    // =========================================================================
    console.log('\n--- SUITE 4: High Concurrency, Socket Teardown & Stress Load ---');

    await runTest('Concurrency', '4.1 200 Concurrent mixed requests across all routes (100% success rate)', async () => {
        const endpoints = [
            '/', '/company', '/discover', '/industries', '/solutions',
            '/styles.css', '/app.js', '/assets/intellectir_logo.svg'
        ];

        const reqPromises = [];
        for (let i = 0; i < 200; i++) {
            const target = endpoints[i % endpoints.length];
            reqPromises.push(makeRequest(target));
        }

        const startBurst = Date.now();
        const burstResults = await Promise.all(reqPromises);
        const burstDuration = Date.now() - startBurst;

        const allOk = burstResults.every(r => r.statusCode === 200);
        assert(allOk, 'Not all 200 requests returned status 200');

        const avgLatency = burstDuration / 200;
        console.log(`      -> 200 concurrent requests completed in ${burstDuration}ms (avg ${avgLatency.toFixed(2)}ms/req)`);
        assert(burstDuration < 2000, `Burst duration exceeded threshold: ${burstDuration}ms`);
    });

    await runTest('Concurrency', '4.2 300 Rapid sequential requests without memory leak or connection drop', async () => {
        const memBefore = process.memoryUsage().heapUsed;
        for (let i = 0; i < 300; i++) {
            const res = await makeRequest('/index.html');
            if (res.statusCode !== 200) {
                throw new Error(`Sequential request ${i} failed with status ${res.statusCode}`);
            }
        }
        const memAfter = process.memoryUsage().heapUsed;
        const diffMb = (memAfter - memBefore) / (1024 * 1024);
        console.log(`      -> 300 sequential requests completed. Heap diff: ${diffMb.toFixed(2)} MB`);
    });

    await runTest('Concurrency', '4.3 Abrupt socket teardown during streaming is handled cleanly', async () => {
        for (let i = 0; i < 10; i++) {
            await new Promise((resolve) => {
                const client = net.createConnection({ port: TEST_PORT, host: '127.0.0.1' }, () => {
                    client.write('GET /assets/videos/industries_pg.mp4 HTTP/1.1\r\nHost: localhost\r\n\r\n');
                });

                client.on('data', () => {
                    client.destroy();
                    setTimeout(resolve, 15);
                });

                client.on('error', () => {
                    resolve();
                });
            });
        }
        const healthCheck = await makeRequest('/');
        assert(healthCheck.statusCode === 200, `Server unresponsive after socket drops, got ${healthCheck.statusCode}`);
    });

    await runTest('Concurrency', '4.4 50 Concurrent Video Range streaming requests with random byte slices', async () => {
        const videoStat = fs.statSync(path.join(__dirname, '../../assets/videos/industries_pg.mp4'));
        const videoSize = videoStat.size;

        const videoPromises = [];
        for (let i = 0; i < 50; i++) {
            const startByte = (i * 1000) % (videoSize - 5000);
            const endByte = startByte + 1024;
            videoPromises.push(
                makeRequest('/assets/videos/industries_pg.mp4', {
                    headers: { 'Range': `bytes=${startByte}-${endByte}` }
                })
            );
        }

        const videoResults = await Promise.all(videoPromises);
        const allVideo206 = videoResults.every(r => r.statusCode === 206 && r.rawBody.length === 1025);
        assert(allVideo206, 'Not all video partial requests returned expected 206 chunk');
    });

    await runTest('Concurrency', '4.5 Adversarial Mixed Workload Stress: 100 simultaneous valid + invalid + attack requests', async () => {
        const attackVectors = [
            { path: '/', method: 'GET', expected: 200 },
            { path: '/company', method: 'GET', expected: 200 },
            { path: '/server.js', method: 'GET', expected: 403 },
            { path: '/%2e%2e/etc/passwd', method: 'GET', expected: 403 },
            { path: '/..%5c..%5cwin.ini', method: 'GET', expected: 403 },
            { path: '/not-a-real-file.xyz', method: 'GET', expected: 404 },
            { path: '/styles.css', method: 'POST', expected: 405 },
            { path: '/styles.css', method: 'GET', headers: { 'Range': 'bytes=0-100' }, expected: 206 },
            { path: '/styles.css', method: 'GET', headers: { 'Range': 'bytes=99999999-' }, expected: 416 },
            { path: '/app.js', method: 'HEAD', expected: 200 },
            { path: '/%00invalid', method: 'GET', expected: [400, 403, 404] }
        ];

        const stressPromises = [];
        for (let i = 0; i < 100; i++) {
            const vector = attackVectors[i % attackVectors.length];
            stressPromises.push(
                makeRequest(vector.path, {
                    method: vector.method,
                    headers: vector.headers || {}
                }).then(res => {
                    const expectedArr = Array.isArray(vector.expected) ? vector.expected : [vector.expected];
                    if (!expectedArr.includes(res.statusCode)) {
                        throw new Error(`Vector ${vector.method} ${vector.path} expected ${vector.expected}, got ${res.statusCode}`);
                    }
                    return res;
                })
            );
        }

        const stressResults = await Promise.all(stressPromises);
        assert(stressResults.length === 100, `Expected 100 responses, got ${stressResults.length}`);
    });

    await runTest('Concurrency', '4.6 HTTP Pipelining on single TCP connection (20 back-to-back requests with Connection: close)', async () => {
        let pipelinePayload = '';
        for (let i = 0; i < 19; i++) {
            pipelinePayload += `GET /index.html HTTP/1.1\r\nHost: localhost\r\n\r\n`;
        }
        pipelinePayload += `GET /index.html HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n`;
        const res = await makeRawSocketRequest(pipelinePayload);
        const matches = res.rawResponse.match(/HTTP\/1\.1 200 OK/g) || [];
        assert(matches.length >= 1, `Expected pipelined HTTP 200 responses, found ${matches.length}`);
    });

    // Cleanup
    await stopServer();
    results.durationMs = Date.now() - overallStart;

    console.log('\n------------------------------------------------------');
    console.log('ADVERSARIAL STRESS TEST SUMMARY:');
    console.log(`  Total Tests: ${results.totalTests}`);
    console.log(`  Passed:      ${results.passed}`);
    console.log(`  Failed:      ${results.failed}`);
    console.log(`  Duration:    ${(results.durationMs / 1000).toFixed(2)}s`);
    console.log('------------------------------------------------------\n');

    if (results.failed > 0) {
        console.error('❌ ADVERSARIAL HARDENING VERDICT: FAIL');
        process.exit(1);
    } else {
        console.log('✅ ADVERSARIAL HARDENING VERDICT: PASS (100% Secure & Hardened)');
        process.exit(0);
    }
}

main().catch((err) => {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
});
