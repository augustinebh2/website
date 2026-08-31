## 2026-08-31T16:02:04Z

<USER_REQUEST>
You are the Primary Lead Worker for the Intellectir website project refinement.

Working Directory: C:\Users\Augustine Jr\OneDrive - University of Cape Town\int\int
Read `C:\Users\Augustine Jr\OneDrive - University of Cape Town\int\int\ORIGINAL_REQUEST.md`.
Read Explorer findings at:
- `C:\Users\Augustine Jr\OneDrive - University of Cape Town\int\int\.agents\explorer_1\handoff.md` (DOM & Architecture)
- `C:\Users\Augustine Jr\OneDrive - University of Cape Town\int\int\.agents\explorer_2\handoff.md` (Animation & Motion engine)
- `C:\Users\Augustine Jr\OneDrive - University of Cape Town\int\int\.agents\explorer_3\handoff.md` (Test matrix & verification)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

YOUR EXACT TASKS:
1. `index.html`:
   - Connecting Border Lines HUD Setup: Clean rectangular border frame (`border: 1px solid rgba(255,255,255,0.12)`) enclosing center viewport with connecting line rays.
   - 4 Corner Nodes in `.hww-hud-overlay`:
     * Top-Right (Green #10b981): `01` `Phase 1: Discovery Call` (`.corner-tr[data-corner="discovery"]`)
     * Top-Left (Blue #3b82f6): `02` `Phase 2: Building Phase` (`.corner-tl[data-corner="building"]`)
     * Bottom-Left (Pink/Red #ec4899): `03` `Phase 3: Integrating Phase` (`.corner-bl[data-corner="integrating"]`)
     * Bottom-Right (Yellow/Gold #f59e0b): `04` `Phase 4: Maintenance` (`.corner-br[data-corner="maintenance"]`)
   - Center Title (Initial & Outro View):
     * Initial stage: Headline `"How we work"` centered inside the box.
     * Final Overview stage (Zoom-Out): Title updates to `"The Intellectir Platform"` with `"Explore Our Solutions ?"` CTA button centered linking to solutions.
   - 4 Quadrant Cards in `#hww-spatial-canvas`:
     * Arrange layout so Graphic Mockup is on the LEFT and Text Card is on the RIGHT.
     * Card 1 (Top-Right): Discovery Call - Left Mockup (Client Intake, OS Diagnosis, Credential Key Exchange, 40% upfront chip); Right Card (Green `01` tag, Title "Phase 1: Discovery Call", description, bullet points: Vent about problems, Operating system analysis, Credential Handover, 40% upfront payment).
     * Card 2 (Top-Left): Building Phase - Left Mockup (1-4 Weeks build progress bar, Live Telemetry Dashboard, AI Architecture node diagram); Right Card (Blue `02` tag, Title "Phase 2: Building Phase", description, bullet points: 1-4 weeks delivery, Live progress tracking dashboard, State-of-the-art architecture).
     * Card 3 (Bottom-Left): Integrating Phase - Left Mockup (Integrations Hub, Team Documentation preview, Final Testing badge, 60% final payment verification); Right Card (Pink `03` tag, Title "Phase 3: Integrating Phase", description, bullet points: Plug into existing tools/software/databases/ops, Documentation for team, Final Testing, 60% final payment).
     * Card 4 (Bottom-Right): Maintenance - Left Mockup (Real-time agent training loop, Monthly Retainer toggle, System optimization metrics); Right Card (Gold `04` tag, Title "Phase 4: Maintenance", description, bullet points: Optional monthly retainer, Real time system updates & agent training, Exponential improvement).

2. `styles.css`:
   - HUD Frame: `border: 1px solid rgba(255,255,255,0.12)`, connecting border lines/rays, glowing corner badges with accurate hex color tokens (`#10b981`, `#3b82f6`, `#ec4899`, `#f59e0b`).
   - Spatial canvas & card layout: Left mockup + right content (`grid-template-columns: 1.15fr 1fr` or similar), smooth animations, ambient glows, responsive mobile reflow (`@media (max-width: 992px)`), and `@media (prefers-reduced-motion: reduce)` accessibility.

3. `app.js`:
   - Motion engine coordinates: Update `CAMERA_ANCHORS` to TR `[-24, +24]` (Stage 1), TL `[+24, +24]` (Stage 2), BL `[+24, -24]` (Stage 3), BR `[-24, -24]` (Stage 4), Zoom-out `[0, 0]` (Stage 5 / Stage 0).
   - Smoothstep keyframe interpolation, LERP loop, active stage card opacity/visibility updates, and title / CTA button state switching.

4. Test Suites (`test/test_how_we_work_e2e.js`, `test/test_tier5_adversarial.js`, etc.):
   - Update assertions to align with the new 4-corner node locations (TR=Discovery, TL=Building, BL=Integrating, BR=Maintenance), `#ec4899` pink/red accent, left-mockup / right-text card DOM hierarchy, and "The Intellectir Platform" CTA.
   - Run `node test/e2e_runner.js` to ensure 100% test pass.

5. Git & Verification:
   - Run git commands to verify status and commit all changes cleanly on `main`.

Write your full report to `.agents/worker_1/handoff.md` and send a message back to the orchestrator with test results.
</USER_REQUEST>
