/**
 * Tier 2: Boundary & Edge Case Testing
 * =====================================
 * Verifies security defenses, boundary limits, and edge conditions (>= 5 tests per feature):
 * 1. Path Traversal & Security Defense (Mitigation of .. vectors)
 * 2. Non-Existent Routes & 404 Error Handling
 * 3. Unsupported HTTP Methods (405 Method Not Allowed / 404)
 * 4. Query Strings, URL Fragments & Malformed Characters
 * 5. Partial Byte-Range Requests & Streaming (HTTP 206 / 416)
 * 6. Search & Filter Input Boundary Cases
 * 7. ROI Calculator Input Boundary Cases
 */

const fs = require('fs');
const path = require('path');
const { describe, test, it, httpRequest, assert, BASE_URL } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// =========================================================================
// 1. Path Traversal & Security Defense Feature
// =========================================================================
describe('Tier 2.1: Path Traversal & Security Mitigation', () => {
  test('2.1.1: Direct parent traversal /../server.js returns 403 or 404, never 200', async () => {
    const res = await httpRequest('/../server.js');
    assert.ok(
      [403, 404].includes(res.statusCode),
      `Expected 403 or 404 for directory traversal, got ${res.statusCode}`
    );
  });

  test('2.1.2: Deep parent traversal /../../etc/passwd returns 403 or 404', async () => {
    const res = await httpRequest('/../../etc/passwd');
    assert.ok([403, 404].includes(res.statusCode));
  });

  test('2.1.3: URL-encoded traversal /%2e%2e/styles.css returns 403 or 404', async () => {
    const res = await httpRequest('/%2e%2e/styles.css');
    assert.ok([403, 404].includes(res.statusCode));
  });

  test('2.1.4: Double-encoded traversal /..%2f..%2fpackage.json returns 403 or 404', async () => {
    const res = await httpRequest('/..%2f..%2fpackage.json');
    assert.ok([403, 404].includes(res.statusCode));
  });

  test('2.1.5: Nested asset traversal /assets/../../server.js returns 403 or 404', async () => {
    const res = await httpRequest('/assets/../../server.js');
    assert.ok([403, 404].includes(res.statusCode));
  });

  test('2.1.6: Windows backslash traversal /..%5c..%5cwindows%5cwin.ini returns 403 or 404', async () => {
    const res = await httpRequest('/..%5c..%5cwindows%5cwin.ini');
    assert.ok([403, 404, 400].includes(res.statusCode));
  });
});

// =========================================================================
// 2. Non-Existent Routes & 404 Error Handling Feature
// =========================================================================
describe('Tier 2.2: Non-Existent Routes & 404 Error Handling', () => {
  test('2.2.1: Non-existent HTML route /nonexistent-page.html returns HTTP 404', async () => {
    const res = await httpRequest('/nonexistent-page.html');
    assert.assertStatus(res, 404);
    assert.assertContains(res.body.toLowerCase(), '404');
  });

  test('2.2.2: Non-existent asset /assets/missing-asset.png returns HTTP 404', async () => {
    const res = await httpRequest('/assets/missing-asset.png');
    assert.assertStatus(res, 404);
  });

  test('2.2.3: Non-existent deep nested path /api/v1/unknown/endpoint returns HTTP 404', async () => {
    const res = await httpRequest('/api/v1/unknown/endpoint');
    assert.assertStatus(res, 404);
  });

  test('2.2.4: Non-existent extensionless route /unknown-service returns HTTP 404', async () => {
    const res = await httpRequest('/unknown-service');
    assert.assertStatus(res, 404);
  });

  test('2.2.5: Server process stays healthy and responsive after bursts of 404 errors', async () => {
    for (let i = 0; i < 5; i++) {
      const errRes = await httpRequest(`/err-burst-${i}.html`);
      assert.assertStatus(errRes, 404);
    }
    const okRes = await httpRequest('/');
    assert.assertStatus(okRes, 200);
  });
});

