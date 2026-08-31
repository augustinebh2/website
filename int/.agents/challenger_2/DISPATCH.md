# Task Dispatch: Challenger 2 (Adversarial Client-Side UI/UX & Interactivity Hardening)

Project Root: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web
Working Directory: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\challenger_2
Original Request: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\ORIGINAL_REQUEST.md
Project Specification: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\PROJECT.md

## Scope
Perform white-box adversarial stress testing against client HTML/CSS/JS components (`index.html`, `company.html`, `discover.html`, `industries.html`, `solutions.html`, `styles.css`, `app.js`):
1. Test Discover search input with rapid keystrokes, malicious regex patterns, script injection strings, and category switching state machine.
2. Test ROI calculator with extreme slider boundary values (negative, zero, floating point, NaN, huge numbers).
3. Test Mobile Navigation drawer toggling, rapid click spamming, ESC key handling, and resize boundary transitions.
4. Test Modal dialog keyboard focus trapping, multiple triggers, and toast dismiss race conditions.
5. Test WCAG 2.1 AA color contrast formulas on all interactive states (hover, focus, active).
6. Create a standalone test script in your directory, execute it, write `handoff.md` with your verdict (PASS / FAIL), and message parent.

## 2026-08-24T12:27:25Z
OBJECTIVE:
Empirically stress-test client-side markup, styling, and interactivity (`styles.css`, `app.js`, HTML pages):
1. Search input filtering with regex metacharacters, HTML injection, rapid inputs.
2. ROI calculator boundary stress (negative numbers, extreme bounds, NaN inputs).
3. Mobile drawer and modal keyboard focus trapping, ESC key dismiss, backdrop clicks.
4. WCAG 2.1 AA color contrast formulas on buttons, badges, and card text.
5. Output standalone verification script in your working directory, run it, document findings and your verdict (PASS / FAIL) in `handoff.md`, and message the parent orchestrator.
