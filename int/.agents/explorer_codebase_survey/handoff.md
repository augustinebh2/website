# Architectural Codebase Survey & Integration Plan: Intellectir Website & "How We Work" Component

## 1. Observation

### 1.1 Project Structure & System Boundaries
- **Project Root**: `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int`
- **Working Agent Directory**: `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/.agents/explorer_codebase_survey`
- **Application Type**: High-performance, zero-dependency vanilla static web application served by native Node.js (`server.js`).
- **Core File Manifest**:
  - `index.html` (54,573 bytes, 757 lines): Primary landing page with Hero, Marquee, Awareness, Proposition, How We Work placeholder, and Watermark Footer.
  - `styles.css` (105,572 bytes, 4,357 lines): Global CSS design token architecture, typography, glassmorphism, responsive grid/flexbox, and dark theme conventions.
  - `app.js` (43,738 bytes, 1,018 lines): Zero-dependency modular client controller exposing `window.Intellectir`.
  - `server.js` (12,454 bytes, 352 lines): Native Node.js HTTP server supporting clean URLs, MIME dictionaries, HTTP 206 video range streaming, and path traversal defense.
  - `ORIGINAL_REQUEST.md` (3,831 bytes, 58 lines): Authoritative project requirements, verbatim 4-phase copy, and 2.5D spatial animation specifications.
  - `PROJECT.md` (12,375 bytes, 147 lines): Architecture documentation, layout specs, and interface contracts.
  - `test/` (5 files, 66,381 bytes): Automated 4-tier E2E test suite (`e2e_runner.js`, `test_tier1_features.js`, `test_tier2_boundary.js`, `test_tier3_pairwise.js`, `test_tier4_workloads.js`).
  - `assets/` (15 files + 2 subdirectories `icons/` and `videos/`): Logos, SVG icons (OpenAI, Anthropic, DeepMind, AWS, Pinecone, etc.), favicons, and video files (`industries_pg.mp4`, `new_era.mp4`).

### 1.2 Baseline E2E Test Suite Execution Result
- Command executed: `node test/e2e_runner.js`
- Test Output:
  ```
  Test Run Summary:
    Suites:   27
    Total:    119
    Passed:   119 (100%)
    Duration: 4.08s
   ALL TESTS PASSED (119/119)
  ```
- Current test status: 100% green across all 4 tiers (Feature coverage, Boundary & security, Cross-feature pairwise, Real-world workloads & contrast).

### 1.3 `index.html` DOM Hierarchy & Section Breakdown
Direct observation from inspecting `index.html`:
1. **Document Root & Meta** (Lines 1–30):
   - `<html lang="en">`, `<body class="dark-theme">`.
   - Fonts loaded: `Outfit` (400-900), `Inter` (300-800), `Bodoni Moda` (400-900 italic/normal), `JetBrains Mono` (400-600).
   - Icons: FontAwesome 6.4.0 (`all.min.css`).
2. **Floating Island Header** (Lines 33–59):
   - `<header id="masthead" class="site-header dark-nav">` with `.nav-container.main-header`.
   - Brand link: `<a href="index.html" class="brand-logo">` with `assets/intellectir_logo.jpg` and `INTELLECTIR`.
   - Primary navigation (`#primary-nav`): 5 links (`Home`, `Services`, `Industries`, `Discover`, `Company`).
   - Header actions: Consultation button (`data-modal-target="demo-modal"`) and mobile menu hamburger (`#nav-toggle`).
3. **Hero Section** (Lines 64–90):
   - `<section class="hero-fullscreen-section">` with autoplay looping background video `assets/videos/hero_video.mp4`, dark overlay, and bottom-left headline "Transforming the future of business with Agentic Engineering."
4. **Tech Partner Marquee** (Lines 93–213):
   - `<section class="tech-marquee-between-section">` with 2 identical groups of 13 technology brand logos for infinite scrolling ticker.
5. **Global Digital Shift Awareness Section** (Lines 216–236):
   - `<section class="awareness-fullscreen-section" id="awareness-section">` with autoplay video `assets/videos/new_era.mp4` and `.c-shaped-card.scroll-animate-target`.
