const http = require('http');
const assert = require('assert');
const path = require('path');
const { server } = require('../../server.js');

const TEST_PORT = 3199;

function request(options, reqBody = null) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: '127.0.0.1',
            port: TEST_PORT,
            ...options
        }, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: Buffer.concat(chunks)
                });
            });
        });
        req.on('error', reject);
        if (reqBody) req.write(reqBody);
        req.end();
    });
}

async function runTests() {
    console.log('Starting M1 Verification Test Suite...');
    await new Promise(r => server.listen(TEST_PORT, r));
    console.log('Test server listening on port ' + TEST_PORT);

    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        try {
            await fn();
            console.log('  [PASS]: ' + name);
            passed++;
        } catch (e) {
            console.error('  [FAIL]: ' + name + ' -> ' + e.message);
            failed++;
        }
    }

    // 1. Root / -> index.html (200)
    await test('Root / returns 200 and text/html', async () => {
        const res = await request({ path: '/', method: 'GET' });
        assert.strictEqual(res.statusCode, 200);
        assert.ok(res.headers['content-type'].includes('text/html'));
        assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
        assert.strictEqual(res.headers['x-frame-options'], 'SAMEORIGIN');
        assert.strictEqual(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
        assert.ok(res.body.toString().includes('<!DOCTYPE html>'));
    });

    // 2. Clean URLs (/company, /discover, /industries, /solutions)
    const cleanRoutes = ['/company', '/discover', '/industries', '/solutions'];
    for (const route of cleanRoutes) {
        await test('Clean route ' + route + ' returns 200 and text/html', async () => {
            const res = await request({ path: route, method: 'GET' });
            assert.strictEqual(res.statusCode, 200);
            assert.ok(res.headers['content-type'].includes('text/html'));
            assert.ok(res.body.length > 0);
        });
    }

    // 3. Exact HTML files
    const htmlFiles = ['/index.html', '/company.html', '/discover.html', '/industries.html', '/solutions.html'];
    for (const file of htmlFiles) {
        await test('Direct HTML route ' + file + ' returns 200 and text/html', async () => {
            const res = await request({ path: file, method: 'GET' });
            assert.strictEqual(res.statusCode, 200);
            assert.ok(res.headers['content-type'].includes('text/html'));
            assert.ok(res.body.length > 0);
        });
    }

    // 4. Static assets MIME types
    const assetChecks = [
        { path: '/styles.css', type: 'text/css' },
        { path: '/app.js', type: 'application/javascript' },
        { path: '/assets/intellectir_logo.svg', type: 'image/svg+xml' },
        { path: '/assets/favicon.svg', type: 'image/svg+xml' },
        { path: '/assets/favicon.ico', type: 'image/x-icon' },
        { path: '/assets/icons/openai.svg', type: 'image/svg+xml' },
        { path: '/assets/icons/anthropic.svg', type: 'image/svg+xml' },
        { path: '/assets/icons/deepmind.svg', type: 'image/svg+xml' },
        { path: '/assets/icons/mistral.svg', type: 'image/svg+xml' },
        { path: '/assets/icons/meta.svg', type: 'image/svg+xml' },
        { path: '/assets/icons/supabase.svg', type: 'image/svg+xml' },
        { path: '/assets/icons/aws.svg', type: 'image/svg+xml' },
        { path: '/assets/icons/microsoft.svg', type: 'image/svg+xml' },
        { path: '/assets/icons/n8n.svg', type: 'image/svg+xml' },
        { path: '/assets/icons/vercel.svg', type: 'image/svg+xml' },
        { path: '/assets/icons/vapi.svg', type: 'image/svg+xml' },
        { path: '/assets/videos/industries_pg.mp4', type: 'video/mp4' },
        { path: '/assets/videos/new_era.mp4', type: 'video/mp4' }
    ];

    for (const a of assetChecks) {
        await test('Asset ' + a.path + ' returns 200 and ' + a.type, async () => {
            const res = await request({ path: a.path, method: 'GET' });
            assert.strictEqual(res.statusCode, 200);
            assert.ok(res.headers['content-type'].includes(a.type), 'Expected ' + a.type + ' but got ' + res.headers['content-type']);
            assert.ok(res.body.length > 0);
        });
    }

    // 5. HTTP 206 Partial Content Range Streaming
    await test('Video range request (bytes=0-1023) returns 206 Partial Content', async () => {
        const res = await request({
            path: '/assets/videos/industries_pg.mp4',
            method: 'GET',
            headers: { 'Range': 'bytes=0-1023' }
        });
        assert.strictEqual(res.statusCode, 206);
        assert.strictEqual(res.headers['content-length'], '1024');
        assert.ok(res.headers['content-range'].startsWith('bytes 0-1023/'));
        assert.strictEqual(res.headers['accept-ranges'], 'bytes');
        assert.strictEqual(res.body.length, 1024);
    });

    await test('Video range start request (bytes=1000-) returns 206 Partial Content', async () => {
        const res = await request({
            path: '/assets/videos/industries_pg.mp4',
            method: 'GET',
            headers: { 'Range': 'bytes=1000-' }
        });
        assert.strictEqual(res.statusCode, 206);
        assert.ok(res.headers['content-range'].startsWith('bytes 1000-'));
        assert.strictEqual(res.headers['accept-ranges'], 'bytes');
    });

    await test('Video range suffix request (bytes=-500) returns 206 Partial Content', async () => {
        const res = await request({
            path: '/assets/videos/industries_pg.mp4',
            method: 'GET',
            headers: { 'Range': 'bytes=-500' }
        });
        assert.strictEqual(res.statusCode, 206);
        assert.strictEqual(res.headers['content-length'], '500');
        assert.strictEqual(res.body.length, 500);
    });

    await test('Out-of-bounds range request returns 416 Range Not Satisfiable', async () => {
        const res = await request({
            path: '/assets/videos/industries_pg.mp4',
            method: 'GET',
            headers: { 'Range': 'bytes=9999999999-' }
        });
        assert.strictEqual(res.statusCode, 416);
        assert.ok(res.headers['content-range'].startsWith('bytes */'));
    });

    // 6. Directory Traversal Defense
    await test('Directory traversal attack returns 403 or 404', async () => {
        const res1 = await request({ path: '/../../package.json', method: 'GET' });
        assert.ok(res1.statusCode === 403 || res1.statusCode === 404);

        const res2 = await request({ path: '/assets/..%2f..%2fserver.js', method: 'GET' });
        assert.ok(res2.statusCode === 403 || res2.statusCode === 404);

        const res3 = await request({ path: '/..', method: 'GET' });
        assert.ok(res3.statusCode === 403 || res3.statusCode === 404);
    });

    // 7. HTTP Methods (405 Method Not Allowed & HEAD support)
    await test('POST method returns 405 Method Not Allowed with Allow header', async () => {
        const res = await request({ path: '/', method: 'POST' });
        assert.strictEqual(res.statusCode, 405);
        assert.strictEqual(res.headers['allow'], 'GET, HEAD');
    });

    await test('PUT method returns 405 Method Not Allowed', async () => {
        const res = await request({ path: '/styles.css', method: 'PUT' });
        assert.strictEqual(res.statusCode, 405);
        assert.strictEqual(res.headers['allow'], 'GET, HEAD');
    });

    await test('DELETE method returns 405 Method Not Allowed', async () => {
        const res = await request({ path: '/app.js', method: 'DELETE' });
        assert.strictEqual(res.statusCode, 405);
        assert.strictEqual(res.headers['allow'], 'GET, HEAD');
    });

    await test('HEAD method on /styles.css returns 200 with empty body but Content-Length header', async () => {
        const res = await request({ path: '/styles.css', method: 'HEAD' });
        assert.strictEqual(res.statusCode, 200);
        assert.ok(parseInt(res.headers['content-length'], 10) > 0);
        assert.strictEqual(res.body.length, 0);
    });

    await test('HEAD method with Range on video returns 206 with empty body', async () => {
        const res = await request({
            path: '/assets/videos/industries_pg.mp4',
            method: 'HEAD',
            headers: { 'Range': 'bytes=0-99' }
        });
        assert.strictEqual(res.statusCode, 206);
        assert.strictEqual(res.headers['content-length'], '100');
        assert.strictEqual(res.body.length, 0);
    });

    // 8. Query strings on clean URLs
    await test('Query string on clean route /company?source=email returns 200', async () => {
        const res = await request({ path: '/company?source=email', method: 'GET' });
        assert.strictEqual(res.statusCode, 200);
        assert.ok(res.headers['content-type'].includes('text/html'));
        assert.ok(res.body.length > 0);
    });

    // 9. Malformed Range headers fallback gracefully to 200 or 416
    await test('Malformed Range header bytes=abc-def returns full 200 file', async () => {
        const res = await request({
            path: '/assets/intellectir_logo.svg',
            method: 'GET',
            headers: { 'Range': 'bytes=abc-def' }
        });
        assert.strictEqual(res.statusCode, 200);
    });

    await test('Range header with reversed bounds bytes=500-100 returns 416 or 200', async () => {
        const res = await request({
            path: '/assets/intellectir_logo.svg',
            method: 'GET',
            headers: { 'Range': 'bytes=500-100' }
        });
        // Since 500 > 100, parseRangeHeader returns null -> fallback to full 200 or 416
        assert.ok(res.statusCode === 200 || res.statusCode === 416);
    });

    // 10. Missing routes return 404
    await test('Non-existent file returns 404', async () => {
        const res = await request({ path: '/does-not-exist.html', method: 'GET' });
        assert.strictEqual(res.statusCode, 404);
        assert.ok(res.body.toString().includes('404'));
    });

    server.close();
    console.log('\nFinal Test Results: ' + passed + ' passed, ' + failed + ' failed.');
    if (failed > 0) process.exit(1);
}

runTests().catch(err => {
    console.error('Fatal error during test suite:', err);
    process.exit(1);
});
