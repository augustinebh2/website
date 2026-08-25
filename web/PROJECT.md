# Project: Intellectir Enterprise Website Overhaul

## Architecture
The Intellectir website is a high-performance, zero-dependency modern enterprise web application comprising a Node.js static file delivery engine, a modular responsive CSS design system, a component-driven client-side JavaScript architecture, and 5 core semantic HTML5 application pages.

### System Boundaries & Data Flow
```
[Client Browser / Viewport (Mobile/Tablet/Desktop)]
    │
    ├── HTTP Requests (GET /route, /assets/*, Range headers for video)
    ▼
[Node.js Static & Streaming Server (server.js)]
    │   ├── Safe Path Resolution & Directory Traversal Protection
    │   ├── Clean URL Rewrite (/company -> company.html)
    │   ├── MIME Dictionary & HTTP 200/206/404/405/500 Status Responses
    │   └── Byte-Range Audio/Video Streaming & Security Headers
    ▼
[Semantic HTML5 Application Pages]
    ├── index.html       (Hero, Tech Marquee, Cinematic Cards, HUD Panels, Industry Accordion, FAQ, CTA)
    ├── company.html     (Executive Vision, Compliance Matrix, Impact Metrics, Leadership)
    ├── discover.html    (Research Hub, Search Bar, Category Filter Pills, Whitepapers, Speed-to-Lead)
    ├── industries.html  (Video Hero, 6 Industry Deep-Dive Blueprints, Executive Matrix Table)
    └── solutions.html   (Enterprise AI Capabilities, Infrastructure Pillars, Security & Mesh)
    │
    ├── Loaded Stylesheet: styles.css (Design tokens, glassmorphism, responsive grid/flexbox, dark/light themes)
    └── Client Controller: app.js (Mobile drawer, modal dialogs, search filters, ROI slider, animations)
```

