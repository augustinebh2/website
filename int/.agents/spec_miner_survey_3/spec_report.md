# INTELLECTIR ENTERPRISE AI PLATFORM
## Requirements, Architecture, and Verification Specification Report
**Document ID:** SPEC-WEB-2026-01  
**Project Path:** `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web`  
**Specification Author:** Requirements & Verification Spec Miner  
**Date:** 2026-08-24  
**Integrity Mode:** Development  

---

## 1. Executive Summary & Specification Scope

This document establishes the comprehensive specification, architectural contracts, acceptance criteria, verification mechanisms, automated test suites, and agent-as-judge audit requirements for the complete overhaul of the **Intellectir** enterprise web platform (`c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web`).

Intellectir is an enterprise AI consulting and autonomous agent engineering firm specializing in high-value digital workers, workflow orchestration, and zero-trust enterprise deployments. The website overhaul modernizes all visual assets, standardizes the HTML/CSS/JavaScript codebase for modularity and maintainability, ensures fluid mobile/tablet/desktop responsiveness, and guarantees robust server-side static file delivery with zero runtime errors.

---

## 2. Master Feature Inventory

The platform comprises five core web pages, modular stylesheet architecture, interactive client-side JavaScript controllers, static multimedia assets, and a standalone Node.js server.

### 2.1 Route & Page Inventory
| Route / File | Page Title / Purpose | Core Components & Sections | Active Nav Item |
|---|---|---|---|
| `/` or `/index.html` | Enterprise AI Consulting & Autonomous Agent Engineering | Masthead Nav, Hero Section, Tech Marquee Ticker, New Era Video Banner, 3 Cinematic Service Cards (HUD telemetry), Target Industries Accordion, 6 Enterprise FAQs, Final CTA Banner, Footer, Modal, Toast | Home |
| `/company.html` | About Intellectir \| Enterprise AI Consulting | Masthead Nav, Hero Banner, Mission Card, Contact Card, Security & Compliance Matrix (SOC2, HIPAA, Zero Retention), Impact Stats Bar, Footer, Modal, Toast | Company |
| `/discover.html` | AI Research, Architecture & Insights | Masthead Nav, Hero Banner, Search Input Bar, 5 Category Filter Pills, 6 Technical Whitepaper & Case Study Cards, Footer, Modal, Toast | Discover |
| `/industries.html` | Target Industries Blueprint & ROI Analysis | Masthead Nav, Fullscreen Video Hero, Executive Summary, 6 Industry Deep-Dive Cards (Problem, Solution, ROI), Sales Matrix Cheat Sheet Table, Footer, Modal, Toast | Industries |
| `/solutions.html` | Enterprise AI Solutions & Platform Architecture | Masthead Nav, Hero Banner, 3 Solution Pillars (Workflow Audit, Custom Agent Orchestration [Featured], Enterprise Security), 3 Architecture Infrastructure Cards (RAG, Multi-Agent Mesh, Human-in-the-Loop), Footer, Modal, Toast | Services |

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Navigation | Masthead Header Navigation | Uniform top navigation across all 5 pages with brand logo, nav links, active page highlight, and "Book a Consultation" CTA. | Click on nav links or CTA | Page transition or modal popup | Broken link if href missing; fallback to `#` | HTML codebase inspection |
| 2 | Navigation | Dynamic Header Contrast & Scroll Manager | Automatically switches header between `.dark-nav` (white text) and `.light-nav` / `.scrolled` (dark text, blurred background) based on scroll position and hero background theme. | Window scroll & resize events | DOM class toggle on `#masthead` | Gracefully defaults to `.light-nav` if hero element absent | `app.js` (lines 168-216) |
| 3 | Hero / Visual | Infinite Tech Marquee Ticker | Continuous horizontal scrolling animation showcasing technology partners (OpenAI, Anthropic, DeepMind, Mistral, n8n, AWS, Microsoft, Supabase, Meta, Vercel, Vapi). | CSS animation loop | Infinite marquee track animation | Degrades to static horizontal scroll if CSS animation unsupported | `index.html` & `styles.css` |
| 4 | Hero / Media | New Era Video Banner | Fullscreen ambient video section (`new_era.mp4`) with poster fallback and overlay card highlighting 5-second AI actions. | Viewport scroll intersection | Video playback start and overlay fade-in | Falls back to poster image if video fails or autoplay blocked | `index.html` & `app.js` |
| 5 | Services | Cinematic Service Showcase with HUD Telemetry | 3 interactive enterprise service cards with live simulated agent telemetry HUD streams (Autonomous Agents, Process Automation, Chatbots & Voice). | DOM load / Viewport entry | Rendered HUD logs with styled status indicators | Renders fallback static text if telemetry styles fail | `index.html` |
| 6 | Industries | Minimalist Accordion Blueprint | Expandable industry breakdown on homepage covering Real Estate, Law, and Finance with quantifiable ROI highlights. | Click on accordion header | Expands active accordion body, collapses others | Only one item open at a time; clean DOM toggle | `index.html` & `app.js` |
| 7 | FAQ | 6-Item Enterprise FAQ Accordion | Comprehensive expandable FAQ system addressing employee replacement, errors, data security, technical prerequisites, voice fluency, and AI disclosure. | Click on FAQ question header | Smooth accordion expansion / collapse | Graceful expansion without layout shifts | `index.html` & `app.js` |
| 8 | Dialog / UX | Accessible Consultation Modal | Universal modal popup (`#demo-modal`) with consultation booking form, keyboard ESC support, backdrop click dismissal, and body scroll lock. | Click `.open-modal-btn`, ESC key, backdrop click | Modal dialog display with focus trap & scroll lock | Closes safely; handles missing DOM nodes | `app.js` (lines 240-283) |
| 9 | Notification | Toast Notification Banner | Universal toast notification popup (`#toast`) with checkmark icon and custom feedback message with 4-second auto-dismiss. | `showToast(msg)` function call | Animated bottom-right/top-right toast banner | Auto-dismisses via `setTimeout`; handles rapid triggers | `app.js` (lines 285-307) |
| 10 | Security / Trust | Compliance & Trust Matrix | Security assurance cards on Company page highlighting SOC2 Type II, HIPAA & BAA readiness, zero data retention, and 99.9% uptime SLA. | Page load | Formatted compliance cards and stat counters | Responsive grid wrap on small screens | `company.html` |
| 11 | Search / Filter | Discover Article Search & Filter Bar | Real-time live keyword search combined with category filtering (`all`, `strategy`, `rag`, `governance`, `case-study`) for research whitepapers. | Search input string, category pill click | Filtered card grid with smooth opacity transitions | Shows all cards if search empty; clean empty state | `discover.html` & `app.js` |
| 12 | Video / Media | Top Attached Industry Video Hero | Fullscreen looping MP4 hero video (`industries_pg.mp4`) with sticky pin toggle and audio mute/unmute controls. | Click sticky pin or mute button | Video element state toggle (pinned/unpinned, muted/unmuted) | Handles missing video smoothly with browser fallback | `industries.html` & `app.js` |
| 13 | Industries | 6 Deep-Dive Industry Problem/Solution/ROI Cards | Detailed 3-block cards for Real Estate, Law, Finance, Hospitality, Media, and MedSpas with specific agent names (LeaseIntel, LexBrief, FinAgent, LuxeHost, AdOps, GlowOps). | Page load / CTA click | 3-column comparison grid with action buttons | Mobile wraps to 1-column vertically | `industries.html` |
| 14 | Sales / Table | Executive Sales Cheat Sheet Deal Matrix | Responsive quick-reference table mapping 6 industries to typical deal sizes ($25k-$150k), integration endpoints, and C-suite decision makers. | Page load | Styled responsive table with deal badges | Horizontal overflow scroll container for mobile | `industries.html` |
| 15 | Solutions | 3-Tier Enterprise Solutions & Architecture | Structured solutions grid (Workflow Audit, Custom Agent Orchestration [Featured], Security) and 3 architecture infrastructure cards (RAG, Asynchronous Mesh, Human-in-the-Loop). | Page load | Card grid with featured badges and icons | Stacks cleanly on tablet and mobile | `solutions.html` |
| 16 | Animation | 3D Card Perspective Tilt Engine | Interactive mouse movement tracker that calculates 3D tilt angles (`rotateX`, `rotateY`) and subtle elevation on glassmorphic cards. | Mouse movement over `.glass-card` | Dynamic CSS `transform` perspective update | Resets transform cleanly on `mouseleave` | `app.js` (lines 8-30) |
| 17 | Animation | Cyber Particle Canvas Mesh Backdrop | HTML5 canvas rendering dynamic glowing nodes and proximity connection lines (< 140px) in a continuous requestAnimationFrame loop. | Canvas element presence & window resize | Animated particle graph mesh | Gracefully pauses/resizes with window dimensions | `app.js` (lines 98-165) |
| 18 | Interactive | Interactive ROI Cost & Hours Calculator | Live interactive calculator with department switching (Support, Sales, Finance, Operations), team size slider (1-500), and annual savings calculation. | Department pill click, slider input | Real-time computed annual savings and hours | Fallback defaults if dataset attributes missing | `app.js` (lines 318-375) |
| 19 | Interactive | Autonomous Workflow Execution Simulator | Interactive multi-step simulation demonstrating agent execution (Strategy Engine -> Vector DB -> Neural Mesh -> Guardrails) with live terminal logs. | Click `#sim-run-btn` | Step node progress, progress bar fill, log stream | Prevents concurrent executions with disabled button | `app.js` (lines 429-507) |
| 20 | Interactive | Speed-to-Lead Live Graph Controller | Interactive time selector (5min, 15min, 30min, 24hr) highlighting lead conversion multiplier statistics (21x to 1.0x) and chart bar highlights. | Click `.time-pill-btn` | Bar group opacity/scale transform, stat update | Validates selected time against data map | `app.js` (lines 558-603) |
| 21 | Animation | Scroll Reveal Animation Engine | IntersectionObserver monitoring `.reveal-on-scroll` elements to add `.is-revealed` class on viewport entry. | Scroll intersection with viewport | Smooth fade-in and translateY transition | Unobserves element after reveal for performance | `app.js` (lines 404-427) |
| 22 | Animation | Pinned Scroll Camera Zoom & Pan Engine | 3D world transform engine interpolating camera scale (1.0 to 2.2) and translate3d across 4 workflow quadrants on scroll. | Pinned track scroll progress | Interpolated transform on `#canvas-world` | Clamps progress between 0.0 and 1.0; no jitter | `app.js` (lines 708-884) |
| 23 | Server | Static File & Route Server (`server.js`) | Node.js HTTP server delivering all 5 HTML pages, CSS stylesheets, JS scripts, fonts, images, and video assets with proper MIME types. | HTTP GET / HEAD requests | HTTP 200 OK + asset stream | HTTP 404 for missing paths, 500 for server faults | `ORIGINAL_REQUEST.md` & `server.js` |

