## 2026-08-31T15:22:28Z
You are Milestone 2 Worker implementing the 2.5D Motion Engine & Scroll Camera Controller for the Intellectir "How We Work" interactive component.

Working Directory: C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/.agents/m2_worker_1
Project Root: C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int

MANDATORY INPUTS:
- Read `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/ORIGINAL_REQUEST.md`
- Read `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/PROJECT.md`
- Read `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/.agents/explorer_motion_survey/handoff.md`
- Inspect `app.js` (module architecture lines 980–1020) and `test/test_how_we_work_e2e.js`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE WRITE OWNERSHIP:
- `app.js` (implementing `HowWeWorkModule` in `window.Intellectir`)

YOUR TASKS:
1. Implement `HowWeWorkModule` inside `app.js`:
   - Element Guard: `if (!document.getElementById('how-we-work-section')) return;`
   - Scroll Tracking & Pinned Progress: Track scroll within `.hww-track` from progress 0.0 to 1.0.
   - Smooth LERP `requestAnimationFrame` loop: Smooth camera motion (`targetProgress` vs `currentProgress` with easing).
   - 2.5D Camera Matrix Transformations:
     * Stage 0 (0.00 - 0.15): Centered overview frame (`scale(1.0) translate3d(0%, 0%, 0)`)
     * Stage 1 (0.15 - 0.35): Quadrant 1 focus Top-Left (`scale(1.85) translate3d(24%, 24%, 0)`) -> Phase 1 Discovery
     * Stage 2 (0.35 - 0.55): Quadrant 2 focus Top-Right (`scale(1.85) translate3d(-24%, 24%, 0)`) -> Phase 2 Building
     * Stage 3 (0.55 - 0.75): Quadrant 3 focus Bottom-Left (`scale(1.85) translate3d(24%, -24%, 0)`) -> Phase 3 Integrating
     * Stage 4 (0.75 - 0.90): Quadrant 4 focus Bottom-Right (`scale(1.85) translate3d(-24%, -24%, 0)`) -> Phase 4 Maintenance
     * Stage 5 (0.90 - 1.00): Full Ecosystem Overview zoom-out (`scale(1.0) translate3d(0%, 0%, 0)`)
   - Synchronized Visual States:
     * Scrubber pill active classes (`.hww-nav-pill.active`) and progress line width (`#hww-scrubber-progress`).
     * Corner tags active glow classes (`.hww-corner-tag.active[data-corner="..."]`).
     * Quadrant cards active illumination classes (`.hww-quadrant-card.active[data-quadrant="..."]`).
     * Intro frame fade out/in (`#hww-intro-frame.faded`).
   - Interactive Scrubber Click Handling: Clicking a pill button (`[data-hww-goto="1|2|3|4"]`) smoothly scrolls the window to the exact progress offset for that phase.
   - Performance Optimization: Use `IntersectionObserver` to pause the RAF loop when the section is out of the viewport.
   - Accessibility: Respect `@media (prefers-reduced-motion: reduce)` by bypassing 3D camera pan/scale and using simple opacity toggles.
   - Module Export: Expose `window.Intellectir.HowWeWorkModule` with methods `init()`, `getActivePhase()`, `scrollToPhase(phaseIndex)`, and `destroy()`, and initialize it in `window.Intellectir.init()`.
2. Run test runner: `node test/e2e_runner.js` to ensure 100% test pass.
3. Write your handoff report to `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/.agents/m2_worker_1/handoff.md`.
4. Send a completion message to the parent orchestrator.