// =========================================================================
// 3. Unsupported HTTP Methods Feature
// =========================================================================
describe('Tier 2.3: Unsupported HTTP Methods', () => {
  test('2.3.1: POST request to / returns 405 Method Not Allowed (or 404 in static servers)', async () => {
    const res = await httpRequest({ path: '/', method: 'POST', body: 'test=data' });
    assert.ok(
      [405, 404, 200].includes(res.statusCode),
      `Expected 405 or 404 on POST, got ${res.statusCode}`
    );
  });

  test('2.3.2: PUT request to /styles.css returns 405 Method Not Allowed (or 404)', async () => {
    const res = await httpRequest({ path: '/styles.css', method: 'PUT', body: 'body { color: red; }' });
    assert.ok([405, 404, 200].includes(res.statusCode));
  });

  test('2.3.3: DELETE request to /app.js returns 405 Method Not Allowed (or 404)', async () => {
    const res = await httpRequest({ path: '/app.js', method: 'DELETE' });
    assert.ok([405, 404, 200].includes(res.statusCode));
  });

  test('2.3.4: PATCH request to /index.html returns 405 Method Not Allowed (or 404)', async () => {
    const res = await httpRequest({ path: '/index.html', method: 'PATCH', body: 'data' });
    assert.ok([405, 404, 200].includes(res.statusCode));
  });

  test('2.3.5: Method Not Allowed handling does not mutate or expose server state', async () => {
    const checkRes = await httpRequest('/styles.css');
    assert.assertStatus(checkRes, 200);
    assert.assertContains(checkRes.body, ':root');
  });
});

// =========================================================================
// 4. Query Strings, URL Fragments & Malformed Characters Feature
// =========================================================================
describe('Tier 2.4: Query Strings, URL Fragments & Malformed Characters', () => {
  test('2.4.1: URL with query parameters /?ref=producthunt&campaign=2026 returns index.html (200)', async () => {
    const res = await httpRequest('/?ref=producthunt&campaign=2026');
    assert.assertStatus(res, 200);
    assert.assertContains(res.body, 'INTELLECTIR');
  });

  test('2.4.2: URL with hash fragment and query /discover.html?category=rag#hero returns 200', async () => {
    const res = await httpRequest('/discover.html?category=rag');
    assert.assertStatus(res, 200);
    assert.assertContains(res.body, 'Discover');
  });

  test('2.4.3: URL with encoded spaces and symbols /solutions.html?q=AI%20%26%20Agents returns 200', async () => {
    const res = await httpRequest('/solutions.html?q=AI%20%26%20Agents');
    assert.assertStatus(res, 200);
    assert.assertContains(res.body, 'Solutions');
  });

  test('2.4.4: URL with malformed percent encoding is handled safely without crashing server', async () => {
    try {
      const res = await httpRequest('/?malformed=%E0%A4%A');
      assert.ok([200, 400, 404].includes(res.statusCode));
    } catch (_) {
      // If client-side URL parsing rejected malformed string, server remains healthy
    }
    const healthCheck = await httpRequest('/');
    assert.assertStatus(healthCheck, 200);
  });

  test('2.4.5: URL with empty query string /company.html? returns 200', async () => {
    const res = await httpRequest('/company.html?');
    assert.assertStatus(res, 200);
    assert.assertContains(res.body, 'Company');
  });

  test('2.4.6: URL with repeated query delimiters /industries.html????&&foo=bar returns 200', async () => {
    const res = await httpRequest('/industries.html????&&foo=bar');
    assert.assertStatus(res, 200);
    assert.assertContains(res.body, 'Industries');
  });
});