---

## 4. Edge Cases & Boundary Behaviors

| # | Feature | Input / Condition | Observed / Documented Expected Behavior |
|---|---------|-------------------|----------------------------------------|
| 1 | Server Routing | HTTP GET to `/` | Server resolves to `index.html`, returns HTTP 200 with `Content-Type: text/html; charset=utf-8`. |
| 2 | Server Routing | HTTP GET with URL query params or hash (e.g. `/?ref=producthunt#services-overview`) | Server strips query/hash to locate static file `index.html`, returns 200 OK without 404. |
| 3 | Server Security | Path traversal attempt (e.g. `/../../windows/win.ini` or `/%2e%2e/server.js`) | Server normalizes path, detects traversal outside project root, and returns HTTP 403 Forbidden or 404 Not Found. Never exposes root filesystem. |
| 4 | Server MIME | Non-existent file request (e.g. `/missing-style.css`) | Returns HTTP 404 Not Found with clean message; does not crash server process. |
| 5 | Discover Search | User types query with leading/trailing whitespace or uppercase (e.g. `"  RAG  "`) | Search term is normalized via `.toLowerCase().trim()`, matching `"rag"` in card titles and descriptions. |
| 6 | Discover Search | Search query with no matches (e.g. `"xyz123abc"`) | All 6 cards transition opacity to 0 and display is set to none. No console errors thrown. |
| 7 | Discover Filter | Combining active category filter with search query | Cards must satisfy BOTH conditions (category match AND keyword match) to remain visible. |
| 8 | Modal Dialog | Multiple rapid clicks on consultation CTA buttons | Modal stays in `.active` state without duplicating backdrop elements or stacking overlay layers. |
| 9 | Modal Dialog | User presses `Escape` key when modal is closed | Event listener checks `demoModal.classList.contains('active')` and ignores key event safely. |
| 10 | Modal Dialog | User clicks directly on modal backdrop area outside card | Click event matches `e.target === demoModal` and triggers clean `closeModal()`. |
| 11 | ROI Calculator | Slider moved to minimum value (1) or maximum value (500) | Slider clamp ensures valid integer; annual savings computed accurately without NaN or formatting errors. |
| 12 | Toast Banner | Multiple form submissions triggered within 4 seconds | `setTimeout` dismisses toast cleanly; existing toast message updates with new text and resets timer. |
| 13 | Header Contrast | Rapid scroll from top to bottom of long page | Event listener triggers `updateHeaderContrast` smoothly; classes `.dark-nav` and `.light-nav` switch without layout flicker. |
| 14 | Accordion Items | User clicks an already-open accordion header | Current item toggles to closed state; all items remain collapsed. |
| 15 | Video Hero | Browser blocks autoplay due to user audio policy | Video elements use `muted playsinline autoplay` to ensure 100% autoplay compliance across iOS Safari and Chrome. |

