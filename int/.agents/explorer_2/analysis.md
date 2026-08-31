# Deep Technical Analysis: How We Work Section Implementation

**Investigated Files**:
- `C:\Users\Augustine Jr\OneDrive - University of Cape Town\int\int\index.html` (Lines 685–1175)
- `C:\Users\Augustine Jr\OneDrive - University of Cape Town\int\int\styles.css` (Lines 3434–4950)
- `C:\Users\Augustine Jr\OneDrive - University of Cape Town\int\int\app.js` (Lines 985–1432)
- `C:\Users\Augustine Jr\OneDrive - University of Cape Town\int\int\test\test_how_we_work_e2e.js` (Lines 1–1387)

---

## 1. Executive Summary

The "How We Work" section in Intellectir is architected as an interactive 2.5D spatial canvas with a 500vh pinned scroll track, a neon HUD overlay frame, fixed corner node boundary tags, a phase quick-nav scrubber, a central intro/platform transition frame, and four interactive quadrant cards with rich UI mockups.

The DOM, CSS, and JS align with the `how.mp4` visual layout:
- **Top-Right (Quadrant 1)**: Phase 1 Discovery Call (Neon Green `#10b981`)
- **Top-Left (Quadrant 2)**: Phase 2 Building Phase (Electric Blue `#3b82f6`)
- **Bottom-Left (Quadrant 3)**: Phase 3 Integrating Phase (Neon Pink `#ec4899`)
- **Bottom-Right (Quadrant 4)**: Phase 4 Maintenance (Neon Yellow/Amber `#f59e0b`)

---

## 2. Complete DOM Hierarchy & Class Inventory (`index.html`)

### 2.1 Section Root & Viewport Canvas Shell
```html
<section class="how-we-work-section" id="how-we-work-section" aria-label="How We Work - Enterprise AI Lifecycle">
    <div class="hww-track" data-hww-track id="hww-track">
        <div class="hww-sticky-viewport hww-viewport" data-hww-viewport>
            <!-- HUD Overlay -->
            <!-- Quick-Nav Scrubber -->
            <!-- 2.5D Spatial Canvas -->
            <!-- CTA Bar -->
        </div>
    </div>
</section>
```

### 2.2 HUD High-Tech Grid & Corner Boundary Nodes (`.hww-hud-overlay`)
- **Border Frame**: `<div class="hww-hud-border-frame"></div>`
- **Connecting Rays**:
  * Top-Left: `<span class="ray-line ray-tl"></span>` (Electric Blue `#3b82f6`)
  * Top-Right: `<span class="ray-line ray-tr"></span>` (Neon Green `#10b981`)
  * Bottom-Left: `<span class="ray-line ray-bl"></span>` (Neon Pink `#ec4899`)
  * Bottom-Right: `<span class="ray-line ray-br"></span>` (Neon Yellow `#f59e0b`)
- **Center Crosshair**: `<div class="hww-hud-crosshair center-crosshair"></div>`
- **4 Fixed HUD Corner Tags**:
  1. **Top-Right (Phase 1 Discovery Call)**:
     ```html
     <div class="hww-corner-tag corner-tr" data-corner="discovery">
         <span class="corner-dot dot-green"></span>
         <div class="corner-text-wrap">
             <span class="corner-label"><span class="corner-num">01</span> Phase 1: Discovery Call</span>
             <span class="corner-coord">PHASE 01 // 40% UPFRONT</span>
         </div>
     </div>
     ```
  2. **Top-Left (Phase 2 Building Phase)**:
     ```html
     <div class="hww-corner-tag corner-tl" data-corner="building">
         <span class="corner-dot dot-blue"></span>
         <div class="corner-text-wrap">
             <span class="corner-label"><span class="corner-num">02</span> Phase 2: Building Phase</span>
             <span class="corner-coord">PHASE 02 // 1–4 WEEKS</span>
         </div>
     </div>
     ```
  3. **Bottom-Left (Phase 3 Integrating Phase)**:
     ```html
     <div class="hww-corner-tag corner-bl" data-corner="integrating">
         <span class="corner-dot dot-pink dot-purple"></span>
         <div class="corner-text-wrap">
             <span class="corner-label"><span class="corner-num">03</span> Phase 3: Integrating Phase</span>
             <span class="corner-coord">PHASE 03 // 60% FINAL</span>
         </div>
     </div>
     ```
  4. **Bottom-Right (Phase 4 Maintenance)**:
     ```html
     <div class="hww-corner-tag corner-br" data-corner="maintenance">
         <span class="corner-dot dot-yellow"></span>
         <div class="corner-text-wrap">
             <span class="corner-label"><span class="corner-num">04</span> Phase 4: Maintenance</span>
             <span class="corner-coord">PHASE 04 // 24/7 OPT</span>
         </div>
     </div>
     ```