6. **Pitch-Black Domain Wrapper** (Lines 239–721):
   - `<div class="pitch-black-domain">` wrapping all dark methodology and proposition sections:
     - **Proposition Section** (Lines 241–682, `#proposition-section`):
       - Block 1: `#prop-revenue-block` ("1. Drive Revenue Growth") with 5 interactive tabs (`rev-tab-1` to `rev-tab-5`).
       - Block 2: `#prop-productivity-block` ("2. Maximise Productivity") with 4 interactive tabs (`prod-tab-1` to `prod-tab-4`).
       - Block 3: `#prop-experience-block` ("3. Improve Customer Experience") with 3 interactive tabs (`exp-tab-1` to `exp-tab-3`).
     - **Exact Insertion Point: How We Work Section** (Lines 685–694, `#how-we-work-section`):
       ```html
       <!-- 5. HOW WE WORK SECTION (RESERVED PLACEHOLDER SPACE) -->
       <section class="how-we-work-section" id="how-we-work-section">
           <div class="wrapper">
               <!-- Reserved space for How We Work section -->
               <div class="reserved-space-container">
                   <span class="subhead-tag"><i class="fa-solid fa-diagram-project"></i> METHODOLOGY</span>
                   <h2 class="section-title text-white">How We Work</h2>
                   <p class="section-lead text-white-muted">Our structured end-to-end framework for auditing, architecting, and deploying custom AI agents into your business operations.</p>
               </div>
           </div>
       </section>
       ```
     - **Watermark Footer** (Lines 697–719, `#watermark-section`):
       - Spanning SVG logo `assets/watermark_ir_logo.svg`, divider line, slogan `INTELLIGENCE. LIMITLESS POSSIBILITIES.`, and copyright bar.
7. **Modals & Client Scripts** (Lines 725–756):
   - Consultation dialog (`#demo-modal.modal-backdrop.modal`).
   - Toast alert container (`#toast.toast`).
   - Single script tag: `<script src="app.js"></script>`.

### 1.4 `styles.css` Architecture & Design System Tokens
- **Design Tokens (`:root`)** (Lines 9–76):
  - Theme colors: `--bg-main: #ffffff`, `--bg-dark: #090d16`, `--bg-dark-surface: #0f172a`, `--bg-card-glass: rgba(255, 255, 255, 0.92)`.
  - Foreground colors: `--text-primary: #0f172a`, `--text-muted: #64748b`, `--text-inverse: #ffffff`, `--text-inverse-muted: #cbd5e1`.
  - Accent colors: `--accent-primary: #2563eb`, `--accent-secondary: #4f46e5`, `--accent-cyan: #0284c7`, `--accent-emerald: #059669`, `--accent-amber: #d97706`, `--accent-pink: #d946ef`, `--accent-rose: #e11d48`.
  - Typography: `--font-sans: 'Inter'`, `--font-heading: 'Outfit'`, `--font-mono: 'JetBrains Mono'`.
  - Radii & Container: `--container-width: 1240px`, `--radius-sm: 6px`, `--radius-md: 12px`, `--radius-lg: 18px`, `--radius-full: 9999px`.
- **Dark Theme & Pitch Black Rules** (Lines 2704–2745 & Lines 3434–3446):
  - `.pitch-black-domain`: `background-color: #000000; color: #ffffff; width: 100%; padding-top: 5rem;`.
  - `.text-white`: `color: #ffffff !important;`.
  - `.text-white-muted`: `color: rgba(255, 255, 255, 0.75) !important;`.
  - `.how-we-work-section`: `padding: 5rem 0;`.
  - `.reserved-space-container`: `border: 2px dashed rgba(255, 255, 255, 0.18); border-radius: 24px; padding: 4rem 2rem; text-align: center; background: rgba(255, 255, 255, 0.02);`.
- **Breakpoints**: Standard media queries at `@media (max-width: 992px)` (tablet), `@media (max-width: 768px)` (mobile), and `@media (max-width: 576px)` (small mobile).

### 1.5 `app.js` Interaction Controller Architecture
- Encapsulated in self-executing IIFE `(function (window, document) { ... })(window, document)`.
- Exposes `window.Intellectir` with 8 sub-modules:
  1. `ToastModule`: Toast display and auto-dismiss.
  2. `HeaderNavModule`: Mobile drawer and hamburger ARIA toggles.
  3. `ModalModule`: Modal show/hide, focus trap, ESC key, form submit handler.
  4. `DiscoverFilterModule`: Real-time whitepaper search with regex escaping and category pills.
  5. `RoiCalculatorModule`: Real-time range slider and department ROI math.
  6. `AccordionModule`: Accessible collapsible accordions.
  7. `ScrollAnimationModule`: `IntersectionObserver` reveal animations and header scroll contrast.
  8. `InteractiveComponentsModule`: Card 3D tilt, video autoplay observer, proposition tabs, speed-to-lead graph selector, workflow simulator, email form.
- Initialization: `window.Intellectir.init()` on `DOMContentLoaded`.
- Guard convention: Every module checks DOM element presence first (`if (!element) return;`), guaranteeing zero runtime errors on any page.

---

## 2. Logic Chain