---

## 5. Exact Acceptance Criteria

### 5.1 Server & Static Delivery Acceptance Criteria
- [ ] **AC-SRV-01 (Clean Startup):** Executing `node server.js` must launch the HTTP server cleanly without runtime warnings or unhandled exceptions, binding to `process.env.PORT` or default port `3000` / `8080`.
- [ ] **AC-SRV-02 (200 Status on Main Routes):** All 5 primary endpoints (`/`, `/company.html`, `/discover.html`, `/industries.html`, `/solutions.html`) must return HTTP status `200 OK`.
- [ ] **AC-SRV-03 (Accurate MIME Types):** All served assets must return exact headers:
  - HTML: `Content-Type: text/html; charset=utf-8`
  - CSS: `Content-Type: text/css; charset=utf-8`
  - JavaScript: `Content-Type: application/javascript; charset=utf-8`
  - SVG: `Content-Type: image/svg+xml`
  - PNG/JPG: `Content-Type: image/png` / `image/jpeg`
  - MP4: `Content-Type: video/mp4`
  - JSON: `Content-Type: application/json; charset=utf-8`
- [ ] **AC-SRV-04 (Error Handling):** Requesting non-existent resources must return HTTP status `404 Not Found` without terminating the server process.
- [ ] **AC-SRV-05 (Path Traversal Protection):** Directory traversal attempts (`../`) must be safely blocked and return HTTP 403 or 404.

