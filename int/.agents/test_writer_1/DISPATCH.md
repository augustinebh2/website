# Task Dispatch: E2E Testing Track

Project Root: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web
Working Directory: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\test_writer_1
Original Request: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\ORIGINAL_REQUEST.md
Project Specification: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\PROJECT.md
Spec Miner Report: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\spec_miner_survey_3\spec_report.md

## Scope & File Ownership
You exclusively own:
- `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\test\*`
- `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\TEST_INFRA.md`
- `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\TEST_READY.md`

## Objectives
1. Implement a standalone, zero-dependency Node.js automated test runner in `test/e2e_runner.js`.
2. Implement 4 distinct test suites across Tiers 1-4 according to the Project Pattern:
   - **Tier 1 (Feature Coverage, >=5 tests per feature)**: `test/test_tier1_features.js`
     - Server startup, HTTP 200 responses on all 5 routes (`/`, `/company.html`, `/discover.html`, `/industries.html`, `/solutions.html`), clean URL route rewrites (`/company`, `/discover`, etc.), static asset delivery (`styles.css`, `app.js`, `assets/intellectir_logo.svg`, `assets/favicon.svg`), correct MIME headers, header markup on all pages, footer markup on all pages, modal markup on all pages, ROI calculator markup, discover filter markup.
   - **Tier 2 (Boundary & Edge Cases, >=5 per feature)**: `test/test_tier2_boundary.js`
     - Directory traversal attempts (`/../../etc/passwd`, `/../server.js` -> 403 or 404), non-existent routes (404), unsupported HTTP methods (POST/PUT -> 405 or 404), malformed query strings, partial byte-range requests (`Range: bytes=0-1023` -> 206 Partial Content for video/large files), extreme range boundaries, search filter regex injection characters, empty inputs, whitespace inputs.
   - **Tier 3 (Cross-Feature Combinations & Pairwise Interaction)**: `test/test_tier3_pairwise.js`
     - Header navigation link targets matching existing server routes, modal trigger data-attributes matching modal dialog IDs, Discover category pills matching whitepaper card categories, ROI slider attributes matching JS calculation bounds, CSS variable references resolving to declared `:root` tokens, all class references in HTML existing in CSS.
   - **Tier 4 (Real-World Application Scenarios & Responsiveness Check)**: `test/test_tier4_workloads.js`
     - Full navigation journey across all 5 pages, mobile viewport CSS layout validation (asserting CSS media queries exist for 992px, 768px, 576px, and `#nav-toggle` exists), consultation booking flow (modal open/submit/toast), discover search & filter workflows, WCAG color contrast checks on `.btn-primary` and badges.
3. Create `TEST_INFRA.md` documenting test philosophy, test runner usage, and coverage mapping.
4. Verify execution of `node test/e2e_runner.js` against the server.
5. Create `TEST_READY.md` summarizing the test suite and execution instructions.
6. Write a comprehensive `handoff.md` and send a completion message to the parent orchestrator.
