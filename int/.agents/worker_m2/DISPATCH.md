# Task Dispatch: Milestone 2 (CSS Architecture & Global Design System)

Project Root: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web
Working Directory: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\worker_m2
Original Request: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\ORIGINAL_REQUEST.md
Project Specification: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\PROJECT.md
Explorer 2 Report: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\explorer_survey_2\survey_report.md
Explorer 1 Report: c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\.agents\explorer_survey_1\survey_report.md

## Scope & File Ownership
You exclusively own:
- `c:\Users\Augustine Jr\OneDrive - University of Cape Town\int\web\styles.css`

## Mandatory Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Objectives
1. **Design Tokens & Variable Centralization**:
   - Organize `:root` variables:
     - Backgrounds: `--bg-main: #ffffff`, `--bg-secondary: #f8fafc`, `--bg-card: #ffffff`, `--bg-dark: #0f172a`
     - Typography: `--font-sans: 'Inter', system-ui, -apple-system, sans-serif`, `--font-mono: 'JetBrains Mono', monospace`
     - Colors: `--text-primary: #0f172a`, `--text-secondary: #334155`, `--text-muted: #64748b`, `--text-inverse: #ffffff`
     - Accents: `--accent-primary: #2563eb`, `--accent-secondary: #4f46e5`, `--accent-cyan: #0284c7`, `--accent-glow: rgba(37, 99, 235, 0.15)`
     - Gradients: `--gradient-primary: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)`, `--gradient-subtle: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)`
     - Borders & Shadows: `--border-subtle: #e2e8f0`, `--border-card: rgba(226, 232, 240, 0.8)`, `--shadow-sm: 0 1px 3px rgba(0,0,0,0.05)`, `--shadow-card: 0 10px 30px -10px rgba(0,0,0,0.08)`, `--shadow-elevated: 0 20px 40px -15px rgba(0,0,0,0.12)`
     - Spacing & Radii: `--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 16px`, `--radius-full: 9999px`

2. **Purge Orphaned Classes & Style Unstyled Markup Classes**:
   - Purge the 187 orphan classes from legacy Torq UI clone identified by Explorer 1.
   - Implement clean, polished styling for the 82 unstyled classes in the markup (e.g. `.tech-marquee-wrapper`, `.tech-marquee-track`, `.minimal-accordion-item`, `.hud-panel`, `.calc-grid`, `.speed-graph-card`, `.cheat-sheet-table`, `.nav-toggle`, `.nav-drawer`, `.toast`, `.site-footer`).

3. **WCAG 2.1 AA Color Contrast Compliance**:
   - Fix `.btn-primary` to have high-contrast white text (`color: #ffffff !important;`) on blue/indigo gradient (contrast ratio > 5.2:1).
   - Fix badges (`.slider-val-badge`, `.tech-badge`, etc.) so text is crisp and WCAG compliant.
   - Ensure all card text (`.calc-label`, `.card-body`, etc.) has high contrast against card backgrounds.

4. **Consolidate Responsive Media Queries**:
   - Group responsive rules cleanly into standardized breakpoints:
     - `@media (max-width: 1024px)` / `@media (max-width: 992px)`: Desktop to Tablet transitions, multi-column grids convert to 2-column or stacked, header navigation switches to mobile drawer.
     - `@media (max-width: 768px)`: Tablet to Mobile transitions, grids become 1-column, hero typography scales down smoothly, padding reduces.
     - `@media (max-width: 480px)`: Small screen adjustments, full-width buttons, compact cards.
   - Support mobile navigation drawer: `.nav-toggle` button styling and `.site-navigation.is-open` mobile drawer overlay/slide-in styling.

5. **Verification**:
   - Verify CSS validity, zero syntax errors, and responsiveness.
   - Document changes in `handoff.md`.