### 5.2 Visual Design, Layout & Theming Acceptance Criteria
- [ ] **AC-UI-01 (Modern Visual Aesthetic):** All 5 pages must feature a cohesive visual theme: clean white background palette (`#ffffff`, `#f8fafc`), deep charcoal typography (`#0f172a`, `#475569`), electric blue accents (`#2563eb`, `#4f46e5`), subtle borders (`rgba(15, 23, 42, 0.08)`), and modern glassmorphic elevation.
- [ ] **AC-UI-02 (Uniform Navigation):** The masthead navigation must be identically structured across all 5 pages with consistent brand logo, link ordering (Home, Services, Industries, Discover, Company), active page indicator, and "Book a Consultation" action button.
- [ ] **AC-UI-03 (Uniform Footer):** The site footer must be consistent across all pages with logo, brand tagline, navigation links, copyright notice (`© 2026 Intellectir Inc. All rights reserved.`), and newsletter submission form.
- [ ] **AC-UI-04 (CSS Architecture):** `styles.css` must use clean CSS custom properties (`:root` variables), modular section organization, zero duplicate rule bloat, and consistent class naming conventions.

### 5.3 Mobile & Responsive Layout Acceptance Criteria
- [ ] **AC-RSP-01 (Zero Horizontal Scroll):** All pages must display zero horizontal scrollbar (`overflow-x: hidden`) across mobile (375px), tablet (768px), and desktop (1024px, 1440px) viewports.
- [ ] **AC-RSP-02 (Fluid Grid Stacking):** Multi-column grids (`.ind-grid-3`, `.cinematic-grid-2`, `.pillars-grid`) must gracefully collapse to 1 column on mobile (< 768px) and 2 columns on tablet (768px - 992px).
- [ ] **AC-RSP-03 (Touch Target Compliance):** All interactive elements (buttons, links, form inputs, accordion headers) must meet minimum touch target dimensions (>= 44px x 44px) on mobile viewports.

