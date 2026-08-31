# E2E Test Infra: Intellectir "How We Work" Interactive Component

## Test Philosophy
- Opaque-box, requirement-driven. Derived from `ORIGINAL_REQUEST.md`, `PROJECT.md`, and specifications.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workloads.
- No reliance on internal implementation details; assertions verify user-facing DOM, exact verbatim copy, visual tokens, interaction contracts, and accessibility.

## Feature Inventory & Test Mapping
| # | Feature | Source | Tier 1 (Features) | Tier 2 (Boundary) | Tier 3 (Combinations) | Tier 4 (Real-World) |
|---|---------|--------|:-----------------:|:-----------------:|:--------------------:|:-------------------:|
| 1 | Section Header & Eyebrow | ORIGINAL_REQUEST §3 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 2 | Phase 1 Copy & Badging | ORIGINAL_REQUEST §3 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 3 | Phase 2 Copy & Badging | ORIGINAL_REQUEST §3 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 4 | Phase 3 Copy & Badging | ORIGINAL_REQUEST §3 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 5 | Phase 4 Copy & Badging | ORIGINAL_REQUEST §3 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 6 | 4 Corner Node Tags | ORIGINAL_REQUEST §4 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 7 | Quad-Color Neon Theme | ORIGINAL_REQUEST §4 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 8 | UI Mockup Phase 1 | ORIGINAL_REQUEST §4 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 9 | UI Mockup Phase 2 | ORIGINAL_REQUEST §4 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 10 | UI Mockup Phase 3 | ORIGINAL_REQUEST §4 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 11 | UI Mockup Phase 4 | ORIGINAL_REQUEST §4 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 12 | 2.5D Sticky Scroll Engine | ORIGINAL_REQUEST §4 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 13 | 5-Stage Camera Choreography | ORIGINAL_REQUEST §4 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 14 | Interactive Phase Scrubber | ORIGINAL_REQUEST §4 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 15 | Responsive Adaptation | ORIGINAL_REQUEST §5 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 16 | 60fps & Zero Layout Shift | ORIGINAL_REQUEST §5 | ≥5 tests | ≥5 tests | ✓ | ✓ |
| 17 | Accessibility & Reduced Motion | ORIGINAL_REQUEST §5 | ≥5 tests | ≥5 tests | ✓ | ✓ |

## Test Architecture
- **Master Runner**: `test/e2e_runner.js` (native Node.js, zero dependencies)
- **Execution Command**: `node test/e2e_runner.js`
- **Output Format**: Clean suite-by-suite breakdown with pass/fail counts, summary, and exit code 0 for all green.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Full User Scroll Journey from Hero to Watermark through How We Work | F1–F14, F16 | High |
| 2 | Interactive Scrubber Jump across all 4 Phases with Modal Consultation Trigger | F2–F5, F8–F11, F14 | High |
| 3 | Mobile Device Simulation (375px & 768px Viewports) & Orientation Switch | F1–F7, F15, F16 | High |
| 4 | High-Contrast & Accessibility (`prefers-reduced-motion: reduce`) Compliance | F7, F17 | Medium |
| 5 | Network & DOM Resiliency (Offline / Zero-JS graceful degradation) | F1–F5, F8–F11 | Medium |

## Coverage Thresholds
- **Tier 1 (Feature Coverage)**: ≥5 test cases per feature (Total ≥85 feature tests)
- **Tier 2 (Boundary & Corner)**: ≥5 test cases per feature area (Total ≥50 boundary tests)
- **Tier 3 (Cross-Feature Combinations)**: Pairwise coverage across stages, scrubbers, modals, and screen sizes (Total ≥20 pairwise tests)
- **Tier 4 (Real-World Scenarios)**: ≥5 comprehensive workload end-to-end scenarios (Total ≥10 scenario tests)
- **Total Minimum Test Count**: ≥165+ automated test assertions.
