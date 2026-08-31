## 2026-08-31T15:11:24Z
You are the E2E Test Suite Writer for the Intellectir "How We Work" interactive component.

Working Directory: C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/.agents/test_writer_e2e
Project Root: C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int

MANDATORY INPUTS:
- Read `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/ORIGINAL_REQUEST.md`
- Read `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/PROJECT.md`
- Read `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/TEST_INFRA.md`
- Inspect existing test suites in `test/` (`test_tier1_features.js`, `test_tier2_boundary.js`, `test_tier3_pairwise.js`, `test_tier4_workloads.js`, `e2e_runner.js`).

YOUR TASKS:
1. Author comprehensive automated tests for all 17 features of the "How We Work" component across Tiers 1–4:
   - **Tier 1 (Feature Coverage)**: ≥5 tests per feature (verbatim copy checks for Section title, Phase 1-4 titles, descriptions, and all 4+3+3+3 bullet points; 4 corner tags "Discovery", "Building", "Integrating", "Maintenance"; 4 neon color classes; 4 UI mockups present).
   - **Tier 2 (Boundary & Security)**: Viewport extremes (375px mobile, 768px tablet, 1440px+ desktop), missing/malformed attributes, reduced-motion preferences, XSS/script sanitization in mockups.
   - **Tier 3 (Cross-Feature Combinations)**: Scrubber-to-quadrant syncing, modal trigger integration (`data-modal-target="demo-modal"`), scroll-stage state consistency.
   - **Tier 4 (Real-World Application Scenarios)**: Full DOM inspection, accessibility ARIA roles, contrast assertions, zero broken asset links.
2. Integrate your tests cleanly into `test/` or add a dedicated `test/test_how_we_work_e2e.js` and register it in `test/e2e_runner.js` without breaking any existing tests.
3. Run `node test/e2e_runner.js` to verify test harness execution.
4. When the test suite is complete and ready, generate `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/TEST_READY.md` summarizing the test suite runner and tier breakdown.
5. Write your handoff report to `C:/Users/Augustine Jr/OneDrive - University of Cape Town/int/int/.agents/test_writer_e2e/handoff.md`.
6. Send a completion message to the parent orchestrator.