### 5.4 JavaScript & Interactive Component Acceptance Criteria
- [ ] **AC-JS-01 (Zero Uncaught Console Exceptions):** `app.js` must execute in the browser with 0 uncaught errors or unhandled promise rejections on all 5 pages.
- [ ] **AC-JS-02 (Defensive DOM Attachment):** All DOM element selections in `app.js` must include null-checks before attaching event listeners or mutating styles, ensuring safe execution on pages where specific elements are absent.
- [ ] **AC-JS-03 (Modal Lifecycle):** The consultation modal must open upon clicking any `.open-modal-btn`, lock body scrolling, close on backdrop click, close on `.modal-close-btn` click, and close on `Escape` key press.
- [ ] **AC-JS-04 (Discover Filtering):** The Discover page search input and category filter pills must dynamically filter article cards in real time with smooth transitions.
- [ ] **AC-JS-05 (Accordion Interaction):** FAQ and industry accordion items must expand on click to reveal content and collapse when clicked again or when an alternate item is selected.

---

## 6. Server Verification Specification

### 6.1 Server Architecture Contract (`server.js`)
The server implementation must conform to the following architectural requirements:
1. **Zero-Dependency Core:** Built using Node.js standard library modules (`http`, `fs`, `path`, `url`) to eliminate runtime npm installation dependencies.
2. **Configurable Port:** Resolves port from `process.env.PORT` with a fallback to `3000` (or `8080`).
3. **URL Normalization & Routing:**
   - Strips query strings (`url.parse(req.url).pathname`) and hash fragments.
   - Maps `/` directly to `./index.html`.
   - Resolves relative paths safely inside `__dirname`.
4. **MIME Mapping Dictionary:**
   ```javascript
   const MIME_TYPES = {
       '.html': 'text/html; charset=utf-8',
       '.css': 'text/css; charset=utf-8',
       '.js': 'application/javascript; charset=utf-8',
       '.json': 'application/json; charset=utf-8',
       '.png': 'image/png',
       '.jpg': 'image/jpeg',
       '.jpeg': 'image/jpeg',
       '.svg': 'image/svg+xml',
       '.mp4': 'video/mp4',
       '.ico': 'image/x-icon',
       '.woff2': 'font/woff2',
       '.woff': 'font/woff',
       '.ttf': 'font/ttf'
   };
   ```
5. **Security Constraints:**
   - Evaluates `path.normalize(safePath)`.
   - Verifies `safePath.startsWith(PUBLIC_DIR)` to strictly prevent directory traversal vulnerabilities.
   - Rejects non-GET/HEAD methods with HTTP 405 Method Not Allowed.
6. **Streaming & Range Support:** Supports file streaming via `fs.createReadStream` for efficient static delivery and video streaming (`assets/videos/*.mp4`).

---

## 7. Automated Test Specification (4-Tier Pyramid)

```
             / \
            /   \
           /  4  \      Tier 4: Real-World Workloads & Load Stress
          /-------\
         /    3    \    Tier 3: Cross-Feature Integration Testing
        /-----------\
       /      2      \  Tier 2: Boundary & Edge Case Testing
      /---------------\
     /        1        \ Tier 1: Feature Coverage & Contract Validation
    /-------------------\
```

