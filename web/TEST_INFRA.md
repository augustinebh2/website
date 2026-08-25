# Intellectir E2E Testing Infrastructure

**Document ID:** TEST-INFRA-2026-01  
**Project Root:** `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web`  
**Framework:** Native Node.js Zero-Dependency E2E Test Runner  
**Author:** Test Writer 1 (E2E Testing Track)  
**Date:** 2026-08-24  

---

## 1. Testing Philosophy & Architecture

The Intellectir website testing infrastructure follows an **opaque-box, contract-driven, 4-tier testing pyramid** designed for absolute reliability, zero external npm dependencies, and progressive milestone verification.

```
                  ▲
                 / \
                / 4 \     Tier 4: Real-World Workloads & Responsiveness (20 tests)
               /-----\
              /   3   \   Tier 3: Pairwise & Cross-Feature Integration (18 tests)
             /---------\
            /     2     \ Tier 2: Boundary Cases & Security Defense (38 tests)
           /-------------\
          /       1       \ Tier 1: Feature Coverage & Interface Contracts (43 tests)
         /-----------------\
```

### 1.1 Core Principles
1. **Zero Runtime Dependencies**: The test runner and all 4 test suites execute strictly on Node.js standard libraries (`http`, `https`, `fs`, `path`, `url`, `assert`, `child_process`). No external packages (`jest`, `mocha`, `chai`, `cypress`, `puppeteer`) are required.
2. **Server Lifecycle Supervision**: The test runner autonomously manages server startup, readiness polling, connection pooling, and process termination. It can also connect seamlessly to pre-existing servers.
3. **Explicit Expected Output Derivation**: Every test case derives its expected values directly from `PROJECT.md` interface contracts, HTTP specifications, and `spec_report.md` acceptance criteria.
4. **Behavioral Integrity**: Tests validate real system behaviors, HTTP headers, DOM structure, CSS custom property resolution, and JavaScript computation logic without facade bypasses.

---

## 2. Test Runner (`test/e2e_runner.js`)

The test runner provides a lightweight, performant test engine and CLI reporter:

### 2.1 CLI Usage & Options

```bash
# Run all 4 test tiers (T1 - T4)
node test/e2e_runner.js

# Run a specific tier (e.g. Tier 1)
node test/e2e_runner.js --tier=1
node test/e2e_runner.js --tier=2
node test/e2e_runner.js --tier=3
node test/e2e_runner.js --tier=4

# Run specific test file
node test/e2e_runner.js test/test_tier1_features.js

# Run tests matching regex pattern
node test/e2e_runner.js --grep="MIME"
node test/e2e_runner.js --grep="Traversal"

# Custom port or verbose server output
node test/e2e_runner.js --port=8080 --verbose
```

### 2.2 Environment Variables
- `TEST_PORT`: Port for the test server (default: `3000`).
- `TEST_HOST`: Host address for the test server (default: `127.0.0.1`).
- `PORT`: Passed to `server.js` when auto-spawning the server child process.

### 2.3 Exposed DSL & Test Helpers

```javascript
const { describe, test, it, before, after, beforeEach, afterEach, httpRequest, assert, BASE_URL } = require('./e2e_runner');

// HTTP Request helper with byte-range and method support
const res = await httpRequest({
  path: '/styles.css',
  method: 'GET',
  headers: { 'Range': 'bytes=0-1023' }
});

// Custom assertion primitives
assert.assertStatus(res, 206);
assert.assertHeader(res, 'content-type', /text\/css/i);
assert.assertContains(res.body, ':root');
assert.assertNotContains(res.body, 'internal_secret');
```

---

## 3. 4-Tier Test Suite Inventory & Coverage Map

| Tier | File | Test Count | Features & Coverage Area |
| :--- | :--- | :---: | :--- |
| **Tier 1** | `test/test_tier1_features.js` | 43 | Server startup, HTTP 200 routes (`/`, `company.html`, `discover.html`, `industries.html`, `solutions.html`), clean URL rewrites, static assets (`styles.css`, `app.js`, `intellectir_logo.svg`, favicons, mp4, woff2), MIME mapping dictionary, header markup, footer markup, modal markup, ROI & search markup. |
| **Tier 2** | `test/test_tier2_boundary.js` | 38 | Path traversal security defense (`/../`, `/%2e%2e/`, `\..\..\`), non-existent routes (404), unsupported HTTP methods (POST, PUT, DELETE, PATCH -> 405/404), malformed query strings, HTTP 206 Partial Content byte-range streaming, search regex/HTML injection, ROI slider boundary clamping (min=1, max=500, NaN fallbacks). |
| **Tier 3** | `test/test_tier3_pairwise.js` | 18 | Nav link targets vs server endpoints, modal trigger data-attributes vs dialog IDs, Discover category pills vs card categories, ROI slider HTML bounds vs JS rate maps, CSS `:root` variable declarations vs `var()` usage references, HTML component classes vs stylesheet rules. |
| **Tier 4** | `test/test_tier4_workloads.js` | 20 | Full 5-page visitor journey, mobile viewport CSS media queries (992px, 768px, 576px) and `overflow-x: hidden`, consultation booking flow, Discover real-time search & category filter state machine, WCAG AA color contrast algorithms (buttons, text, dark mode), 50-request concurrency stress (<50ms TTFB). |
| **Total** | **4 Suites** | **119 Tests** | **100% Master Feature Inventory Coverage** |

---

## 4. Milestone Verification Gates for Downstream Agents

| Milestone | Implementing Agent | Required Test Gate |
| :--- | :--- | :--- |
| **M1: Server & Asset Infrastructure** | `worker_m1` | Must pass `node test/e2e_runner.js --tier=1` and `node test/e2e_runner.js --tier=2` (resolves path traversal 403/404 and clean URLs). |
| **M2: CSS Architecture & Tokens** | `worker_m2` | Must pass `node test/e2e_runner.js --tier=3` and `node test/e2e_runner.js --grep="WCAG|Mobile"`. |
| **M3: HTML Modernization & Structure** | `worker_m3` | Must pass `node test/e2e_runner.js --tier=1` (Header, Footer, Modal contracts across all 5 pages). |
| **M4: JavaScript & Interactivity** | `worker_m4` | Must pass `node test/e2e_runner.js --tier=2` (Search/ROI boundary cases) and `node test/e2e_runner.js --tier=4` (Workflows). |
| **M5: Final Verification** | `orchestrator_1` / `sentinel` | Must pass `node test/e2e_runner.js` with **100% PASS (119/119 tests)**. |

---

## 5. Known Baseline Implementation Defects (Pre-M1 Escalation)

Prior to the completion of Milestone 1 (`worker_m1`), the baseline `server.js` exhibits the following known security and routing behaviors captured by Tier 2 tests:
1. **Path Traversal Permissiveness**: Requests to `/../server.js` or `/%2e%2e/styles.css` return HTTP 200 rather than HTTP 403/404 due to `path.join(__dirname, reqPath)` lacking path normalization against root directory boundaries.
2. **Missing HTTP 206 Range Streaming**: Large video assets (`industries_pg.mp4`) are loaded via `fs.readFile` rather than streamed with `fs.createReadStream` and `Content-Range` headers.
3. **Clean URL Rewrites**: Extensionless routes (`/company`, `/solutions`) require rewrite mapping to their `.html` counterparts.

*Action:* `worker_m1` will resolve these defects during the M1 execution milestone.
