# Comprehensive Analysis: How We Work E2E Test Suite Reconciliation

## 1. Executive Summary

An in-depth investigation was conducted across the test suite and source implementation in `C:\Users\Augustine Jr\OneDrive - University of Cape Town\int\int` to audit compliance with the authoritative `how.mp4` layout and design tokens.

### Current Test Execution Baseline:
- **Test Runner**: `node test/e2e_runner.js`
- **Total Test Suites**: 58
- **Total Registered Tests**: 309
- **Current Passing**: 297
- **Current Failing**: 12 (100% of failures reside in `test/test_how_we_work_e2e.js`)
- **Root Cause**: 12 legacy assertions in `test/test_how_we_work_e2e.js` still assume the previous quadrant orientation (Top-Left = Phase 1, Top-Right = Phase 2) and the old purple color token (`#a855f7`), whereas the actual DOM (`index.html`), CSS styling (`styles.css`), and JavaScript camera matrix (`app.js`) have already been updated to the `how.mp4` specification.

---

## 2. Authoritative Ground Truth: `how.mp4` Layout & Color Tokens

The application frontend reflects the following verified quadrant orientation and color palette:

| Phase | Phase Name | Spatial Quadrant | CSS Grid Placement | HUD Tag Class | Indicator Dot | Accent Color Name | Hex Token | Camera Matrix Pan Offset |
|---|---|---|---|---|---|---|---|---|
| **Phase 1** | Discovery Call | **Top-Right** | `grid-column: 2; grid-row: 1;` | `.corner-tr` | `.dot-green` | Green | `#10b981` | `translateX: -24%` / `translateY: +24%` (`x < 0, y > 0`) |
| **Phase 2** | Building Phase | **Top-Left** | `grid-column: 1; grid-row: 1;` | `.corner-tl` | `.dot-blue` | Blue | `#3b82f6` | `translateX: +24%` / `translateY: +24%` (`x > 0, y > 0`) |
| **Phase 3** | Integrating Phase | **Bottom-Left** | `grid-column: 1; grid-row: 2;` | `.corner-bl` | `.dot-pink`, `.dot-purple` | Pink | `#ec4899` | `translateX: +24%` / `translateY: -24%` (`x > 0, y < 0`) |
| **Phase 4** | Maintenance | **Bottom-Right** | `grid-column: 2; grid-row: 2;` | `.corner-br` | `.dot-yellow` | Yellow / Amber | `#f59e0b` | `translateX: -24%` / `translateY: -24%` (`x < 0, y < 0`) |

---

## 3. Test Runner & Discovery Architecture (`test/e2e_runner.js`)

`test/e2e_runner.js` is a zero-dependency automated test runner that auto-discovers all `test_*.js` files in `test/`:
1. `test/test_how_we_work_e2e.js` (How We Work comprehensive 4-tier E2E spec)
2. `test/test_tier1_features.js` (Tier 1 core features & HTTP/1.1 contracts)
3. `test/test_tier2_boundary.js` (Tier 2 boundary, sanitization & viewport extremes)
4. `test/test_tier3_pairwise.js` (Tier 3 combinatorial & pairwise state matrix)
5. `test/test_tier4_workloads.js` (Tier 4 production workloads & latency metrics)
6. `test/test_tier5_adversarial.js` (Tier 5 adversarial stress, DOM contracts & WCAG AAA)

When `test/test_how_we_work_e2e.js` is reconciled, all 6 files will execute with **309/309 tests passing (100%)**.

---

## 4. Itemized Defect Inventory (All 12 Failing Test Assertions)

Below is the complete catalog of all 12 failing test blocks in `test/test_how_we_work_e2e.js`, including line numbers, failure descriptions, and exact proposed code replacements.

---

### Defect 1: Phase 1 Quadrant Assertion (Test 1.2.6)
- **Location**: `test/test_how_we_work_e2e.js:285–290`
- **Current Code**:
  ```javascript
  test('1.2.6: Phase 1 has 4 key points total, mapped to Top-Left quadrant with green accent', () => {
    assert.strictEqual(p1.keyPoints.length, 4);
    assert.strictEqual(p1.quadrant, 'top-left');
    assert.strictEqual(p1.colorName, 'green');
    assert.strictEqual(p1.hexColor, '#10b981');
  });
  ```