### 7.1 Tier 1: Feature Coverage & Contract Validation
- **T1.1 (Server Startup & Port Binding):** Verify server spawns child process without error, outputs listening log, and accepts incoming TCP connections on configured port.
- **T1.2 (HTTP 200 on All 5 Pages):** Send HTTP GET to `/`, `/index.html`, `/company.html`, `/discover.html`, `/industries.html`, `/solutions.html` — assert status code `=== 200` and `Content-Type === 'text/html; charset=utf-8'`.
- **T1.3 (Static Assets Verification):** Send HTTP GET to `/styles.css`, `/app.js`, `/assets/intellectir_logo.jpg` — assert status code `=== 200` and matching MIME types.
- **T1.4 (HTML Contract Validation):** Parse all 5 HTML files to verify DOCTYPE, `<html lang="en">`, `<meta charset="UTF-8">`, viewport meta tag, `<title>`, masthead header, main landmark, site footer, and modal dialog markup.
- **T1.5 (CSS Token Verification):** Inspect `styles.css` to verify essential `:root` design tokens are declared (`--bg-main`, `--text-primary`, `--accent-cyan`, `--font-sans`, `--font-heading`).
- **T1.6 (JS Module Syntax Check):** Run `node --check app.js` and `node --check server.js` to ensure 100% valid JavaScript syntax.

### 7.2 Tier 2: Boundary & Edge Case Testing
- **T2.1 (404 Error Handling):** Send HTTP GET to `/nonexistent-route.html` and `/assets/fake-image.png` — assert status code `=== 404` and response body contains error notice without server crash.
- **T2.2 (Path Traversal Security Defense):** Send HTTP GET to `/%2e%2e/server.js`, `/../styles.css`, and `..\..\package.json` — assert server returns 403 Forbidden or 404 Not Found, never leaking external files.
- **T2.3 (Query Strings & URL Fragments):** Send HTTP GET to `/?source=linkedin&campaign=ai2026#demo` — assert server returns `index.html` with HTTP 200.
- **T2.4 (Search Boundary Inputs):** Test Discover search input with empty string, whitespace only, special regex characters (`.*+?^${}()`), and unicode strings — verify no JavaScript errors occur.
- **T2.5 (ROI Slider Boundary Values):** Test ROI Calculator with team size slider values `0`, `1`, `500`, `999` — verify calculations produce valid formatted dollar values.
- **T2.6 (Rapid Modal Triggering):** Trigger 10 rapid open/close events on demo modal — verify single active state, clean scroll lock restoration, and zero duplicate backdrop elements.

### 7.3 Tier 3: Cross-Feature Integration Testing
- **T3.1 (Discover Search + Category Integration):** Select category pill "Enterprise RAG" and type "vector" into search box — assert only cards matching both category AND keyword are visible; switch category to "Governance" — assert cards dynamically re-evaluate.
- **T3.2 (Header Theme & Scroll Integration):** Simulate scroll down page past hero section — verify header acquires `.scrolled` and `.light-nav`; scroll back to top — verify header reverts to transparent mode.
- **T3.3 (ROI Calculator Department Switching):** Select "Finance", move slider to 25 employees — verify hours and savings update according to Finance rate metrics; switch to "Sales" — verify values update immediately with Sales rate metrics.
- **T3.4 (Form Submission & Toast Lifecycle):** Submit consultation form with test data — verify event prevents default, modal closes, form resets, and toast notification appears for 4000ms before smooth fade-out.
- **T3.5 (Workflow Simulator Run & Reset):** Click "Run Workflow Simulation" — observe 4-step progression, terminal logs streaming sequentially, progress bar filling to 100%, button text changing to "Re-Run Simulation", and toast notification triggering upon completion.

### 7.4 Tier 4: Real-World Workloads & Performance
- **T4.1 (High Concurrency Stress):** Execute 50 concurrent HTTP requests across all 5 page routes and static assets — verify 100% success rate with 0 dropped connections.
- **T4.2 (Sub-50ms Response Latency):** Measure HTTP response time for static assets — assert Time-to-First-Byte (TTFB) < 50ms on local server.
- **T4.3 (Memory Stability):** Measure Node.js resident set size (RSS) before and after 1,000 static requests — assert memory variance < 15MB with zero progressive memory leaks.
- **T4.4 (Lighthouse Core Web Vitals Standards):**
  - Largest Contentful Paint (LCP) < 1.8s
  - First Input Delay (FID) / INP < 100ms
  - Cumulative Layout Shift (CLS) < 0.05
  - Total Blocking Time (TBT) < 150ms

---

## 8. Agent-as-Judge Audit Specification