### 2.3 Phase Quick-Nav Scrubber (`.hww-nav-scrubber-container`)
```html
<div class="hww-nav-scrubber-container">
    <nav class="hww-nav-pills" aria-label="Phase navigation">
        <div class="hww-scrubber-track">
            <div class="hww-scrubber-progress" id="hww-scrubber-progress"></div>
        </div>
        <button type="button" class="hww-nav-pill active" data-hww-goto="1" aria-label="Navigate to Phase 1: Discovery Call">
            <span class="pill-dot dot-green"></span>
            <span class="pill-num">01</span>
            <span class="pill-title">Discovery</span>
        </button>
        <button type="button" class="hww-nav-pill" data-hww-goto="2" aria-label="Navigate to Phase 2: Building Phase">
            <span class="pill-dot dot-blue"></span>
            <span class="pill-num">02</span>
            <span class="pill-title">Building</span>
        </button>
        <button type="button" class="hww-nav-pill" data-hww-goto="3" aria-label="Navigate to Phase 3: Integrating phase">
            <span class="pill-dot dot-pink dot-purple"></span>
            <span class="pill-num">03</span>
            <span class="pill-title">Integrating</span>
        </button>
        <button type="button" class="hww-nav-pill" data-hww-goto="4" aria-label="Navigate to Phase 4: Maintenance">
            <span class="pill-dot dot-yellow"></span>
            <span class="pill-num">04</span>
            <span class="pill-title">Maintenance</span>
        </button>
    </nav>
</div>
```

### 2.4 Central Platform Frame (`#hww-intro-frame`)
- **Stage 0 Intro**: `<div class="hww-intro-content state-intro center" id="hww-state-intro">`
  * Subhead tag: `<span class="subhead-tag"><i class="fa-solid fa-diagram-project"></i> METHODOLOGY</span>`
  * Heading: `<h2 class="section-title text-white hww-main-title">How we work</h2>`
  * Lead: `<p class="section-lead text-white-muted">Our structured end-to-end framework for auditing, architecting, and deploying custom AI agents into your business operations.</p>`
  * Indicator: `<div class="hww-scroll-indicator" aria-hidden="true"><span class="scroll-mouse"><i class="fa-solid fa-arrow-down-long"></i></span><span class="scroll-label">Scroll to explore our 4-phase deployment lifecycle</span></div>`
- **Stage 5 Outro**: `<div class="hww-intro-content state-platform center" id="hww-state-platform" style="display: none;">`
  * Subhead tag: `<span class="subhead-tag"><i class="fa-solid fa-layer-group"></i> ECOSYSTEM OVERVIEW</span>`
  * Heading: `<h2 class="section-title text-white hww-platform-title">The Intellectir Platform</h2>`
  * CTA: `<a href="solutions.html" class="btn btn-primary hww-explore-btn"><span>Explore Our Solutions &rarr;</span></a>`

### 2.5 Quadrant Cards & Mockups