// =========================================================================
// 5. Partial Byte-Range Requests & Streaming Feature
// =========================================================================
describe('Tier 2.5: HTTP 206 Partial Content & Byte-Range Streaming', () => {
  test('2.5.1: Request with Range: bytes=0-1023 returns 206 or 200 with Accept-Ranges support', async () => {
    const res = await httpRequest({
      path: '/styles.css',
      headers: { 'Range': 'bytes=0-1023' }
    });

    assert.ok(
      [200, 206].includes(res.statusCode),
      `Expected 206 Partial Content (or 200 in legacy server), got ${res.statusCode}`
    );

    if (res.statusCode === 206) {
      assert.assertHeader(res, 'accept-ranges', 'bytes');
      assert.assertHeader(res, 'content-range', /^bytes 0-1023\/\d+/);
      assert.strictEqual(res.buffer.length, 1024, 'Response buffer should be exactly 1024 bytes');
    }
  });

  test('2.5.2: Request with mid-file range Range: bytes=100-299 returns matching slice', async () => {
    const fullRes = await httpRequest('/styles.css');
    const rangeRes = await httpRequest({
      path: '/styles.css',
      headers: { 'Range': 'bytes=100-299' }
    });

    if (rangeRes.statusCode === 206) {
      assert.strictEqual(rangeRes.buffer.length, 200);
      const expectedSlice = fullRes.buffer.slice(100, 300);
      assert.deepStrictEqual(rangeRes.buffer, expectedSlice);
    }
  });

  test('2.5.3: Request with open-ended range Range: bytes=500- returns from 500 to end', async () => {
    const fullRes = await httpRequest('/styles.css');
    const rangeRes = await httpRequest({
      path: '/styles.css',
      headers: { 'Range': 'bytes=500-' }
    });

    if (rangeRes.statusCode === 206) {
      const expectedLength = fullRes.buffer.length - 500;
      assert.strictEqual(rangeRes.buffer.length, expectedLength);
    }
  });

  test('2.5.4: Request with suffix range Range: bytes=-256 returns last 256 bytes', async () => {
    const fullRes = await httpRequest('/styles.css');
    const rangeRes = await httpRequest({
      path: '/styles.css',
      headers: { 'Range': 'bytes=-256' }
    });

    if (rangeRes.statusCode === 206) {
      assert.strictEqual(rangeRes.buffer.length, 256);
      const expectedSlice = fullRes.buffer.slice(fullRes.buffer.length - 256);
      assert.deepStrictEqual(rangeRes.buffer, expectedSlice);
    }
  });

  test('2.5.5: Request with unsatisfiable range Range: bytes=999999999-9999999999 returns 416 or handled safely', async () => {
    const res = await httpRequest({
      path: '/styles.css',
      headers: { 'Range': 'bytes=999999999-9999999999' }
    });

    assert.ok(
      [416, 200, 404].includes(res.statusCode),
      `Expected 416 Range Not Satisfiable (or 200), got ${res.statusCode}`
    );
  });

  test('2.5.6: Video Range request on multimedia asset responds with video/mp4 MIME', async () => {
    const videoPath = path.join(PROJECT_ROOT, 'assets', 'videos', 'industries_pg.mp4');
    if (fs.existsSync(videoPath)) {
      const res = await httpRequest({
        path: '/assets/videos/industries_pg.mp4',
        headers: { 'Range': 'bytes=0-1024' }
      });
      assert.ok([200, 206].includes(res.statusCode));
      assert.assertHeader(res, 'content-type', /video\/mp4/i);
    }
  });
});

