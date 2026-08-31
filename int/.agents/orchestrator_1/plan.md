# Project Execution Plan: Intellectir Website Overhaul

## 1. Overview & Objectives
Execute an end-to-end overhaul of the Intellectir website codebase to deliver an enterprise-grade visual redesign, responsive layout, modular CSS/JS architecture, secure HTTP server with streaming support, and comprehensive 4-tier automated testing.

## 2. Dual-Track Execution Strategy
- **Track A (E2E Testing Track)**: Runs in parallel with early implementation to build the opaque-box test runner, HTTP assertions, DOM validators, responsive checks, and real-world scenario tests. Publishes `TEST_READY.md`.
- **Track B (Implementation Track)**: Executes sequential milestones through dedicated sub-orchestrators / workers with rigorous gate reviews (Worker -> Reviewers -> Challengers -> Forensic Auditor).

## 3. Detailed Milestone Decomposition

### Track A: E2E Testing Track (Parallel)
- **Scope**: Create `test/e2e_runner.js`, `test/test_tier1_features.js`, `test/test_tier2_boundary.js`, `test/test_tier3_pairwise.js`, `test/test_tier4_workloads.js`.
- **Deliverable**: Automated test suite executing without external dependencies via Node.js, publishing `TEST_READY.md`.

### Track B: Implementation Track

#### Milestone 1: Server & Asset Infrastructure (M1)
- **Scope**:
  - Refactor `server.js` with streaming (`fs.createReadStream`), HTTP 206 `Range` header support for `.mp4`, path traversal sanitization, clean extensionless URL routing (`/company` -> `company.html`), proper MIME dictionary, and security headers.
  - Setup local `assets/` directory with `intellectir_logo.svg`, `favicon.svg`, brand icons for tech marquee, and ensure media assets resolve cleanly.
- **Verification Gate**: Server starts on configurable port, serves all static assets, returns 200 for pages/assets, 206 for video ranges, 404 for missing paths, 403/404 for traversal attempts.

#### Milestone 2: CSS Architecture & Global Design System (M2)
- **Scope**:
  - Refactor `styles.css`: Centralize design tokens in `:root` variables (`--bg-main`, `--text-primary`, `--accent-primary`, `--radius-md`, etc.).
  - Purge 187 orphan/unused classes from legacy Torq UI clone.
  - Implement explicit styles for 82 unstyled HTML classes.
  - Fix color contrast across all buttons, badges, and cards to exceed WCAG 2.1 AA (4.5:1).
  - Consolidate responsive media queries at 992px, 768px, and 576px breakpoints.
- **Verification Gate**: CSS compiles cleanly, zero orphaned class conflicts, mobile breakpoints render cleanly, contrast validation passes.

#### Milestone 3: HTML Pages & Structural Modernization (M3)
- **Scope**:
  - Overhaul all 5 HTML pages (`index.html`, `company.html`, `discover.html`, `industries.html`, `solutions.html`).
  - Standardize Header Navigation across all pages (5 items: Home, Services, Industries, Discover, Company) with mobile hamburger toggle button (`#nav-toggle`).
  - Standardize Footer to a uniform 4-column layout (Brand & Social, Navigation, Trust & Legal, Newsletter).
  - Align Consultation Modal dialog to uniform 3 fields (Name, Email, Needs/Industry) across all pages.
  - Add SEO metadata, page titles, OpenGraph tags, and favicon link.
  - Remove all inline `style="..."` overrides and migrate to CSS classes.
- **Verification Gate**: All pages contain uniform header/footer/modal structures, semantic HTML validation passes, zero broken image/link references.

#### Milestone 4: JavaScript Architecture & Interactivity Refactor (M4)
- **Scope**:
  - Refactor `app.js` into modular namespaces/controllers (`HeaderNav`, `ModalSystem`, `ToastSystem`, `DiscoverFilter`, `RoiCalculator`, `AccordionSystem`, `ScrollObserver`).
  - Add element existence guards for every DOM query to eliminate uncaught exceptions on secondary pages.
  - Implement mobile hamburger menu drawer toggle with ARIA attribute synchronization.
  - Implement Discover search input filtering and category pill selection.
  - Implement ROI interactive slider and department multiplier logic.
  - Optimize animation loops: replace unthrottled `requestAnimationFrame` with `IntersectionObserver` visibility guards.
- **Verification Gate**: Zero browser console errors across all 5 pages, all interactive elements function smoothly on desktop and mobile.

#### Milestone 5: E2E Verification & Adversarial Hardening (M5)
- **Scope**:
  - Phase 1: Execute 100% of E2E test suite (Tiers 1-4) against running server and resolve any discovered issues.
  - Phase 2: Adversarial Coverage Hardening (Tier 5) with Challengers probing edge cases, DOM boundary limits, rapid event sequences, and stress scenarios.
- **Verification Gate**: 100% test pass rate across all tiers, clean Forensic Audit report.

## 4. Final Review & Delivery
- Execute final forensic integrity audit.
- Compile summary report and present completion verification.