#### Quadrant 1 (Top-Right): `#hww-phase-1.hww-quadrant-card.hww-q1.card-discovery[data-quadrant="1"]`
- **UI Mockup**: `.hww-mockup-window.mockup-discovery.mockup-p1`
  * Header controls (`.control-dot.red`, `.yellow`, `.green`)
  * Window title: `<i class="fa-solid fa-shield-halved"></i> Intake & Security Vault`
  * Escrow chip: `<span class="mockup-chip chip-green">40% Escrow Secured</span>`
  * Intake audio stream with live waveform (`.wave-bar.wb-1` to `.wb-8`, timer `[42:15]`) and logs:
    - `Operating Systems: CRM / ERP Identified`
    - `Bottlenecks: 3 High-Latency Workflows Isolated`
    - `Target ROI: 140 hrs/mo Automation Identified`
  * Zero-Knowledge Credential Handover (`API_KEY_OPENAI` sk-proj-••••••••••••••••••••, `DB_CONNECTION` postgresql://••••••••••••••••)
  * Milestone footer: `40% Upfront Kickoff Secured` with 40% progress bar (`.p1-fill`)
- **Content Deliverables**:
  * Badge: `.hww-phase-badge.badge-green` ("PHASE 01")
  * Title: `Phase 1: Discovery Call`
  * Description: `We get on a call with you so you can explain to us what problems you are facing and what outcomes you want.`
  * 4 Key Deliverables:
    1. "Vent to us about your problems"
    2. "Clear understanding of your operating systems"
    3. "Credential Handover"
    4. "40% upfront payment"

#### Quadrant 2 (Top-Left): `#hww-phase-2.hww-quadrant-card.hww-q2.card-building[data-quadrant="2"]`
- **UI Mockup**: `.hww-mockup-window.mockup-building.mockup-p2`
  * Header title: `<i class="fa-solid fa-terminal"></i> Architecture Synthesis & Build`
  * Sprint chip: `<span class="mockup-chip chip-blue">Sprint W2 // Live</span>`
  * Build timeline: `1 – 4 Weeks Fast Delivery` (72% progress fill, milestones W1 Setup, W2 Multi-Agent, W3 Evaluators, W4 Release)
  * Terminal telemetry log with blinking cursor (`.term-cursor`)
  * Meta pills: `14 Active Nodes`, `99.8% Test Coverage`
- **Content Deliverables**:
  * Badge: `.hww-phase-badge.badge-blue` ("PHASE 02")
  * Title: `Phase 2: Building Phase`
  * Description: `We build the systems designed specifically for your needs, and blends into your operating system`
  * 3 Key Deliverables:
    1. "Takes from 1 - 4 weeks depending on the case"
    2. "Live dashboard so you can track progress"
    3. "Engineering state-of-the-art architecture"

#### Quadrant 3 (Bottom-Left): `#hww-phase-3.hww-quadrant-card.hww-q3.card-integrating[data-quadrant="3"]`
- **UI Mockup**: `.hww-mockup-window.mockup-integrating.mockup-p3`
  * Header title: `<i class="fa-solid fa-plug-circle-check"></i> Integration Hub & QA`
  * Release chip: `<span class="mockup-chip chip-pink chip-purple">60% Final Release</span>`
  * Connectors grid: PostgreSQL/DW, Salesforce CRM, Slack/Teams, REST APIs/Pinecone
  * QA test suite: `100% Passed (48/48)`
  * Docs bar: `Team Enablement Documentation & SOP Library Ready`
  * Milestone footer: `60% Final Payment & Handover` with 100% progress bar (`.p3-fill`)
- **Content Deliverables**:
  * Badge: `.hww-phase-badge.badge-pink.badge-purple` ("PHASE 03")
  * Title: `Phase 3: Integrating Phase`
  * Description: `We plug your new intelligent system into your company's existing tools, softwares, databases and operational setup`
  * 3 Key Deliverables:
    1. "Documentation so your entire team can understand how system works"
    2. "Final Testing"
    3. "60% final payment"

#### Quadrant 4 (Bottom-Right): `#hww-phase-4.hww-quadrant-card.hww-q4.card-maintenance[data-quadrant="4"]`
- **UI Mockup**: `.hww-mockup-window.mockup-maintenance.mockup-p4`
  * Header title: `<i class="fa-solid fa-heart-pulse"></i> 24/7 Telemetry & RLHF Loop`
  * Retainer chip: `<span class="mockup-chip chip-yellow">Active Retainer</span>`
  * Telemetry vitals: System Uptime `99.99%`, Avg Latency `14ms`, RLHF Weights `v4.8 (Auto)`
  * Exponential learning curve chart with `+412% Compounding` ROI curve svg
  * Fine-tuning banner: `Continuous Fine-Tuning & Drift Guard Active`
- **Content Deliverables**:
  * Badge: `.hww-phase-badge.badge-yellow` ("PHASE 04")
  * Title: `Phase 4: Maintenance`
  * Description: `We do not just integrate the system and leave you stranded if anything changes in your business, we constantly maintain it for optimal functionality.`
  * 3 Key Deliverables:
    1. "Optional, we charge monthly retainer after opted for"
    2. "Real time system updates, agent training and optimization"
    3. "System exponentially improves and delivers exceptional results"

---

## 3. CSS Properties & Design Tokens (`styles.css`)

### 3.1 Scoped Custom Properties
| Property | Value | Role |
|---|---|---|
| `--hww-bg-canvas` | `#0a0a0c` | Canvas backdrop |
| `--hww-card-glass` | `rgba(15, 23, 42, 0.78)` | Card background blur |
| `--hww-card-inner` | `rgba(2, 6, 23, 0.72)` | Mockup inner background |
| `--hww-border-glass` | `rgba(255, 255, 255, 0.12)` | Glass borders |
| `--hww-border-laser` | `rgba(255, 255, 255, 0.15)` | Laser borders |
| `--hww-p1-accent` | `#10b981` | Phase 1 Neon Green |
| `--hww-p1-glow` | `rgba(16, 185, 129, 0.35)` | Phase 1 Glow |
| `--hww-p1-soft` | `rgba(16, 185, 129, 0.12)` | Phase 1 Soft Fill |
| `--hww-p2-accent` | `#3b82f6` | Phase 2 Electric Blue |
| `--hww-p2-glow` | `rgba(59, 130, 246, 0.35)` | Phase 2 Glow |
| `--hww-p2-soft` | `rgba(59, 130, 246, 0.12)` | Phase 2 Soft Fill |
| `--hww-p3-accent` | `#ec4899` | Phase 3 Neon Pink |
| `--hww-p3-glow` | `rgba(236, 72, 153, 0.35)` | Phase 3 Glow |
| `--hww-p3-soft` | `rgba(236, 72, 153, 0.12)` | Phase 3 Soft Fill |
| `--hww-p4-accent` | `#f59e0b` | Phase 4 Neon Yellow |
| `--hww-p4-glow` | `rgba(245, 158, 11, 0.35)` | Phase 4 Glow |
| `--hww-p4-soft` | `rgba(245, 158, 11, 0.12)` | Phase 4 Soft Fill |

### 3.2 2.5D Canvas Grid & Corner Positioning
- Canvas: `display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 2.5rem;`
- **Top-Right (Q1 / Phase 1 Discovery Call)**: `grid-column: 2; grid-row: 1;`
- **Top-Left (Q2 / Phase 2 Building Phase)**: `grid-column: 1; grid-row: 1;`
- **Bottom-Left (Q3 / Phase 3 Integrating Phase)**: `grid-column: 1; grid-row: 2;`
- **Bottom-Right (Q4 / Phase 4 Maintenance)**: `grid-column: 2; grid-row: 2;`

### 3.3 Corner Node Tags CSS
- `.corner-tr`: `top: 38px; right: 38px; flex-direction: row-reverse; text-align: right;`
- `.corner-tl`: `top: 38px; left: 38px;`
- `.corner-bl`: `bottom: 38px; left: 38px;`
- `.corner-br`: `bottom: 38px; right: 38px; flex-direction: row-reverse; text-align: right;`

---

## 4. JavaScript 2.5D Camera Controller & Event Listeners (`app.js`)

### 4.1 Camera Anchors (`CAMERA_ANCHORS`)
```javascript
const CAMERA_ANCHORS = [
    { p: 0.00, scale: 1.00, x: 0,   y: 0,   stage: 0 },
    { p: 0.08, scale: 1.00, x: 0,   y: 0,   stage: 0 },
    { p: 0.25, scale: 1.85, x: -24, y: 24,  stage: 1 }, // Centers Top-Right Quadrant 1
    { p: 0.45, scale: 1.85, x: 24,  y: 24,  stage: 2 }, // Centers Top-Left Quadrant 2
    { p: 0.65, scale: 1.85, x: 24,  y: -24, stage: 3 }, // Centers Bottom-Left Quadrant 3
    { p: 0.825,scale: 1.85, x: -24, y: -24, stage: 4 }, // Centers Bottom-Right Quadrant 4
    { p: 0.95, scale: 1.00, x: 0,   y: 0,   stage: 5 },
    { p: 1.00, scale: 1.00, x: 0,   y: 0,   stage: 5 }
];
```

*Note on Canvas Translation*: To center a quadrant in the viewport:
- Top-Right quadrant requires translating the canvas left (`x: -24%`) and down (`y: +24%`).
- Top-Left quadrant requires translating the canvas right (`x: +24%`) and down (`y: +24%`).
- Bottom-Left quadrant requires translating the canvas right (`x: +24%`) and up (`y: -24%`).
- Bottom-Right quadrant requires translating the canvas left (`x: -24%`) and up (`y: -24%`).

### 4.2 Interactive Event Listeners
1. **Window Scroll**: `window.addEventListener('scroll', onScroll, { passive: true })`
2. **Window Resize**: `window.addEventListener('resize', onResize, { passive: true })`
3. **Scrubber Pill Clicks**: `pill.addEventListener('click', (e) => { scrollToPhase(gotoVal); })`
4. **Intersection Observer**: Observes `#how-we-work-section` to start/stop the RAF loop dynamically.

---

## 5. Test Suite Discrepancies in `test/test_how_we_work_e2e.js`

Running `node test/e2e_runner.js` showed 12 failing tests out of 309 total tests due to outdated test assertions:

| Test ID | Current Test Assumption | Actual `how.mp4` / Codebase Value |
|---|---|---|
| `1.2.6` | Phase 1 quadrant: `'top-left'` | `'top-right'` |
| `1.3.6` | Phase 2 quadrant: `'top-right'` | `'top-left'` |
| `1.4.6` | Phase 3 color: `'purple'` / `#a855f7` | `'pink'` / `#ec4899` |
| `1.6.2` | Discovery corner: `'top-left'` | `'top-right'` |
| `1.6.3` | Building corner: `'top-right'` | `'top-left'` |
| `1.7.3` | Theme token purple: `#a855f7` | `#ec4899` (Pink) |
| `1.10.5` | Mockup 3 accent: `#a855f7` | `#ec4899` (Pink) |
| `1.13.3` | Stage 1 camera target: `s1.x > 0` | `s1.x < 0` (`-25%` / `-24%`) |
| `1.13.4` | Stage 2 camera target: `s2.x < 0` | `s2.x > 0` (`+25%` / `+24%`) |
| `3.3` | Phase 3 scrubber jump hex: `#a855f7` | `#ec4899` |
| `3.13` | Q1 camera offset: `s1.x > 0` | `s1.x < 0` (`-25%`) |
| `3.14` | Q2 camera offset: `s2.x < 0` | `s2.x > 0` (`+25%`) |
