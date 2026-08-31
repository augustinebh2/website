# Project: Intellectir How.mp4 Alignment & Test Reconciliation

## Architecture
- `index.html`, `styles.css`, `app.js`: Web application frontend with updated How We Work 4-phase layout matching how.mp4:
  * Top-Right (Green #10b981): Phase 1 Discovery Call
  * Top-Left (Blue #3b82f6): Phase 2 Building Phase
  * Bottom-Left (Pink #ec4899): Phase 3 Integrating Phase
  * Bottom-Right (Yellow #f59e0b): Phase 4 Maintenance
- `test/test_how_we_work_e2e.js`: E2E test suite asserting on How We Work section structure, corner mappings, colors, and interactive behaviors.
- `test/e2e_runner.js`: Test runner executing the comprehensive suite (309 tests total).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Corner Mapping Reconciliation | Update corner expectations: TR=Phase 1, TL=Phase 2, BL=Phase 3, BR=Phase 4 | M1 | User Request |
| 2 | Color Token & Style Assertions | Assert pink accent #ec4899 for Phase 3 Integrating Phase | M1 | User Request |
| 3 | Full Test Suite Execution | Execute node test/e2e_runner.js ensuring 309/309 pass | M1 | User Request |
| 4 | Git Clean Commit | Stage all changes and commit cleanly to git | M1 | User Request |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Test Reconciliation & Git Commit | Update test_how_we_work_e2e.js, verify e2e_runner.js (309/309 pass), and git commit | none | IN_PROGRESS |

## Code Layout
- `test/test_how_we_work_e2e.js` (Owned by Worker for M1)