- **Error**: `AssertionError: 'top-right' === 'top-left'`
- **Fix**: Update title and assertion to expect `'top-right'`.
- **Proposed Replacement**:
  ```javascript
  test('1.2.6: Phase 1 has 4 key points total, mapped to Top-Right quadrant with green accent', () => {
    assert.strictEqual(p1.keyPoints.length, 4);
    assert.strictEqual(p1.quadrant, 'top-right');
    assert.strictEqual(p1.colorName, 'green');
    assert.strictEqual(p1.hexColor, '#10b981');
  });
  ```

---

### Defect 2: Phase 2 Quadrant Assertion (Test 1.3.6)
- **Location**: `test/test_how_we_work_e2e.js:328–333`
- **Current Code**:
  ```javascript
  test('1.3.6: Phase 2 has 3 key points total, mapped to Top-Right quadrant with blue accent', () => {
    assert.strictEqual(p2.keyPoints.length, 3);
    assert.strictEqual(p2.quadrant, 'top-right');
    assert.strictEqual(p2.colorName, 'blue');
    assert.strictEqual(p2.hexColor, '#3b82f6');
  });
  ```
- **Error**: `AssertionError: 'top-left' === 'top-right'`
- **Fix**: Update title and assertion to expect `'top-left'`.
- **Proposed Replacement**:
  ```javascript
  test('1.3.6: Phase 2 has 3 key points total, mapped to Top-Left quadrant with blue accent', () => {
    assert.strictEqual(p2.keyPoints.length, 3);
    assert.strictEqual(p2.quadrant, 'top-left');
    assert.strictEqual(p2.colorName, 'blue');
    assert.strictEqual(p2.hexColor, '#3b82f6');
  });
  ```

---

### Defect 3: Phase 3 Color Accent Assertion (Test 1.4.6)
- **Location**: `test/test_how_we_work_e2e.js:371–376`
- **Current Code**:
  ```javascript
  test('1.4.6: Phase 3 has 3 key points total, mapped to Bottom-Left quadrant with purple accent', () => {
    assert.strictEqual(p3.keyPoints.length, 3);
    assert.strictEqual(p3.quadrant, 'bottom-left');
    assert.strictEqual(p3.colorName, 'purple');
    assert.strictEqual(p3.hexColor, '#a855f7');
  });
  ```
- **Error**: `AssertionError: 'pink' !== 'purple'`
- **Fix**: Update title to pink accent, assert `colorName` is `'pink'` (or accept `'pink'` / `'purple'`), and assert `hexColor` is `'#ec4899'`.
- **Proposed Replacement**:
  ```javascript
  test('1.4.6: Phase 3 has 3 key points total, mapped to Bottom-Left quadrant with pink accent', () => {
    assert.strictEqual(p3.keyPoints.length, 3);
    assert.strictEqual(p3.quadrant, 'bottom-left');
    assert.strictEqual(p3.colorName, 'pink');
    assert.strictEqual(p3.hexColor, '#ec4899');
  });
  ```

---

### Defect 4: Discovery Corner Tag Spatial Frame (Test 1.6.2)
- **Location**: `test/test_how_we_work_e2e.js:429–433`
- **Current Code**:
  ```javascript
  test('1.6.2: Discovery corner tag corresponds to Top-Left spatial frame', () => {
    const discoveryPhase = HOW_WE_WORK_SPEC.phases.find(p => p.cornerTag === 'Discovery');
    assert.ok(discoveryPhase, 'Discovery corner tag must be defined');
    assert.strictEqual(discoveryPhase.quadrant, 'top-left');
  });
  ```
- **Error**: `AssertionError: 'top-right' === 'top-left'`
- **Fix**: Update title and assertion to expect `'top-right'`.
- **Proposed Replacement**:
  ```javascript
  test('1.6.2: Discovery corner tag corresponds to Top-Right spatial frame', () => {
    const discoveryPhase = HOW_WE_WORK_SPEC.phases.find(p => p.cornerTag === 'Discovery');
    assert.ok(discoveryPhase, 'Discovery corner tag must be defined');
    assert.strictEqual(discoveryPhase.quadrant, 'top-right');
  });
  ```

---

### Defect 5: Building Corner Tag Spatial Frame (Test 1.6.3)
- **Location**: `test/test_how_we_work_e2e.js:435–439`
- **Current Code**:
  ```javascript
  test('1.6.3: Building corner tag corresponds to Top-Right spatial frame', () => {
    const buildingPhase = HOW_WE_WORK_SPEC.phases.find(p => p.cornerTag === 'Building');
    assert.ok(buildingPhase);
    assert.strictEqual(buildingPhase.quadrant, 'top-right');
  });
  ```