To guarantee visual polish, ergonomic UX, and structural integrity, an automated visual and DOM audit must evaluate the overhauled codebase against these 5 pillars:

```
+-------------------------------------------------------------------------+
|                  AGENT-AS-JUDGE AUDIT SCORECARD                         |
+-------------------------------------------------------------------------+
| [AJ-1] Visual & Aesthetic Hierarchy (Outfit/Inter, White Theme, Glass) |
| [AJ-2] Navigation & Footer Consistency (Identical Structure, Badges)    |
| [AJ-3] Multi-Viewport Responsiveness (375px, 768px, 1024px, 1440px)     |
| [AJ-4] Flexbox & CSS Grid Layout Compliance (Zero Overflow, Fluid Cards)|
| [AJ-5] Zero Console Exceptions & Defensive DOM Architecture             |
+-------------------------------------------------------------------------+
```

### AJ-1: Visual & Aesthetic Hierarchy
- **Standard:** Contemporary white/light theme design language matching enterprise software leaders (Torq, Linear, Stripe).
- **Audit Rules:**
  - Background must be crisp white (`#ffffff`) or light slate (`#f8fafc`).
  - Headings must use `Outfit` font family with bold weight (700/800) and tight letter spacing.
  - Body text must use `Inter` with high legibility line-height (1.6 - 1.7) and deep slate color (`#0f172a`, `#334155`, `#475569`).
  - Accent colors must be electric blue (`#2563eb`) and indigo (`#4f46e5`).
  - Glass cards must feature subtle borders (`1px solid rgba(15, 23, 42, 0.08)`), rounded corners (`14px` - `20px`), and soft box shadows.

### AJ-2: Navigation & Footer Consistency
- **Standard:** Strict visual and structural uniformity across all 5 pages.
- **Audit Rules:**
  - Masthead logo must be `assets/intellectir_logo.jpg` with `INTELLECTIR` brand text linking to `index.html`.
  - Main navigation links must be ordered: `Home` (`index.html`), `Services` (`solutions.html`), `Industries` (`industries.html`), `Discover` (`discover.html`), `Company` (`company.html`).
  - Active navigation item on current page must have `.active` class with blue accent text.
  - Navigation CTA button must say "Book a Consultation" and open `#demo-modal`.
  - Footer must include brand logo, description, navigation links, copyright (`© 2026 Intellectir Inc. All rights reserved.`), and newsletter input form.

### AJ-3: Multi-Viewport Responsiveness
- **Standard:** Flawless rendering across mobile, tablet, desktop, and ultra-wide viewports.
- **Audit Rules:**
  - **Mobile (375px - 480px):** Container padding `0 16px`; 1-column layouts; all text >= 14px; interactive buttons >= 44px height; no clipped elements.
  - **Tablet (768px - 992px):** 2-column grids for feature cards; adjusted hero headline sizing.
  - **Desktop (1024px - 1440px+):** Max container width `1240px` centered; 3-column grids; full cinematic typography.

### AJ-4: Flexbox & CSS Grid Layout Compliance
- **Standard:** Robust modern CSS layout engine without hardcoded pixel widths breaking viewports.
- **Audit Rules:**
  - Multi-column sections must use CSS Grid (`display: grid; grid-template-columns: repeat(auto-fit, minmax(...))` or Flexbox (`display: flex; flex-wrap: wrap`).
  - No element may have a fixed width exceeding `100vw`.
  - Body and main containers must specify `overflow-x: hidden`.

### AJ-5: Zero Console Errors & Defensive DOM Architecture
- **Standard:** 100% error-free JavaScript execution across every page.
- **Audit Rules:**
  - All DOM queries (`document.getElementById`, `document.querySelector`) must be checked for `null` before event listeners or property assignments are made.
  - No unhandled Promise rejections from video `.play()` calls.
  - Form submission handlers must properly intercept and cancel native submission (`e.preventDefault()`).

---

## 9. Conclusion & Implementation Blueprint

This specification provides the authoritative baseline for the website overhaul. All subsequent agents (Redesign, Modularization, Optimization, Verification) must validate their deliverables directly against the Acceptance Criteria and 4-Tier Test Specifications documented herein.
