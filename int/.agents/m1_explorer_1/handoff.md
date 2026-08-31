# Milestone 1 Handoff Report: DOM Structure & Semantic Architecture

**Agent**: `m1_explorer_1` (DOM Structure & Semantic Architecture Explorer)  
**Parent Orchestrator**: `73bb2733-41b4-4149-a1f3-40ec396cfadd`  
**Date**: 2026-08-31  
**Working Directory**: `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/.agents/m1_explorer_1`  
**Target File**: `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/index.html` (Lines 685–694)  

---

## 1. Observation

### 1.1 Existing Placeholder in `index.html`
Lines 684–695 of `index.html` currently contain a static reserved space:
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

### 1.2 Verbatim Copy Specifications (`ORIGINAL_REQUEST.md` §3)
- **Section Title**: "How we work" / "How We Work"
- **Eyebrow Tag**: `<span class="subhead-tag"><i class="fa-solid fa-diagram-project"></i> METHODOLOGY</span>`
- **Section Lead**: "Our structured end-to-end framework for auditing, architecting, and deploying custom AI agents into your business operations."
- **Phase 1: Discovery Call**
  - Description: "We get on a call with you so you can explain to us what problems you are facing and what outcomes you want."
  - Key Points:
    1. Vent to us about your problems
    2. Clear understanding of your operating systems
    3. Credential Handover
    4. 40% upfront payment
- **Phase 2: Building Phase**
  - Description: "We build the systems designed specifically for your needs, and blends into your operating system"
  - Key Points:
    1. Takes from 1 - 4 weeks depending on the case
    2. Live dashboard so you can track progress
    3. Engineering state-of-the-art architecture
- **Phase 3: Integrating phase**
  - Description: "We plug your new intelligent system into your company's existing tools, softwares, databases and operational setup"
  - Key Points:
    1. Documentation so your entire team can understand how system works
    2. Final Testing
    3. 60% final payment
- **Phase 4: Maintenance**
  - Description: "We do not just integrate the system and leave you stranded if anything changes in your business, we constantly maintain it for optimal functionality."
  - Key Points:
    1. Optional, we charge monthly retainer after opted for
    2. Real time system updates, agent training and optimization
    3. System exponentially improves and delivers exceptional results

### 1.3 2.5D Canvas Architecture & HUD Requirements (`PROJECT.md` & `ORIGINAL_REQUEST.md` §4)
- **Theme**: Ultra-dark background (`#0a0a0c`), glassmorphic dark card containers with neon accent indicators:
  - Green (`#10b981`) -> Discovery (Top-Left)
  - Blue (`#3b82f6`) -> Building (Top-Right)
  - Purple (`#a855f7`) -> Integrating (Bottom-Left)
  - Yellow (`#f59e0b`) -> Maintenance (Bottom-Right)
- **HUD Boundary Tags**: 4 fixed corner tags (`Discovery`, `Building`, `Integrating`, `Maintenance`).
- **Interactive UI Mockups**:
  - Phase 1: Client Intake & Credential Exchange Vault UI (`40% Secured`).
  - Phase 2: 1–4 Weeks Build Progress & Telemetry Terminal UI (`Sprint W2 // On Schedule`).
  - Phase 3: Software & DB Integrations Hub + Final Testing QA UI (`60% Final Release`).
  - Phase 4: Agent Health Retainer & Model RLHF Training Loop UI (`Active Retainer`).
- **Interactive Phase Scrubber**: 4 pill buttons (`data-hww-goto="1|2|3|4"`) with connecting progress line.
- **Contract Selectors**:
  - `#how-we-work-section`
  - `.hww-track[data-hww-track]`
  - `.hww-sticky-viewport` / `.hww-viewport`
  - `.hww-spatial-canvas[data-hww-canvas]` / `.hww-canvas`
  - `.hww-corner-tag[data-corner="discovery|building|integrating|maintenance"]`
  - `.hww-quadrant-card[data-quadrant="1|2|3|4"]`
  - `.hww-nav-pills button[data-hww-goto="1|2|3|4"]`

---

## 2. Logic Chain