1. **Premise 1 (Location & DOM Boundaries)**:
   - `index.html` lines 685–694 currently host a placeholder `<section class="how-we-work-section" id="how-we-work-section">` directly between `#proposition-section` and `#watermark-section` inside `.pitch-black-domain`.
   - Replacing this specific section maintains the existing DOM tree, semantic hierarchy, and smooth scroll layout without touching any other section.

2. **Premise 2 (Zero External Dependencies & Test Stability)**:
   - The project is pure zero-dependency vanilla JS and CSS, validated by 119 automated E2E tests in `test/e2e_runner.js`.
   - Implementing the 2.5D scroll-driven animation using pure vanilla JavaScript (pinned container with CSS 3D transforms, `requestAnimationFrame`, and scroll progress interpolation) guarantees zero npm dependency bloat, maximum performance (60fps), and 100% test suite compatibility.

3. **Premise 3 (Design System & Color Token Integration)**:
   - The user specification in `ORIGINAL_REQUEST.md` requires an ultra-dark background (`#0a0a0c` / `#000000`) and 4 neon accent phase nodes:
     - Phase 1 (Discovery): Neon Green / Emerald (`#10b981` / `#00ffaa`)
     - Phase 2 (Building): Electric Blue / Cyan (`#3b82f6` / `#00d2ff`)
     - Phase 3 (Integrating): Neon Purple / Violet (`#a855f7` / `#8b5cf6`)
     - Phase 4 (Maintenance): Neon Amber / Gold (`#f59e0b` / `#fbbf24`)
   - These colors harmonize directly with the `:root` tokens in `styles.css` and the `.pitch-black-domain` background.

4. **Premise 4 (Modular JavaScript Extension)**:
   - In `app.js`, a new `HowWeWorkModule` can be cleanly integrated into `window.Intellectir` following the established guard pattern (`if (!document.getElementById('how-we-work-section')) return;`).
   - This ensures full isolation: `how-we-work` functionality executes on `index.html` while having zero impact on `company.html`, `discover.html`, `industries.html`, and `solutions.html`.

5. **Premise 5 (E2E Test Invariants)**:
   - Existing E2E tests in `test_tier1_features.js`, `test_tier2_boundary.js`, `test_tier3_pairwise.js`, and `test_tier4_workloads.js` verify header navigation, modal dialogs, consultation booking, contrast ratios, and route status codes.
   - Any consultation buttons or links inside the "How We Work" mockups must use `data-modal-target="demo-modal"` or `open-modal-btn` to seamlessly hook into `ModalModule`.

---

## 3. Caveats

1. **No External Library CDN**: The project does not currently import GSAP, ScrollTrigger, or Three.js. The implementation should rely on pure vanilla JS/CSS 3D transforms (`perspective`, `transform: translate3d(...) scale(...)`, `preserve-3d`) or Canvas 2D API for 60fps performance without introducing external CDN dependencies that might fail offline or during automated testing.
2. **Scroll Lock vs Fluid Scroll**: The scroll animation for the 2.5D quadrant camera movement must be implemented using a pinned container (`position: sticky` inside a multi-viewport scroll track, e.g. `height: 400vh` or `500vh`) rather than hijacking window scroll events (`wheel` preventDefault), ensuring native smooth scrolling on trackpads, touch devices, and keyboards.
3. **Mobile & Tablet Fallback**: On mobile viewports (<768px) and small tablets (<992px), deep 2.5D spatial camera panning can cause high cognitive load or clipping on small screens. A responsive layout mode (vertical sequential accordion/stepper or horizontal swipe cards) should activate via CSS media queries while retaining all interactive UI mockups and neon styling.
4. **Git Repository Status**: The working directory is in OneDrive sync folder. All file changes must be written cleanly within project boundaries and committed to Git.

---

## 4. Conclusion & Architectural Integration Blueprint

### 4.1 Integration Architecture Summary

| Component | Target File | Line Insertion Range | Strategy |
| :--- | :--- | :--- | :--- |
| **HTML Markup** | `index.html` | Lines 685–694 | Replace `<section class="how-we-work-section">` placeholder with full pinned-scroll container, 2.5D canvas / quadrant viewport, 4 phase cards, corner nodes, and 4 interactive UI mockups. |
| **CSS Styles** | `styles.css` | Lines 3434–3446 | Replace placeholder rules with complete scoped `.how-we-work-section` styling (spatial perspective, camera transforms, glassmorphic HUD cards, neon glows, responsive media queries). |
| **JS Controller** | `app.js` | Module 9 & Init block | Add `HowWeWorkModule` with scroll progress tracker, camera matrix interpolator, quadrant active state toggles, and UI mockup micro-interactions. |
| **Modal & Toast Hook** | `index.html` & `app.js` | Section CTAs | Attach `data-modal-target="demo-modal"` to all booking triggers for 100% modal integration. |

