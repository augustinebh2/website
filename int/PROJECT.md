# Project: Intellectir "How We Work" Component

## Architecture
The Intellectir "How We Work" interactive component is an ultra-high performance, 2.5D spatial canvas integrated into the Intellectir corporate web platform. It delivers a scroll-driven camera journey across Intellectir's 4-phase enterprise AI agent deployment lifecycle, with 4 corner boundary tags, neon accent indicators, glassmorphic UI mockups, and zero-dependency GPU-accelerated motion.

```
┌───────────────────────────────────────────────────────────────────────────┐
│ [Discovery Tag] ──────────────────────────────────────── [Building Tag]   │
│  (Green #10b981)                                          (Blue #3b82f6)  │
│                                                                           │
│   QUADRANT 1: TOP-LEFT                       QUADRANT 2: TOP-RIGHT        │
│   Phase 1: Discovery Call                    Phase 2: Building Phase      │
│   - Vent problems                            - 1-4 weeks build time       │
│   - OS understanding                         - Live progress dashboard    │
│   - Credential handover                      - State-of-the-art arch      │
│   - 40% upfront payment                      [Sprint & Telemetry UI]      │
│   [Intake & Vault UI Mockup]                                              │
│                                                                           │
│                         [ HOW WE WORK ]                                   │
│                                                                           │
│   QUADRANT 3: BOTTOM-LEFT                    QUADRANT 4: BOTTOM-RIGHT     │
│   Phase 3: Integrating phase                 Phase 4: Maintenance         │
│   - Team documentation                       - Optional monthly retain    │
│   - Final testing                            - Real-time updates & opt    │
│   - 60% final payment                        - Exponential improvement    │
│   [Integrations & QA Mockup]                 [Health & RLHF Loop UI]      │
│                                                                           │
│ [Integrating Tag] ──────────────────────────────────── [Maintenance Tag]  │
│  (Purple #a855f7)                                         (Yellow #f59e0b)│
└───────────────────────────────────────────────────────────────────────────┘
```