1. **Step 1 (Structural Hierarchy)**: The component must support multi-screen pinned scroll mechanics while maintaining standard document flow. A parent `#how-we-work-section` containing a tall `.hww-track` (e.g. `height: 500vh` in CSS) with an inner `position: sticky` `.hww-sticky-viewport` guarantees smooth scroll camera tracking without causing document layout shifting.
2. **Step 2 (HUD Corner Anchors)**: Fixed corner tags are placed inside the sticky viewport layer outside the transformed 2.5D spatial canvas so they stay firmly pinned to the screen viewport boundaries during camera zoom and pan maneuvers.
3. **Step 3 (Spatial Coordinate System)**: The `.hww-spatial-canvas` houses the central intro frame at origin `(0, 0)` and 4 quadrant cards arranged in a 2x2 grid `(-X, -Y)`, `(+X, -Y)`, `(-X, +Y)`, `(+X, +Y)`. This directly matches the 5-stage camera choreography:
   - Stage 0: Centered overview `(scale: 1, x: 0, y: 0)`
   - Stage 1: Quadrant 1 focus (Discovery)
   - Stage 2: Quadrant 2 focus (Building)
   - Stage 3: Quadrant 3 focus (Integrating)
   - Stage 4: Quadrant 4 focus (Maintenance)
   - Stage 5: Overview ecosystem zoom-out
4. **Step 4 (High-Fidelity Mockup Embeds)**: Each quadrant card contains a structured, accessible UI mockup container simulating real-time enterprise AI tooling (Audio waveform stream, API credential vault, live agent compilation terminal, multi-database connector matrix, and 24/7 RLHF health telemetry).
5. **Step 5 (Direct Scrubber Navigation)**: A top/bottom navigation bar with 4 interactive pill buttons (`data-hww-goto="1|2|3|4"`) ensures users can jump directly to any phase via click or keyboard interaction, satisfying both mouse-wheel and keyboard accessibility requirements.
6. **Step 6 (Enterprise Modal Integration)**: Buttons include `data-modal="demo"` and `data-modal-target="demo-modal"`, seamlessly integrating with Intellectir's global consultation booking modal.

---

## 3. Caveats

- **Explorer Role Boundary**: As an Explorer, this agent does not edit `index.html` directly; the complete drop-in HTML replacement is provided below for Milestone 1 implementers.
- **CSS Dependencies**: The spatial positioning (`perspective`, `transform-style: preserve-3d`, sticky pinning, CSS variables `--accent-green`, `--accent-blue`, `--accent-purple`, `--accent-yellow`) will be provided by the CSS styling agent.
- **JS Motion Controller**: Interactive camera interpolation and scrubber state synchronization will be bound by `HowWeWorkModule` in `app.js` during Milestone 2.

---

## 4. Conclusion & Exact HTML Blueprint

### Ready-to-Implement HTML Replacement for `index.html` (Lines 685–694)