## Code Layout
```
web/
├── index.html                   # Primary landing page
├── company.html                 # Company, security & compliance page
├── discover.html                # Research, whitepapers & ROI discovery page
├── industries.html              # Industry solutions & video blueprint page
├── solutions.html               # Enterprise capabilities & architecture page
├── styles.css                   # Unified CSS design system & responsive rules
├── app.js                       # Modular client-side interaction controller
├── server.js                    # Node.js HTTP static & streaming server
├── assets/                      # Static assets, logos, brand icons, videos, favicons
│   ├── intellectir_logo.svg     # Brand vector logo
│   ├── favicon.svg              # Site favicon
│   ├── icons/                   # Brand icons & UI SVGs (OpenAI, Anthropic, Google, Meta, etc.)
│   └── videos/                  # Media assets (industries_pg.mp4)
├── test/                        # E2E Test Suite (Opaque-box testing track)
│   ├── e2e_runner.js            # Automated Node.js HTTP & DOM test runner
│   ├── test_tier1_features.js   # Tier 1: Feature coverage & endpoint contracts
│   ├── test_tier2_boundary.js   # Tier 2: Boundary conditions & error handling
│   ├── test_tier3_pairwise.js   # Tier 3: Cross-feature interactions
│   └── test_tier4_workloads.js  # Tier 4: Real-world user flows & responsiveness
└── .agents/                     # Agent coordination & metadata directory (no source code)
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Zero-Dependency HTTP Server | Native Node.js HTTP server supporting port configuration, MIME headers, clean status codes | M1 | Spec Miner / Explorer 1 |
| 2 | Safe Path Traversal Defense | URL sanitization and path traversal prevention (`..` attack vector mitigation) | M1 | Spec Miner / Explorer 1 |
| 3 | Clean URL Routing | Transparent mapping of extensionless routes (e.g. `/company` -> `company.html`) | M1 | Explorer 1 |
| 4 | Partial Content Video Streaming | HTTP 206 partial range streaming for large multimedia assets (`industries_pg.mp4`) | M1 | Explorer 1 |
| 5 | Asset Directory & Fallback System | Structured `assets/` directory with SVG brand logos, tech icons, and favicons | M1 | Explorer 1 / Explorer 2 |
| 6 | Unified CSS Design Token System | `:root` CSS variables for color palette, typography, glassmorphism, spacing, and shadows | M2 | Explorer 2 / Spec Miner |
| 7 | Purged & Modernized CSS Rules | Elimination of 187 orphan classes; styling of 82 unstyled classes | M2 | Explorer 1 |
| 8 | WCAG AA Color Contrast Compliance | High-contrast button styles (`.btn-primary`), badges, and text readable against backgrounds | M2 | Explorer 2 |
| 9 | Consolidated Responsive Breakpoints | Standardized CSS media queries at 992px (tablet) and 768px/576px (mobile) | M2 | Explorer 2 |
| 10 | Standardized Header & Mobile Drawer | Consistent 5-item navigation across all pages with accessible mobile hamburger drawer | M3 | Explorer 2 / Spec Miner |
| 11 | Unified 4-Column Footer | Cohesive footer across all pages (Brand & Social, Nav, Legal/Compliance, Newsletter) | M3 | Explorer 2 / Explorer 1 |
| 12 | Standardized Consultation Modal | Accessible dialog modal with uniform 3 fields (Name, Email, Industry/Needs) across all pages | M3 | Explorer 1 / Spec Miner |
| 13 | Semantic HTML & SEO Metadata | Semantic HTML5 structure, title tags, meta descriptions, OpenGraph, and favicon links | M3 | Explorer 1 |
| 14 | Removal of Inline Style Overrides | Migration of all inline styles to maintainable CSS classes | M3 | Explorer 2 |
| 15 | Tech Marquee Ticker | Continuous scrolling enterprise partner logo ticker on landing page | M3 | Spec Miner |
| 16 | Modular JavaScript Architecture | Namespace/module structured `app.js` with page-specific execution guards | M4 | Explorer 1 |
| 17 | Mobile Hamburger Navigation Controller | Accessible keyboard/touch hamburger menu toggle and drawer animation | M4 | Explorer 2 |
| 18 | Accessible Modal & Toast Controller | Keyboard trapping, ESC key listener, focus restore, and auto-dismissing toast notifications | M4 | Spec Miner |
| 19 | Discover Search & Filter Engine | Real-time whitepaper search with regex escaping and category pill filtering | M4 | Spec Miner |
| 20 | Interactive ROI & Department Calculator | Dynamic interactive slider and department selector updating real-time ROI estimates | M4 | Spec Miner |
| 21 | Optimized Scroll & Animation Loops | Viewport-guarded animations, debounced scroll/resize handlers, zero unthrottled loops | M4 | Explorer 1 |
| 22 | Industry Accordion & Interactive Tabs | Expand/collapse blueprint accordions and smooth capability tab switching | M4 | Spec Miner |
| 23 | E2E Automated Verification & Testing Suite | Comprehensive 4-tier automated test suite verifying all routes, assets, DOM, and interactions | Test Track / M5 | Spec Miner |
| 24 | Adversarial Hardening (Tier 5) | White-box stress testing, DOM boundary verification, and edge-case hardening | M5 | Project Pattern |

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| Test Track | E2E Testing Track | Build test harness & automated test tiers (T1-T4), publish `TEST_READY.md` | none | DONE |
| M1 | Server & Asset Infrastructure | Upgrade `server.js` (streaming, Range headers, clean URLs, security) & populate `assets/` | none | DONE |
| M2 | CSS Architecture & Design System | Refactor `styles.css` (tokens, dead class purge, contrast fix, responsive media queries) | none | DONE |
| M3 | HTML Pages & Structure Modernization | Overhaul `index.html`, `company.html`, `discover.html`, `industries.html`, `solutions.html` with unified header/mobile drawer, 4-col footer, standard modals, SEO metadata | M1, M2 | DONE |
| M4 | JavaScript & Interactivity Refactor | Refactor `app.js` into modular controllers with page guards, mobile drawer toggle, search filter, ROI calc, toast, zero console errors | M2, M3 | DONE |
| M5 | E2E Verification & Adversarial Hardening | Pass 100% E2E test suite (Tiers 1-4) and complete Tier 5 adversarial stress testing | Test Track, M1-M4 | DONE |

## Interface Contracts

### Server ↔ Client Contract
- **Root URL `/`**: Serves `index.html` with `Content-Type: text/html; charset=utf-8` (HTTP 200).
- **Named Routes**: Requests to `/page.html` or `/page` (e.g. `/company`, `/discover`, `/industries`, `/solutions`) serve corresponding HTML files with HTTP 200.
- **Static Assets**: Requests to `/styles.css`, `/app.js`, `/assets/*` serve correct MIME types (`text/css`, `application/javascript`, `image/svg+xml`, `video/mp4`, `image/jpeg`, `image/png`).
- **Video Range Requests**: Requests with `Range: bytes=start-end` return HTTP 206 Partial Content with `Content-Range` and `Accept-Ranges: bytes` headers.
- **Error Handling**: Non-existent files return clean HTTP 404. Non-GET/HEAD methods return HTTP 405. Path traversal attempts (`/../`) return HTTP 403 or 404.

### Global Header & Navigation Contract
- **Markup Component**: `<header class="site-header">` containing `<div class="nav-container">`, `<a href="index.html" class="brand-logo">`, `<nav class="site-navigation" id="primary-nav">`, `<div class="nav-actions">`, and `<button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="primary-nav">`.
- **Navigation Links**: 5 standard links on all pages:
  1. `Home` -> `index.html`
  2. `Services` -> `solutions.html`
  3. `Industries` -> `industries.html`
  4. `Discover` -> `discover.html`
  5. `Company` -> `company.html`
- **Active State**: Handled via CSS class `class="nav-link active"` on the current page's link (no inline styles).
- **Action CTA**: `<button class="btn btn-outline" data-modal-target="demo-modal">Book Consultation</button>`.

### Global Footer Contract
- **Markup Component**: `<footer class="site-footer">` with 4-column layout:
  - Column 1: Brand Logo, Tagline, Social links (`X/Twitter`, `LinkedIn`, `GitHub`), Status badge.
  - Column 2: Navigation Links (`Home`, `Services`, `Industries`, `Discover`, `Company`).
  - Column 3: Trust & Legal (`Privacy Policy`, `Terms of Service`, `SOC2 Compliance`, `Security Architecture`).
  - Column 4: Newsletter Subscription form with email input and submit button.
- **Bottom Bar**: Copyright, Cape Town / Global Operations badge.

### Consultation Modal Contract
- **Dialog Element**: `<div class="modal" id="demo-modal" role="dialog" aria-modal="true" aria-hidden="true">`.
- **Form**: Form with 3 fields: Name (`id="modal-name"`), Work Email (`id="modal-email"`), Enterprise Need / Industry (`id="modal-interest"`), and Submit button.
- **Trigger**: Any element with `data-modal-target="demo-modal"`.
- **Feedback**: Submission triggers `<div id="toast" class="toast" role="alert">` with confirmation message.

### CSS Class Architecture & Token Contract
- **Tokens**: Defined in `:root` (`--bg-main: #ffffff`, `--bg-card: #ffffff`, `--text-primary: #0f172a`, `--text-muted: #64748b`, `--accent-primary: #2563eb`, `--accent-gradient: linear-gradient(135deg, #2563eb, #4f46e5)`, `--border-subtle: #e2e8f0`, `--radius-md: 12px`, `--radius-lg: 16px`, `--shadow-card: 0 10px 30px rgba(0,0,0,0.06)`).
- **Buttons**: `.btn-primary` has white text (`#ffffff`), high contrast against blue gradient (contrast > 4.5:1).
- **Breakpoints**: Desktop (>992px), Tablet (768px - 992px), Mobile (<768px).

### JavaScript Architecture Contract
- **Namespace**: `window.Intellectir = { ... }` or IIFE modular structure.
- **Sub-modules**:
  - `HeaderNav`: Mobile hamburger toggle, aria attributes, backdrop lock.
  - `ModalSystem`: Modal open/close, focus trapping, ESC key listener, backdrop click.
  - `ToastSystem`: Notification dispatch, auto-dismiss timer.
  - `DiscoverFilter`: Search query debounce, category pill filtering, empty state toggle.
  - `RoiCalculator`: Input slider event handling, department multiplier computation.
  - `AccordionSystem`: Blueprint accordion toggle with ARIA expanded sync.
  - `ScrollObserver`: IntersectionObserver for reveal animations and off-screen pause.
- **Safety**: Every module checks for the existence of its target DOM elements before attaching event listeners (guaranteeing zero uncaught exceptions on any page).

## Dead Ends
| Iteration | Approach Tried | Why It Failed | Files Touched |
|-----------|---------------|---------------|---------------|