### Module Boundaries & Data Flow
1. **DOM Structure (`index.html`)**: Pinned scroll track (`#how-we-work-section`), sticky viewport (`.hww-sticky-viewport`), 2.5D canvas container (`.hww-spatial-canvas`), 4 corner tags, central intro frame, and 4 quadrant cards with interactive mockups.
2. **Design Tokens & Visuals (`styles.css`)**: Scoped rules under `#how-we-work-section`, `:root` neon accents (`#10b981`, `#3b82f6`, `#a855f7`, `#f59e0b`), ultra-dark `#0a0a0c` canvas, glassmorphic HUD styling, responsive media queries.
3. **Motion Controller (`app.js` -> `HowWeWorkModule`)**: Zero-dependency `requestAnimationFrame` LERP scroll listener, matrix camera interpolation (`scale`, `translate3d`), corner tag active states, interactive phase scrubber pills, and IntersectionObserver lifecycle.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Section Header & Eyebrow | Section title "How we work" + "METHODOLOGY" eyebrow | M1 | ORIGINAL_REQUEST §3 |
| 2 | Phase 1 Copy & Badging | Exact copy & 4 key points for Discovery Call | M1 | ORIGINAL_REQUEST §3 |
| 3 | Phase 2 Copy & Badging | Exact copy & 3 key points for Building Phase | M1 | ORIGINAL_REQUEST §3 |
| 4 | Phase 3 Copy & Badging | Exact copy & 3 key points for Integrating phase | M1 | ORIGINAL_REQUEST §3 |
| 5 | Phase 4 Copy & Badging | Exact copy & 3 key points for Maintenance | M1 | ORIGINAL_REQUEST §3 |
| 6 | 4 Corner Node Tags | Fixed corner boundary labels: Discovery, Building, Integrating, Maintenance | M1 | ORIGINAL_REQUEST §4 |
| 7 | Quad-Color Neon Theme | Neon Green (#10b981), Blue (#3b82f6), Purple (#a855f7), Yellow (#f59e0b) on #0a0a0c | M1 | ORIGINAL_REQUEST §4 |
| 8 | UI Mockup Phase 1 | Client Intake & Credential Exchange Vault UI | M1 | ORIGINAL_REQUEST §4 |
| 9 | UI Mockup Phase 2 | 1–4 Weeks Build Progress & Telemetry Terminal UI | M1 | ORIGINAL_REQUEST §4 |
| 10 | UI Mockup Phase 3 | Software/DB Integrations Hub & Final Testing QA UI | M1 | ORIGINAL_REQUEST §4 |
| 11 | UI Mockup Phase 4 | Agent Health Retainer & Model RLHF Loop UI | M1 | ORIGINAL_REQUEST §4 |
| 12 | 2.5D Sticky Scroll Engine | Pinned multi-viewport container with smooth scroll tracking | M2 | ORIGINAL_REQUEST §4 |
| 13 | 5-Stage Camera Choreography | 0: Overview -> 1: Q1 -> 2: Q2 -> 3: Q3 -> 4: Q4 -> 5: Ecosystem Zoom-out | M2 | ORIGINAL_REQUEST §4 |
| 14 | Interactive Phase Scrubber | Clickable navigation pills allowing direct jump to any phase | M2 | ORIGINAL_REQUEST §4 |
| 15 | Responsive Adaptation | Multi-device support: Mobile (375px), Tablet (768px), Desktop (1440px+) | M3 | ORIGINAL_REQUEST §5 |
| 16 | 60fps Performance & Polish | GPU-accelerated transforms, zero layout shifts, IntersectionObserver sleep | M3 | ORIGINAL_REQUEST §5 |
| 17 | Accessibility & Reduced Motion | `prefers-reduced-motion` compliance, ARIA attributes, semantic headings | M3 | ORIGINAL_REQUEST §5 |
| 18 | E2E Test Suite (Tiers 1-4) | Comprehensive automated test verification (Tiers 1-4) | E2E-Track | ORIGINAL_REQUEST §6 |
| 19 | Adversarial Hardening (Tier 5) | White-box stress testing, corner cases, and forensic integrity audit | Final | Audit & Verification |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Suite Track | Design and implement complete automated test suite (Tiers 1-4) covering all features | none | DONE |
| M1 | HTML Markup & UI Mockup Cards | Implement semantic DOM structure, 4 phase cards with exact copy, 4 corner tags, and 4 high-fidelity interactive UI mockups | none | DONE |
| M2 | 2.5D Motion Engine & Scroll Camera | Implement sticky scroll track, LERP camera matrix transformations (Stages 0-5), and interactive scrubber in CSS/JS | M1 | IN_PROGRESS |
| M3 | Responsive Polish & Performance | Multi-device reflow (Mobile 375px/Tablet 768px), 60fps GPU optimization, `prefers-reduced-motion` | M2 | PLANNED |
| Final | 100% E2E Pass, Tier 5 Hardening & Audit | Run 100% of test suite, white-box adversarial stress tests (Tier 5), and Forensic Integrity Audit | E2E, M3 | PLANNED |

---

## Interface Contracts
### DOM Interface Contract
- Root Section ID: `#how-we-work-section`
- Scroll Track: `.hww-track` with `data-hww-track`
- Sticky Viewport: `.hww-sticky-viewport`
- 2.5D Canvas: `.hww-spatial-canvas` with `data-hww-canvas`
- 4 Corner Tags: `.hww-corner-tag[data-corner="discovery|building|integrating|maintenance"]`
- 4 Quadrant Cards: `.hww-quadrant-card[data-quadrant="1|2|3|4"]`
- Phase Scrubber: `.hww-nav-pills button[data-hww-goto="1|2|3|4"]`
- Modal CTA triggers: `data-modal-target="demo-modal"`

### JavaScript Module Contract (`app.js`)
- Sub-module: `window.Intellectir.HowWeWorkModule`
- Lifecycle: `init()` called on `DOMContentLoaded`
- Element Guard: `if (!document.getElementById('how-we-work-section')) return;`
- Exposes: `getActivePhase()`, `scrollToPhase(index)`, `destroy()`

---

## Code Layout
- `index.html`: Main landing page (Lines 685–1148 with `#how-we-work-section`).
- `styles.css`: Global styles & scoped `#how-we-work-section` visual rules (Lines 3434–4850).
- `app.js`: Client controller (adds `HowWeWorkModule` to `window.Intellectir`).
- `test/`:
  - `test_tier1_features.js`: Feature-level unit & contract tests.
  - `test_tier2_boundary.js`: Boundary, viewport, and error tests.
  - `test_tier3_pairwise.js`: Interactive state and combination tests.
  - `test_tier4_workloads.js`: Real-world DOM, accessibility, and integration tests.
  - `test_how_we_work_e2e.js`: Dedicated 17-feature E2E tests (Tiers 1-4).
  - `e2e_runner.js`: Master test suite runner.