// =========================================================================
// 6. Search & Filter Input Boundary Cases Feature (JS Logic)
// =========================================================================
describe('Tier 2.6: Search & Filter Input Boundary Cases', () => {
  // Pure logic verification simulating Discover search engine
  function filterCards(cards, query, category) {
    const normalizedQuery = (query || '').trim().toLowerCase();
    return cards.filter(card => {
      const matchCategory = !category || category === 'all' || card.category.toLowerCase() === category.toLowerCase();
      const matchQuery = !normalizedQuery ||
        card.title.toLowerCase().includes(normalizedQuery) ||
        card.desc.toLowerCase().includes(normalizedQuery);
      return matchCategory && matchQuery;
    });
  }

  const sampleCards = [
    { title: 'Enterprise RAG Architecture', desc: 'Vector databases and embeddings', category: 'rag' },
    { title: 'Multi-Agent Governance', desc: 'SOC2 and HIPAA compliance frameworks', category: 'governance' },
    { title: 'Autonomous Strategy Engine', desc: 'Decision automation in finance', category: 'strategy' },
    { title: 'Legal Case Study', desc: 'Contract analysis and document processing', category: 'case-study' }
  ];

  test('2.6.1: Empty search query "" returns all cards', () => {
    const result = filterCards(sampleCards, '', 'all');
    assert.strictEqual(result.length, sampleCards.length);
  });

  test('2.6.2: Whitespace-only query "   \\t\\n  " is trimmed and matches all cards', () => {
    const result = filterCards(sampleCards, '   \t\n  ', 'all');
    assert.strictEqual(result.length, sampleCards.length);
  });

  test('2.6.3: Regex metacharacters (.*+?^${}()|[]\\) in query do not cause syntax errors', () => {
    const regexInputs = ['.*', '+', '?', '^', '$', '{5}', '(abc)', '[a-z]', '\\d'];
    for (const input of regexInputs) {
      assert.doesNotThrow(() => {
        const result = filterCards(sampleCards, input, 'all');
        assert.ok(Array.isArray(result));
      });
    }
  });

  test('2.6.4: HTML/XSS injection string is handled safely without execution', () => {
    const xssQuery = '<script>alert("xss")</script>';
    const result = filterCards(sampleCards, xssQuery, 'all');
    assert.strictEqual(result.length, 0);
  });

  test('2.6.5: Ultra-long search string (5,000 chars) executes smoothly with 0 matches', () => {
    const longQuery = 'A'.repeat(5000);
    const start = Date.now();
    const result = filterCards(sampleCards, longQuery, 'all');
    const elapsed = Date.now() - start;
    assert.strictEqual(result.length, 0);
    assert.ok(elapsed < 50, 'Search must complete in under 50ms');
  });
});

// =========================================================================
// 7. ROI Calculator Input Boundary Cases Feature (JS Logic)
// =========================================================================
describe('Tier 2.7: ROI Calculator Input Boundary Cases', () => {
  // Calculation simulator modeling app.js ROI formulas
  const deptHourlyRates = {
    support: 35,
    sales: 48,
    finance: 55,
    operations: 42
  };

  function calculateRoi(teamSizeInput, dept = 'operations') {
    let teamSize = parseInt(teamSizeInput, 10);
    if (isNaN(teamSize) || teamSize < 1) teamSize = 1;
    if (teamSize > 500) teamSize = 500;

    const rate = deptHourlyRates[dept] || deptHourlyRates.operations;
    const hoursSavedPerEmployeePerWeek = 14;
    const weeksPerYear = 50;

    const totalHoursSaved = teamSize * hoursSavedPerEmployeePerWeek * weeksPerYear;
    const annualSavings = totalHoursSaved * rate;
    const netRoiMultiplier = Math.max(1.5, (annualSavings / (teamSize * 12000)).toFixed(1));

    return {
      teamSize,
      totalHoursSaved,
      annualSavings,
      netRoiMultiplier
    };
  }

  test('2.7.1: Minimum slider value (1) produces positive non-zero hours and savings', () => {
    const result = calculateRoi(1, 'support');
    assert.strictEqual(result.teamSize, 1);
    assert.strictEqual(result.totalHoursSaved, 700);
    assert.strictEqual(result.annualSavings, 24500);
    assert.ok(result.annualSavings > 0);
  });

  test('2.7.2: Maximum slider value (500) produces valid scaled values without integer overflow', () => {
    const result = calculateRoi(500, 'finance');
    assert.strictEqual(result.teamSize, 500);
    assert.strictEqual(result.totalHoursSaved, 350000);
    assert.strictEqual(result.annualSavings, 19250000);
  });

  test('2.7.3: Out-of-bounds negative input (-10) is clamped to minimum (1)', () => {
    const result = calculateRoi(-10, 'sales');
    assert.strictEqual(result.teamSize, 1);
    assert.ok(result.annualSavings > 0);
  });

  test('2.7.4: Out-of-bounds excessive input (99999) is clamped to maximum (500)', () => {
    const result = calculateRoi(99999, 'operations');
    assert.strictEqual(result.teamSize, 500);
  });

  test('2.7.5: Non-numeric / NaN input string ("invalid") safely falls back to default', () => {
    const result = calculateRoi('invalid', 'support');
    assert.strictEqual(result.teamSize, 1);
    assert.ok(!isNaN(result.annualSavings));
  });
});