```html
            <!-- 5. HOW WE WORK SECTION (2.5D SPATIAL CANVAS & LIFECYCLE METHODOLOGY) -->
            <section class="how-we-work-section" id="how-we-work-section" aria-label="How We Work - Enterprise AI Lifecycle">
                <div class="hww-track" data-hww-track id="hww-track">
                    <div class="hww-sticky-viewport hww-viewport" data-hww-viewport>

                        <!-- HUD High-Tech Grid & Corner Nodes -->
                        <div class="hww-hud-overlay" aria-hidden="true">
                            <div class="hww-hud-border-frame"></div>
                            <div class="hww-hud-crosshair center-crosshair"></div>
                            
                            <!-- 4 Fixed HUD Corner Tags -->
                            <div class="hww-corner-tag corner-tl" data-corner="discovery">
                                <span class="corner-dot dot-green"></span>
                                <div class="corner-text-wrap">
                                    <span class="corner-label">Discovery</span>
                                    <span class="corner-coord">PHASE 01 // 40% UPFRONT</span>
                                </div>
                            </div>

                            <div class="hww-corner-tag corner-tr" data-corner="building">
                                <span class="corner-dot dot-blue"></span>
                                <div class="corner-text-wrap">
                                    <span class="corner-label">Building</span>
                                    <span class="corner-coord">PHASE 02 // 1–4 WEEKS</span>
                                </div>
                            </div>

                            <div class="hww-corner-tag corner-bl" data-corner="integrating">
                                <span class="corner-dot dot-purple"></span>
                                <div class="corner-text-wrap">
                                    <span class="corner-label">Integrating</span>
                                    <span class="corner-coord">PHASE 03 // 60% FINAL</span>
                                </div>
                            </div>

                            <div class="hww-corner-tag corner-br" data-corner="maintenance">
                                <span class="corner-dot dot-yellow"></span>
                                <div class="corner-text-wrap">
                                    <span class="corner-label">Maintenance</span>
                                    <span class="corner-coord">PHASE 04 // 24/7 OPT</span>
                                </div>
                            </div>
                        </div>

                        <!-- Phase Quick-Nav Scrubber Pills -->
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
                                    <span class="pill-dot dot-purple"></span>
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

                        <!-- 2.5D Spatial Canvas (Camera Pan & Zoom Container) -->
                        <div class="hww-spatial-canvas hww-canvas" data-hww-canvas id="hww-spatial-canvas">

                            <!-- Central Intro Frame (Stage 0 Focus) -->
                            <div class="hww-intro-frame" id="hww-intro-frame">
                                <div class="hww-intro-content center">
                                    <span class="subhead-tag"><i class="fa-solid fa-diagram-project"></i> METHODOLOGY</span>
                                    <h2 class="section-title text-white">How We Work</h2>
                                    <p class="section-lead text-white-muted">Our structured end-to-end framework for auditing, architecting, and deploying custom AI agents into your business operations.</p>
                                    <div class="hww-scroll-indicator" aria-hidden="true">
                                        <span class="scroll-mouse"><i class="fa-solid fa-arrow-down-long"></i></span>
                                        <span class="scroll-label">Scroll to explore our 4-phase deployment lifecycle</span>
                                    </div>
                                </div>
                            </div>

                            <!-- QUADRANT 1: TOP-LEFT — PHASE 1: DISCOVERY CALL -->
                            <article class="hww-quadrant-card hww-q1 card-discovery" data-quadrant="1" id="hww-phase-1">
                                <div class="hww-card-inner">
                                    <div class="hww-card-content">
                                        <div class="hww-phase-badge badge-green">
                                            <i class="fa-solid fa-phone-volume"></i>
                                            <span>PHASE 01</span>
                                        </div>
                                        <h3 class="hww-phase-title">Discovery Call</h3>
                                        <p class="hww-phase-description">We get on a call with you so you can explain to us what problems you are facing and what outcomes you want.</p>
                                        
                                        <div class="hww-points-box">
                                            <h4 class="hww-points-heading">Key Deliverables:</h4>
                                            <ul class="hww-points-list">
                                                <li>
                                                    <span class="point-icon green"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">Vent to us about your problems</span>
                                                </li>
                                                <li>
                                                    <span class="point-icon green"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">Clear understanding of your operating systems</span>
                                                </li>
                                                <li>
                                                    <span class="point-icon green"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">Credential Handover</span>
                                                </li>
                                                <li>
                                                    <span class="point-icon green"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">40% upfront payment</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <!-- Interactive UI Mockup: Client Intake & Credential Vault -->
                                    <div class="hww-card-mockup">
                                        <div class="hww-mockup-window mockup-discovery">
                                            <div class="mockup-header-bar">
                                                <div class="mockup-controls">
                                                    <span class="control-dot red"></span>
                                                    <span class="control-dot yellow"></span>
                                                    <span class="control-dot green"></span>
                                                </div>
                                                <div class="mockup-window-title"><i class="fa-solid fa-shield-halved"></i> Intake &amp; Security Vault</div>
                                                <span class="mockup-chip chip-green">40% Escrow Secured</span>
                                            </div>
                                            <div class="mockup-screen-body">
                                                <div class="mockup-stream-card">
                                                    <div class="stream-title-row">
                                                        <span class="stream-icon-pulse"><i class="fa-solid fa-waveform-lines"></i></span>
                                                        <span class="stream-label">Operational Intake Stream</span>
                                                        <span class="stream-status live">RECORDING</span>
                                                    </div>
                                                    <div class="stream-log-items">
                                                        <div class="log-item done"><i class="fa-solid fa-check"></i> <span>Operating Systems: CRM / ERP Identified</span></div>
                                                        <div class="log-item done"><i class="fa-solid fa-check"></i> <span>Bottlenecks: 3 High-Latency Workflows Isolated</span></div>
                                                        <div class="log-item done"><i class="fa-solid fa-check"></i> <span>Target ROI: 140 hrs/mo Automation Identified</span></div>
                                                    </div>
                                                </div>
                                                <div class="mockup-vault-card">
                                                    <div class="vault-heading"><i class="fa-solid fa-lock"></i> Zero-Knowledge Credential Handover</div>
                                                    <div class="vault-rows">
                                                        <div class="vault-row">
                                                            <span class="v-label">API_KEY_OPENAI:</span>
                                                            <code class="v-mask">sk-proj-••••••••••••••••••••</code>
                                                            <span class="v-status"><i class="fa-solid fa-key"></i></span>
                                                        </div>
                                                        <div class="vault-row">
                                                            <span class="v-label">DB_CONNECTION:</span>
                                                            <code class="v-mask">postgresql://••••••••••••••••</code>
                                                            <span class="v-status"><i class="fa-solid fa-database"></i></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <!-- QUADRANT 2: TOP-RIGHT — PHASE 2: BUILDING PHASE -->
                            <article class="hww-quadrant-card hww-q2 card-building" data-quadrant="2" id="hww-phase-2">
                                <div class="hww-card-inner">
                                    <div class="hww-card-content">
                                        <div class="hww-phase-badge badge-blue">
                                            <i class="fa-solid fa-laptop-code"></i>
                                            <span>PHASE 02</span>
                                        </div>
                                        <h3 class="hww-phase-title">Building Phase</h3>
                                        <p class="hww-phase-description">We build the systems designed specifically for your needs, and blends into your operating system</p>
                                        
                                        <div class="hww-points-box">
                                            <h4 class="hww-points-heading">Key Deliverables:</h4>
                                            <ul class="hww-points-list">
                                                <li>
                                                    <span class="point-icon blue"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">Takes from 1 - 4 weeks depending on the case</span>
                                                </li>
                                                <li>
                                                    <span class="point-icon blue"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">Live dashboard so you can track progress</span>
                                                </li>
                                                <li>
                                                    <span class="point-icon blue"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">Engineering state-of-the-art architecture</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <!-- Interactive UI Mockup: 1-4 Weeks Build Progress & Telemetry Terminal -->
                                    <div class="hww-card-mockup">
                                        <div class="hww-mockup-window mockup-building">
                                            <div class="mockup-header-bar">
                                                <div class="mockup-controls">
                                                    <span class="control-dot red"></span>
                                                    <span class="control-dot yellow"></span>
                                                    <span class="control-dot green"></span>
                                                </div>
                                                <div class="mockup-window-title"><i class="fa-solid fa-terminal"></i> Architecture Synthesis &amp; Build</div>
                                                <span class="mockup-chip chip-blue">Sprint W2 // Live</span>
                                            </div>
                                            <div class="mockup-screen-body">
                                                <div class="mockup-sprint-bar-box">
                                                    <div class="sprint-info-row">
                                                        <span class="s-title"><i class="fa-solid fa-calendar-week"></i> Build Timeline</span>
                                                        <span class="s-time">1 – 4 Weeks Fast Delivery</span>
                                                    </div>
                                                    <div class="sprint-progress-track">
                                                        <div class="sprint-progress-fill" style="width: 72%;"></div>
                                                    </div>
                                                    <div class="sprint-milestones-row">
                                                        <span class="m-step done">W1: Architecture</span>
                                                        <span class="m-step active">W2: Multi-Agent</span>
                                                        <span class="m-step">W3: Evaluators</span>
                                                        <span class="m-step">W4: Release</span>
                                                    </div>
                                                </div>
                                                <div class="mockup-terminal-box">
                                                    <div class="terminal-line"><span class="t-stamp">[14:02:18]</span> <span class="t-cyan">Agent.Planner</span> synthesized state graph.</div>
                                                    <div class="terminal-line"><span class="t-stamp">[14:02:19]</span> <span class="t-cyan">Agent.Memory</span> Vector embeddings indexed (0.84ms)</div>
                                                    <div class="terminal-line success"><span class="t-stamp">[14:02:21]</span> <span class="t-green">State-of-the-art multi-agent mesh compiled.</span></div>
                                                </div>
                                                <div class="mockup-meta-pills">
                                                    <span class="meta-pill"><i class="fa-solid fa-microchip"></i> 14 Active Nodes</span>
                                                    <span class="meta-pill"><i class="fa-solid fa-gauge-high"></i> 99.8% Test Coverage</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <!-- QUADRANT 3: BOTTOM-LEFT — PHASE 3: INTEGRATING PHASE -->
                            <article class="hww-quadrant-card hww-q3 card-integrating" data-quadrant="3" id="hww-phase-3">
                                <div class="hww-card-inner">
                                    <div class="hww-card-content">
                                        <div class="hww-phase-badge badge-purple">
                                            <i class="fa-solid fa-network-wired"></i>
                                            <span>PHASE 03</span>
                                        </div>
                                        <h3 class="hww-phase-title">Integrating phase</h3>
                                        <p class="hww-phase-description">We plug your new intelligent system into your company's existing tools, softwares, databases and operational setup</p>
                                        
                                        <div class="hww-points-box">
                                            <h4 class="hww-points-heading">Key Deliverables:</h4>
                                            <ul class="hww-points-list">
                                                <li>
                                                    <span class="point-icon purple"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">Documentation so your entire team can understand how system works</span>
                                                </li>
                                                <li>
                                                    <span class="point-icon purple"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">Final Testing</span>
                                                </li>
                                                <li>
                                                    <span class="point-icon purple"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">60% final payment</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <!-- Interactive UI Mockup: Tool/DB Integration Hub & QA Suite -->
                                    <div class="hww-card-mockup">
                                        <div class="hww-mockup-window mockup-integrating">
                                            <div class="mockup-header-bar">
                                                <div class="mockup-controls">
                                                    <span class="control-dot red"></span>
                                                    <span class="control-dot yellow"></span>
                                                    <span class="control-dot green"></span>
                                                </div>
                                                <div class="mockup-window-title"><i class="fa-solid fa-plug-circle-check"></i> Integration Hub &amp; QA</div>
                                                <span class="mockup-chip chip-purple">60% Final Release</span>
                                            </div>
                                            <div class="mockup-screen-body">
                                                <div class="mockup-connectors-grid">
                                                    <div class="connector-item connected">
                                                        <i class="fa-solid fa-database"></i>
                                                        <span class="c-name">PostgreSQL / DW</span>
                                                        <span class="c-dot"></span>
                                                    </div>
                                                    <div class="connector-item connected">
                                                        <i class="fa-brands fa-salesforce"></i>
                                                        <span class="c-name">Salesforce CRM</span>
                                                        <span class="c-dot"></span>
                                                    </div>
                                                    <div class="connector-item connected">
                                                        <i class="fa-brands fa-slack"></i>
                                                        <span class="c-name">Slack / Teams</span>
                                                        <span class="c-dot"></span>
                                                    </div>
                                                    <div class="connector-item connected">
                                                        <i class="fa-solid fa-cloud-arrow-up"></i>
                                                        <span class="c-name">REST APIs / Webhook</span>
                                                        <span class="c-dot"></span>
                                                    </div>
                                                </div>
                                                <div class="mockup-qa-box">
                                                    <div class="qa-header-row">
                                                        <span class="qa-label"><i class="fa-solid fa-clipboard-check"></i> Final QA Test Suite</span>
                                                        <span class="qa-badge-pass">100% Passed (42/42)</span>
                                                    </div>
                                                    <div class="qa-track">
                                                        <div class="qa-fill" style="width: 100%;"></div>
                                                    </div>
                                                </div>
                                                <div class="mockup-docs-bar">
                                                    <i class="fa-solid fa-book-bookmark"></i>
                                                    <span>Interactive Team Documentation &amp; SOP Library Ready</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <!-- QUADRANT 4: BOTTOM-RIGHT — PHASE 4: MAINTENANCE -->
                            <article class="hww-quadrant-card hww-q4 card-maintenance" data-quadrant="4" id="hww-phase-4">
                                <div class="hww-card-inner">
                                    <div class="hww-card-content">
                                        <div class="hww-phase-badge badge-yellow">
                                            <i class="fa-solid fa-arrows-spin"></i>
                                            <span>PHASE 04</span>
                                        </div>
                                        <h3 class="hww-phase-title">Maintenance</h3>
                                        <p class="hww-phase-description">We do not just integrate the system and leave you stranded if anything changes in your business, we constantly maintain it for optimal functionality.</p>
                                        
                                        <div class="hww-points-box">
                                            <h4 class="hww-points-heading">Key Deliverables:</h4>
                                            <ul class="hww-points-list">
                                                <li>
                                                    <span class="point-icon yellow"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">Optional, we charge monthly retainer after opted for</span>
                                                </li>
                                                <li>
                                                    <span class="point-icon yellow"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">Real time system updates, agent training and optimization</span>
                                                </li>
                                                <li>
                                                    <span class="point-icon yellow"><i class="fa-solid fa-circle-check"></i></span>
                                                    <span class="point-text">System exponentially improves and delivers exceptional results</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    <!-- Interactive UI Mockup: 24/7 Real-Time Telemetry & RLHF Loop -->
                                    <div class="hww-card-mockup">
                                        <div class="hww-mockup-window mockup-maintenance">
                                            <div class="mockup-header-bar">
                                                <div class="mockup-controls">
                                                    <span class="control-dot red"></span>
                                                    <span class="control-dot yellow"></span>
                                                    <span class="control-dot green"></span>
                                                </div>
                                                <div class="mockup-window-title"><i class="fa-solid fa-heart-pulse"></i> 24/7 Telemetry &amp; RLHF Loop</div>
                                                <span class="mockup-chip chip-yellow">Active Retainer</span>
                                            </div>
                                            <div class="mockup-screen-body">
                                                <div class="mockup-telemetry-grid">
                                                    <div class="tele-col">
                                                        <span class="tele-name">System Uptime</span>
                                                        <span class="tele-val text-green">99.99%</span>
                                                    </div>
                                                    <div class="tele-col">
                                                        <span class="tele-name">Avg Latency</span>
                                                        <span class="tele-val text-blue">14ms</span>
                                                    </div>
                                                    <div class="tele-col">
                                                        <span class="tele-name">RLHF Weights</span>
                                                        <span class="tele-val text-yellow">v4.8 (Auto)</span>
                                                    </div>
                                                </div>
                                                <div class="mockup-curve-container">
                                                    <div class="curve-header-row">
                                                        <span class="c-title"><i class="fa-solid fa-chart-line-up"></i> Exponential Learning Curve</span>
                                                        <span class="c-gain">+412% Cumulative Efficiency</span>
                                                    </div>
                                                    <div class="curve-bars-visual" aria-hidden="true">
                                                        <div class="c-bar" style="height: 30%;"></div>
                                                        <div class="c-bar" style="height: 48%;"></div>
                                                        <div class="c-bar" style="height: 65%;"></div>
                                                        <div class="c-bar" style="height: 82%;"></div>
                                                        <div class="c-bar peak" style="height: 100%;"></div>
                                                    </div>
                                                </div>
                                                <div class="mockup-optimize-banner">
                                                    <i class="fa-solid fa-sparkles"></i>
                                                    <span>Continuous Agent Fine-Tuning &amp; Drift Guard Active</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>

                        </div> <!-- /.hww-spatial-canvas -->

                        <!-- Bottom Section CTA Trigger -->
                        <div class="hww-cta-bar center">
                            <button type="button" class="btn btn-primary open-modal-btn" data-modal="demo" data-modal-target="demo-modal" aria-label="Book Discovery Call Consultation">
                                <span>Schedule Your Discovery Call</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>

                    </div> <!-- /.hww-sticky-viewport -->
                </div> <!-- /.hww-track -->
            </section>
```