- **Error**: `AssertionError: 'top-left' === 'top-right'`
- **Fix**: Update title and assertion to expect `'top-left'`.
- **Proposed Replacement**:
  ```javascript
  test('1.6.3: Building corner tag corresponds to Top-Left spatial frame', () => {
    const buildingPhase = HOW_WE_WORK_SPEC.phases.find(p => p.cornerTag === 'Building');
    assert.ok(buildingPhase);
    assert.strictEqual(buildingPhase.quadrant, 'top-left');
  });
  ```

---

### Defect 6: Integrating Phase Neon Color Token (Test 1.7.3)
- **Location**: `test/test_how_we_work_e2e.js:464–466`
- **Current Code**:
  ```javascript
  test('1.7.3: Neon Purple token (#a855f7) is defined for Integrating phase', () => {
    assert.strictEqual(HOW_WE_WORK_SPEC.themeColors.purple, '#a855f7');
  });
  ```
- **Error**: `AssertionError: '#ec4899' === '#a855f7'`
- **Fix**: Update title to Neon Pink token (`#ec4899`) and assert `HOW_WE_WORK_SPEC.themeColors.pink` is `'#ec4899'`.
- **Proposed Replacement**:
  ```javascript
  test('1.7.3: Neon Pink token (#ec4899) is defined for Integrating phase', () => {
    assert.strictEqual(HOW_WE_WORK_SPEC.themeColors.pink, '#ec4899');
  });
  ```

---

### Defect 7: Mockup 3 Neon Accent Styling (Test 1.10.5)
- **Location**: `test/test_how_we_work_e2e.js:593–596`
- **Current Code**:
  ```javascript
  test('1.10.5: Mockup 3 interface defines purple neon accent styling (#a855f7)', () => {
    const p3 = HOW_WE_WORK_SPEC.phases[2];
    assert.strictEqual(p3.hexColor, '#a855f7');
  });
  ```
- **Error**: `AssertionError: '#ec4899' === '#a855f7'`
- **Fix**: Update title and assert `p3.hexColor === '#ec4899'`.
- **Proposed Replacement**:
  ```javascript
  test('1.10.5: Mockup 3 interface defines pink neon accent styling (#ec4899)', () => {
    const p3 = HOW_WE_WORK_SPEC.phases[2];
    assert.strictEqual(p3.hexColor, '#ec4899');
  });
  ```

---

### Defect 8: Stage 1 Camera Choreography Target (Test 1.13.3)
- **Location**: `test/test_how_we_work_e2e.js:684–689`
- **Current Code**:
  ```javascript
  test('1.13.3: Stage 1 targets Top-Left Quadrant 1 (Discovery Call)', () => {
    const s1 = HOW_WE_WORK_SPEC.stages[1];
    assert.strictEqual(s1.stage, 1);
    assert.strictEqual(s1.target, 'quadrant-1');
    assert.ok(s1.x > 0 && s1.y > 0);
  });
  ```
- **Error**: `AssertionError: assert.ok(s1.x > 0 && s1.y > 0)` failed because `s1.x = -25` (negative X translation).
- **Fix**: Update title to `Top-Right Quadrant 1 (Discovery Call)` and assert `s1.x < 0 && s1.y > 0`.
- **Proposed Replacement**:
  ```javascript
  test('1.13.3: Stage 1 targets Top-Right Quadrant 1 (Discovery Call)', () => {
    const s1 = HOW_WE_WORK_SPEC.stages[1];
    assert.strictEqual(s1.stage, 1);
    assert.strictEqual(s1.target, 'quadrant-1');
    assert.ok(s1.x < 0 && s1.y > 0);
  });
  ```

---

### Defect 9: Stage 2 Camera Choreography Target (Test 1.13.4)
- **Location**: `test/test_how_we_work_e2e.js:691–696`
- **Current Code**:
  ```javascript
  test('1.13.4: Stage 2 targets Top-Right Quadrant 2 (Building Phase)', () => {
    const s2 = HOW_WE_WORK_SPEC.stages[2];
    assert.strictEqual(s2.stage, 2);
    assert.strictEqual(s2.target, 'quadrant-2');
    assert.ok(s2.x < 0 && s2.y > 0);
  });
  ```
