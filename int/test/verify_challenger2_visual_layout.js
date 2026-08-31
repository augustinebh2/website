/**
 * Challenger 2: Visual & Layout Empirical Verification Script
 * 
 * Verifies:
 * 1. Exact visual tokens: hex colors (#10b981, #3b82f6, #ec4899, #f59e0b), HUD border rgba(255,255,255,0.12)
 * 2. Card DOM layout: Left-mockup (.hww-card-mockup) & Right-deliverables (.hww-card-content) for all 4 phases
 * 3. 4-Corner HUD coordinates: TR (Discovery), TL (Building), BL (Integrating), BR (Maintenance)
 * 4. CTA button destination (solutions.html) and text ("Explore Our Solutions →" / "&rarr;")
 * 5. Outro Dual-State platform transition and 2.5D camera coordinates
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
const stylesCss = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf-8');
const appJs = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf-8');
const solutionsHtml = fs.readFileSync(path.join(ROOT, 'solutions.html'), 'utf-8');

const results = [];

function check(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    results.push({ name, status: 'FAIL', error: err.message });
    console.log(`  ✖ [FAIL] ${name}: ${err.message}`);
  }
}

console.log('\n=== CHALLENGER 2: VISUAL & LAYOUT EMPIRICAL VERIFICATION ===\n');

// -------------------------------------------------------------
// 1. EXACT VISUAL TOKENS & COLOR VALUES
// -------------------------------------------------------------
console.log('--- 1. Visual Token & Color Value Assertions ---');

check('CSS Variable --hww-p1-accent is exactly #10b981 (Neon Green)', () => {
  assert.match(stylesCss, /--hww-p1-accent:\s*#10b981;/i);
});

check('CSS Variable --hww-p2-accent is exactly #3b82f6 (Electric Blue)', () => {
  assert.match(stylesCss, /--hww-p2-accent:\s*#3b82f6;/i);
});

check('CSS Variable --hww-p3-accent is exactly #ec4899 (Neon Pink/Red)', () => {
  assert.match(stylesCss, /--hww-p3-accent:\s*#ec4899;/i);
});

check('CSS Variable --hww-p4-accent is exactly #f59e0b (Neon Yellow/Gold)', () => {
  assert.match(stylesCss, /--hww-p4-accent:\s*#f59e0b;/i);
});

check('CSS Variable --hww-border-glass is exactly rgba(255, 255, 255, 0.12)', () => {
  assert.match(stylesCss, /--hww-border-glass:\s*rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.12\s*\);/);
});

check('HUD border frame styling specifies border: 1px solid rgba(255, 255, 255, 0.12)', () => {
  assert.match(stylesCss, /\.hww-hud-border-frame[\s\S]*?border:\s*1px\s+solid\s+rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.12\s*\)/);
});

check('Connecting rays exist for all 4 quadrants (.ray-tl, .ray-tr, .ray-bl, .ray-br)', () => {
  assert.match(indexHtml, /class="ray-line\s+ray-tl"/);
  assert.match(indexHtml, /class="ray-line\s+ray-tr"/);
  assert.match(indexHtml, /class="ray-line\s+ray-bl"/);
  assert.match(indexHtml, /class="ray-line\s+ray-br"/);
  assert.match(stylesCss, /\.ray-tl[\s\S]*?var\(--hww-p2-accent\)/);
  assert.match(stylesCss, /\.ray-tr[\s\S]*?var\(--hww-p1-accent\)/);
  assert.match(stylesCss, /\.ray-bl[\s\S]*?var\(--hww-p3-accent\)/);
  assert.match(stylesCss, /\.ray-br[\s\S]*?var\(--hww-p4-accent\)/);
});

// -------------------------------------------------------------
// 2. 4-CORNER HUD NODES & REALIGNMENT
// -------------------------------------------------------------
console.log('\n--- 2. 4-Corner HUD Nodes & Spatial Mapping Assertions ---');

check('Top-Right Corner tag is Discovery (01 Green #10b981)', () => {
  const trMatch = indexHtml.match(/<div class="hww-corner-tag\s+corner-tr"[^>]*>([\s\S]*?)<\/div>\s*(?:<!--|<\/div>|<div)/);
  assert.ok(trMatch, 'Top-Right corner tag must exist');
  assert.ok(trMatch[1].includes('data-corner="discovery"') || indexHtml.includes('corner-tr" data-corner="discovery"'));
  assert.ok(trMatch[1].includes('dot-green'));
  assert.ok(trMatch[1].includes('Phase 1: Discovery Call'));
  assert.ok(trMatch[1].includes('40% UPFRONT'));
});

check('Top-Left Corner tag is Building (02 Blue #3b82f6)', () => {
  const tlMatch = indexHtml.match(/<div class="hww-corner-tag\s+corner-tl"[^>]*>([\s\S]*?)<\/div>\s*(?:<!--|<\/div>|<div)/);
  assert.ok(tlMatch, 'Top-Left corner tag must exist');
  assert.ok(tlMatch[1].includes('dot-blue') || indexHtml.includes('corner-tl" data-corner="building"'));
  assert.ok(tlMatch[1].includes('Phase 2: Building Phase'));
  assert.ok(tlMatch[1].includes('1–4 WEEKS') || tlMatch[1].includes('1-4 WEEKS'));
});

check('Bottom-Left Corner tag is Integrating (03 Pink/Red #ec4899)', () => {
  const blMatch = indexHtml.match(/<div class="hww-corner-tag\s+corner-bl"[^>]*>([\s\S]*?)<\/div>\s*(?:<!--|<\/div>|<div)/);
  assert.ok(blMatch, 'Bottom-Left corner tag must exist');
  assert.ok(blMatch[1].includes('dot-pink') || blMatch[1].includes('dot-purple'));
  assert.ok(blMatch[1].includes('Phase 3: Integrating Phase') || blMatch[1].includes('Phase 3: Integrating phase'));
  assert.ok(blMatch[1].includes('60% FINAL'));
});

check('Bottom-Right Corner tag is Maintenance (04 Yellow/Gold #f59e0b)', () => {
  const brMatch = indexHtml.match(/<div class="hww-corner-tag\s+corner-br"[^>]*>([\s\S]*?)<\/div>\s*(?:<!--|<\/div>|<div)/);
  assert.ok(brMatch, 'Bottom-Right corner tag must exist');
  assert.ok(brMatch[1].includes('dot-yellow'));
  assert.ok(brMatch[1].includes('Phase 4: Maintenance'));
  assert.ok(brMatch[1].includes('24/7 OPT'));
});

check('CSS 2x2 Grid placement for 4 Quadrants matches spatial layout', () => {
  // Q1 (Discovery) -> grid-column: 2; grid-row: 1 (Top-Right)
  assert.match(stylesCss, /\.hww-q1[\s\S]*?grid-column:\s*2;\s*grid-row:\s*1;/);
  // Q2 (Building) -> grid-column: 1; grid-row: 1 (Top-Left)
  assert.match(stylesCss, /\.hww-q2[\s\S]*?grid-column:\s*1;\s*grid-row:\s*1;/);
  // Q3 (Integrating) -> grid-column: 1; grid-row: 2 (Bottom-Left)
  assert.match(stylesCss, /\.hww-q3[\s\S]*?grid-column:\s*1;\s*grid-row:\s*2;/);
  // Q4 (Maintenance) -> grid-column: 2; grid-row: 2 (Bottom-Right)
  assert.match(stylesCss, /\.hww-q4[\s\S]*?grid-column:\s*2;\s*grid-row:\s*2;/);
});

// -------------------------------------------------------------
// 3. CARD DOM LAYOUT (LEFT MOCKUP / RIGHT DELIVERABLES)
// -------------------------------------------------------------
console.log('\n--- 3. Card DOM Layout (Left Mockup, Right Content) Assertions ---');

function verifyCardLayout(phaseId, phaseName) {
  const cardRegex = new RegExp(`<article[^>]*id="${phaseId}"[\\s\\S]*?<\\/article>`, 'i');
  const match = indexHtml.match(cardRegex);
  assert.ok(match, `Card ${phaseId} (${phaseName}) must exist in index.html`);
  const cardHtml = match[0];

  const innerIdx = cardHtml.indexOf('hww-card-inner');
  const mockupIdx = cardHtml.indexOf('hww-card-mockup');
  const contentIdx = cardHtml.indexOf('hww-card-content');

  assert.ok(innerIdx !== -1, `Card ${phaseId} must contain .hww-card-inner`);
  assert.ok(mockupIdx !== -1, `Card ${phaseId} must contain .hww-card-mockup`);
  assert.ok(contentIdx !== -1, `Card ${phaseId} must contain .hww-card-content`);
  assert.ok(mockupIdx < contentIdx, `Card ${phaseId}: .hww-card-mockup must appear BEFORE .hww-card-content in the DOM (Left column first)`);
}

check('Phase 1 (Discovery Call): Mockup on Left, Deliverables on Right in DOM', () => {
  verifyCardLayout('hww-phase-1', 'Discovery Call');
});

check('Phase 2 (Building Phase): Mockup on Left, Deliverables on Right in DOM', () => {
  verifyCardLayout('hww-phase-2', 'Building Phase');
});

check('Phase 3 (Integrating Phase): Mockup on Left, Deliverables on Right in DOM', () => {
  verifyCardLayout('hww-phase-3', 'Integrating Phase');
});

check('Phase 4 (Maintenance): Mockup on Left, Deliverables on Right in DOM', () => {
  verifyCardLayout('hww-phase-4', 'Maintenance');
});

check('CSS .hww-card-inner defines desktop 2-column grid (1.15fr 1fr)', () => {
  assert.match(stylesCss, /\.hww-card-inner[\s\S]*?grid-template-columns:\s*1\.15fr\s+1fr;/);
});

// -------------------------------------------------------------
// 4. CTA BUTTON & PLATFORM OUTRO STATE
// -------------------------------------------------------------
console.log('\n--- 4. Platform Outro State & CTA Button Assertions ---');

check('#hww-intro-frame contains dual state: state-intro ("How we work") and state-platform ("The Intellectir Platform")', () => {
  assert.match(indexHtml, /id="hww-intro-frame"/);
  assert.match(indexHtml, /id="hww-state-intro"[\s\S]*?How we work/);
  assert.match(indexHtml, /id="hww-state-platform"[\s\S]*?The Intellectir Platform/);
});

check('Platform Outro CTA button points to solutions.html', () => {
  const platformMatch = indexHtml.match(/id="hww-state-platform"[\s\S]*?<\/div>\s*<\/div>/);
  assert.ok(platformMatch, 'state-platform container must exist');
  assert.match(platformMatch[0], /href="solutions\.html"/);
});

check('Platform Outro CTA button contains exact text "Explore Our Solutions →" or "&rarr;"', () => {
  const platformMatch = indexHtml.match(/id="hww-state-platform"[\s\S]*?<\/div>\s*<\/div>/);
  assert.ok(
    platformMatch[0].includes('Explore Our Solutions &rarr;') || 
    platformMatch[0].includes('Explore Our Solutions →') ||
    platformMatch[0].includes('Explore Our Solutions'),
    'CTA button must contain "Explore Our Solutions"'
  );
  assert.ok(
    platformMatch[0].includes('&rarr;') || platformMatch[0].includes('→'),
    'CTA button must contain arrow icon/symbol'
  );
});

check('Destination page solutions.html exists and contains valid HTML markup', () => {
  assert.ok(solutionsHtml.length > 500, 'solutions.html must be populated');
  assert.match(solutionsHtml, /<!DOCTYPE html>/i);
  assert.match(solutionsHtml, /<title>Enterprise AI Services &amp; Autonomous Agents \| Intellectir<\/title>/i);
  assert.match(solutionsHtml, /Custom Agentic AI Solutions/i);
});

// -------------------------------------------------------------
// 5. 2.5D CAMERA WAYPOINTS & SMOOTH CHOREOGRAPHY
// -------------------------------------------------------------
console.log('\n--- 5. 2.5D Camera Coordinates & Stage Synchronization Assertions ---');

check('CAMERA_ANCHORS in app.js defines correct 2.5D coordinates for 4 corners', () => {
  assert.match(appJs, /p:\s*0\.25,\s*scale:\s*1\.85,\s*x:\s*-24,\s*y:\s*24,\s*stage:\s*1/); // TR (Discovery)
  assert.match(appJs, /p:\s*0\.45,\s*scale:\s*1\.85,\s*x:\s*24,\s*y:\s*24,\s*stage:\s*2/);  // TL (Building)
  assert.match(appJs, /p:\s*0\.65,\s*scale:\s*1\.85,\s*x:\s*24,\s*y:\s*-24,\s*stage:\s*3/); // BL (Integrating)
  assert.match(appJs, /p:\s*0\.825,\s*scale:\s*1\.85,\s*x:\s*-24,\s*y:\s*-24,\s*stage:\s*4/); // BR (Maintenance)
  assert.match(appJs, /p:\s*0\.95,\s*scale:\s*1\.00,\s*x:\s*0,\s*y:\s*0,\s*stage:\s*5/);   // Ecosystem Zoom-Out
});

check('renderFrame in app.js switches between state-intro (<0.12) and state-platform (>0.90)', () => {
  assert.match(appJs, /progress\s*<\s*0\.12/);
  assert.match(appJs, /progress\s*>\s*0\.90/);
  assert.match(appJs, /stateIntroEl\.style\.display\s*=\s*'block'/);
  assert.match(appJs, /statePlatformEl\.style\.display\s*=\s*'block'/);
});

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
const total = results.length;
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;

console.log('\n======================================================');
console.log(`Challenger 2 Verification Summary: ${passed}/${total} passed (${failed} failed)`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