---

## 5. Verification Method

To verify the HTML blueprint against the codebase contract:

1. **Tag & Hierarchy Verification**:
   - Check presence of `#how-we-work-section.how-we-work-section`
   - Check `.hww-track[data-hww-track]`
   - Check `.hww-sticky-viewport`
   - Check `.hww-spatial-canvas[data-hww-canvas]`
   - Check 4 corner tags: `.hww-corner-tag[data-corner="discovery"]`, `[data-corner="building"]`, `[data-corner="integrating"]`, `[data-corner="maintenance"]`
   - Check 4 quadrant cards: `.hww-quadrant-card[data-quadrant="1"]`, `[data-quadrant="2"]`, `[data-quadrant="3"]`, `[data-quadrant="4"]`
   - Check scrubber buttons: `button[data-hww-goto="1"]`, `button[data-hww-goto="2"]`, `button[data-hww-goto="3"]`, `button[data-hww-goto="4"]`

2. **Verbatim Content Verification**:
   - Verify all 13 bullet points match `ORIGINAL_REQUEST.md` §3 letter-for-letter.
   - Verify phase titles and descriptions match exactly.
   - Verify modal trigger `data-modal="demo"` and `data-modal-target="demo-modal"` are wired.

3. **Automated Test Suite**:
   - Execute `node test/e2e_runner.js` to ensure zero regressions across all server and page routes.