### 4.2 Exact Verbatim Content to Insert

```markdown
- Section Title: "How we work"
- Phase 1: Discovery Call
  * Description: "We get on a call with you so you can explain to us what problems you are facing and what outcomes you want."
  * Key Points:
    - Vent to us about your problems
    - Clear understanding of your operating systems
    - Credential Handover
    - 40% upfront payment
  * Neon Accent: Green (#10b981) | Quadrant: Top-Left

- Phase 2: Building Phase
  * Description: "We build the systems designed specifically for your needs, and blends into your operating system"
  * Key Points:
    - Takes from 1 - 4 weeks depending on the case
    - Live dashboard so you can track progress
    - Engineering state-of-the-art architecture
  * Neon Accent: Blue (#3b82f6) | Quadrant: Top-Right

- Phase 3: Integrating phase
  * Description: "We plug your new intelligent system into your company's existing tools, softwares, databases and operational setup"
  * Key Points:
    - Documentation so your entire team can understand how system works
    - Final Testing
    - 60% final payment
  * Neon Accent: Purple (#a855f7) | Quadrant: Bottom-Left

- Phase 4: Maintenance
  * Description: "We do not just integrate the system and leave you stranded if anything changes in your business, we constantly maintain it for optimal functionality."
  * Key Points:
    - Optional, we charge monthly retainer after opted for
    - Real time system updates, agent training and optimization
    - System exponentially improves and delivers exceptional results
  * Neon Accent: Amber/Yellow (#f59e0b) | Quadrant: Bottom-Right
```

### 4.3 2.5D Camera Keyframe Sequence Spec
1. **Scroll 0.00 – 0.15 (Stage 0: Ecosystem Frame)**: Centered camera (`scale(1)`, `translate(0, 0)`), 4 glowing corner node tags (`Discovery`, `Building`, `Integrating`, `Maintenance`), section header visible.
2. **Scroll 0.15 – 0.35 (Stage 1: Phase 1 Zoom)**: Camera pans top-left (`scale(1.8 - 2.2)`, `translate(25%, 25%)`), Phase 1 card and Intake/Credential Vault HUD illuminate with green neon glow.
3. **Scroll 0.35 – 0.55 (Stage 2: Phase 2 Zoom)**: Camera pans top-right (`scale(1.8 - 2.2)`, `translate(-25%, 25%)`), Phase 2 card and 1-4 Weeks Build Telemetry HUD illuminate with blue neon glow.
4. **Scroll 0.55 – 0.75 (Stage 3: Phase 3 Zoom)**: Camera pans bottom-left (`scale(1.8 - 2.2)`, `translate(25%, -25%)`), Phase 3 card and Integration Hub & Testing QA HUD illuminate with purple neon glow.
5. **Scroll 0.75 – 0.90 (Stage 4: Phase 4 Zoom)**: Camera pans bottom-right (`scale(1.8 - 2.2)`, `translate(-25%, -25%)`), Phase 4 card and Retainer/Model Training Loop HUD illuminate with amber neon glow.
6. **Scroll 0.90 – 1.00 (Stage 5: Final Overview)**: Camera zooms back to full overview (`scale(1)`, `translate(0, 0)`), all 4 quadrants connected with pulsing neon energy lines.

---

## 5. Verification Method

To independently verify this codebase survey and the subsequent implementation:

1. **Verify Existing Server & Test Suite**:
   ```powershell
   node test/e2e_runner.js
   ```
   *Expected Output*: 119/119 tests pass across all 27 suites.

2. **Verify HTML DOM Insertion Point**:
   ```powershell
   Select-String -Path "index.html" -Pattern "how-we-work-section"
   ```
   *Expected Output*: Match at line 685 inside `<div class="pitch-black-domain">`.

3. **Verify CSS Rules**:
   ```powershell
   Select-String -Path "styles.css" -Pattern "how-we-work-section"
   ```
   *Expected Output*: Match at line 3435.

4. **Verify JavaScript Modules**:
   ```powershell
   Select-String -Path "app.js" -Pattern "window.Intellectir"
   ```
   *Expected Output*: Match at line 988.

5. **Invalidation Conditions**:
   - If any change breaks existing navigation, modals, or test assertions in `test/test_tier1_features.js` to `test_tier4_workloads.js`.
   - If horizontal overflow is introduced (`overflow-x` causing unwanted scrollbars).
   - If verbatim copy deviates from `ORIGINAL_REQUEST.md` §3.