- **Error**: `AssertionError: assert.ok(s2.x < 0 && s2.y > 0)` failed because `s2.x = 25` (positive X translation).
- **Fix**: Update title to `Top-Left Quadrant 2 (Building Phase)` and assert `s2.x > 0 && s2.y > 0`.
- **Proposed Replacement**:
  ```javascript
  test('1.13.4: Stage 2 targets Top-Left Quadrant 2 (Building Phase)', () => {
    const s2 = HOW_WE_WORK_SPEC.stages[2];
    assert.strictEqual(s2.stage, 2);
    assert.strictEqual(s2.target, 'quadrant-2');
    assert.ok(s2.x > 0 && s2.y > 0);
  });
  ```

---

### Defect 10: Scrubber Jump to Phase 3 Color Sync (Test 3.3)
- **Location**: `test/test_how_we_work_e2e.js:1090–1096`
- **Current Code**:
  ```javascript
  test('3.3: Scrubber Jump to Phase 3 syncs active quadrant 3 and Integrating tag', () => {
    const stage = 3;
    const activePhase = HOW_WE_WORK_SPEC.phases[stage - 1];
    assert.strictEqual(activePhase.title, 'Integrating phase');
    assert.strictEqual(activePhase.cornerTag, 'Integrating');
    assert.strictEqual(activePhase.hexColor, '#a855f7');
  });
  ```
- **Error**: `AssertionError: '#ec4899' === '#a855f7'`
- **Fix**: Assert `activePhase.hexColor === '#ec4899'`.
- **Proposed Replacement**:
  ```javascript
  test('3.3: Scrubber Jump to Phase 3 syncs active quadrant 3 and Integrating tag', () => {
    const stage = 3;
    const activePhase = HOW_WE_WORK_SPEC.phases[stage - 1];
    assert.strictEqual(activePhase.title, 'Integrating phase');
    assert.strictEqual(activePhase.cornerTag, 'Integrating');
    assert.strictEqual(activePhase.hexColor, '#ec4899');
  });
  ```

---

### Defect 11: Q1 Camera Offset Direction (Test 3.13)
- **Location**: `test/test_how_we_work_e2e.js:1186–1190`
- **Current Code**:
  ```javascript
  test('3.13: Q1 camera offset (+x, +y) centers top-left quadrant on screen', () => {
    const s1 = HOW_WE_WORK_SPEC.stages[1];
    assert.ok(s1.x > 0);
    assert.ok(s1.y > 0);
  });
  ```
- **Error**: `AssertionError: assert.ok(s1.x > 0)` failed because `s1.x = -25`.
- **Fix**: Update title and assert `s1.x < 0` and `s1.y > 0`.
- **Proposed Replacement**:
  ```javascript
  test('3.13: Q1 camera offset (-x, +y) centers top-right quadrant on screen', () => {
    const s1 = HOW_WE_WORK_SPEC.stages[1];
    assert.ok(s1.x < 0);
    assert.ok(s1.y > 0);
  });
  ```

---

### Defect 12: Q2 Camera Offset Direction (Test 3.14)
- **Location**: `test/test_how_we_work_e2e.js:1192–1196`
- **Current Code**:
  ```javascript
  test('3.14: Q2 camera offset (-x, +y) centers top-right quadrant on screen', () => {
    const s2 = HOW_WE_WORK_SPEC.stages[2];
    assert.ok(s2.x < 0);
    assert.ok(s2.y > 0);
  });
  ```
- **Error**: `AssertionError: assert.ok(s2.x < 0)` failed because `s2.x = 25`.
- **Fix**: Update title and assert `s2.x > 0` and `s2.y > 0`.
- **Proposed Replacement**:
  ```javascript
  test('3.14: Q2 camera offset (+x, +y) centers top-left quadrant on screen', () => {
    const s2 = HOW_WE_WORK_SPEC.stages[2];
    assert.ok(s2.x > 0);
    assert.ok(s2.y > 0);
  });
  ```

---

## 5. Summary of Edits Needed in `test/test_how_we_work_e2e.js`

All changes needed are isolated to `test/test_how_we_work_e2e.js`. No changes are required in `index.html`, `styles.css`, `app.js`, `e2e_runner.js`, or the other 5 test files (`test_tier1_features.js`, `test_tier2_boundary.js`, `test_tier3_pairwise.js`, `test_tier4_workloads.js`, `test_tier5_adversarial.js`).

Once these 12 edits are made, running `node test/e2e_runner.js` will output:
```
ALL TESTS PASSED (309/309)
```
