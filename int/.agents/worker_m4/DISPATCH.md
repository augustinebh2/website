## 2026-08-24T12:18:42Z
You are Worker M4 (Milestone 4: JavaScript & Interactivity Refactor).
Your working directory is: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\worker_m4
Project root: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web
Original request path: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\ORIGINAL_REQUEST.md
Project specification: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\PROJECT.md
Dispatch file: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\worker_m4\DISPATCH.md

You exclusively own:
- c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\app.js

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

OBJECTIVE:
1. Refactor `app.js` into modular namespaces/controllers:
   - HeaderNavModule: mobile hamburger `#nav-toggle` toggle, `.site-navigation.is-open`, `aria-expanded` synchronization, close on outside click / ESC.
   - ModalModule: Consultation modal `#demo-modal` open/close, focus trapping, ESC key listener, `#modal-consultation-form` submit handler triggering toast.
   - ToastModule: `#toast` notification display and auto-dismiss timer.
   - DiscoverFilterModule: `#discover-search-input` with regex escaping, category pills (`.filter-pill`), real-time card filtering.
   - RoiCalculatorModule: `#team-size-slider`, department buttons (`.dept-btn`), real-time calculation of `#roi-hours-saved`, `#roi-annual-savings`, `#roi-efficiency-gain`.
   - AccordionModule: `.minimal-accordion-item` blueprint accordion toggling with `aria-expanded`.
   - ScrollAnimationModule: `IntersectionObserver` reveal animations, header scroll contrast class with throttled scroll listener.
2. Safe DOM Element Existence Guards:
   - Ensure every module checks for its DOM elements before querying or adding listeners so `app.js` runs with ZERO console errors across all 5 pages (`index.html`, `company.html`, `discover.html`, `industries.html`, `solutions.html`).
3. Performance:
   - Purge dead code (infinite `requestAnimationFrame` loop on legacy `#canvas-world`/`#how-we-work`, unneeded event listeners).
   - Throttled/debounced scroll and resize events.
4. Verify against `node test/e2e_runner.js`, document changes in `handoff.md`, and send a completion message back.
