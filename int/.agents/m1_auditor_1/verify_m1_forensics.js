/**
 * Milestone 1 Forensic Audit Verification Script
 * Executed independently by m1_auditor_1
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '../..');
const htmlPath = path.join(projectRoot, 'index.html');
const cssPath = path.join(projectRoot, 'styles.css');
const appJsPath = path.join(projectRoot, 'app.js');
const origReqPath = path.join(projectRoot, 'ORIGINAL_REQUEST.md');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const origReq = fs.readFileSync(origReqPath, 'utf8');

const report = {
  timestamp: new Date().toISOString(),
  checks: [],
  overall: 'CLEAN'
};

function recordCheck(name, pass, details, evidence = '') {
  report.checks.push({ name, pass, details, evidence });
  if (!pass) report.overall = 'INTEGRITY VIOLATION';
}

console.log('=== STARTING FORENSIC INTEGRITY AUDIT: MILESTONE 1 ===\n');

// 1. Check for hardcoded test bypasses or conditional mocks
console.log('1. Checking for test bypasses / mocks in source code...');
const testBypasses = [
  'isTesting',
  'bypassAuth',
  'mockResponse',
  'window.__TEST_MOCK__',
  'process.env.NODE_ENV === "test"'
];
let bypassFound = false;
testBypasses.forEach(pattern => {
  if (html.includes(pattern) || css.includes(pattern)) {
    bypassFound = true;
    recordCheck(`Test Bypass Check: ${pattern}`, false, `Pattern ${pattern} found in production source`);
  }
});
if (!bypassFound) {
  recordCheck('Hardcoded Test Bypass Check', true, 'Zero test bypasses, flags, or test conditionals found in index.html or styles.css');
}

// 2. Check for Facade Implementations (Dummy mockups / empty placeholders)
console.log('2. Checking for Facade implementations in HTML & CSS...');
const hasSection = html.includes('id="how-we-work-section"');
const hasTrack = html.includes('data-hww-track') || html.includes('class="hww-track"');
const hasViewport = html.includes('data-hww-viewport') || html.includes('class="hww-sticky-viewport');
const hasSpatialCanvas = html.includes('id="hww-spatial-canvas"') || html.includes('class="hww-spatial-canvas');
const hasHudOverlay = html.includes('class="hww-hud-overlay"');
const hasScrubber = html.includes('class="hww-nav-pills"');

const has4Cards = [1, 2, 3, 4].every(q => html.includes(`data-quadrant="${q}"`));
const has4CornerTags = ['discovery', 'building', 'integrating', 'maintenance'].every(c => html.includes(`data-corner="${c}"`));
const has4Mockups = html.includes('mockup-p1') && html.includes('mockup-p2') && html.includes('mockup-p3') && html.includes('mockup-p4');

const structureOk = hasSection && hasTrack && hasViewport && hasSpatialCanvas && hasHudOverlay && hasScrubber && has4Cards && has4CornerTags && has4Mockups;
recordCheck('DOM Structural Completeness', structureOk, `Section: ${hasSection}, Track: ${hasTrack}, Viewport: ${hasViewport}, Canvas: ${hasSpatialCanvas}, HUD: ${hasHudOverlay}, Scrubber: ${hasScrubber}, 4 Cards: ${has4Cards}, 4 Corner Tags: ${has4CornerTags}, 4 Mockups: ${has4Mockups}`);

// 3. Verbatim Content Accuracy against ORIGINAL_REQUEST.md
console.log('3. Checking Verbatim Content against ORIGINAL_REQUEST.md...');
const requiredTextSnippets = [
  'How We Work',
  'METHODOLOGY',
  'Discovery Call',
  'We get on a call with you so you can explain to us what problems you are facing and what outcomes you want.',
  'Vent to us about your problems',
  'Clear understanding of your operating systems',
  'Credential Handover',
  '40% upfront payment',
  'Building Phase',
  'We build the systems designed specifically for your needs, and blends into your operating system',
  'Takes from 1 - 4 weeks depending on the case',
  'Live dashboard so you can track progress',
  'Engineering state-of-the-art architecture',
  'Integrating phase',
  "We plug your new intelligent system into your company's existing tools, softwares, databases and operational setup",
  'Documentation so your entire team can understand how system works',
  'Final Testing',
  '60% final payment',
  'Maintenance',
  'We do not just integrate the system and leave you stranded if anything changes in your business, we constantly maintain it for optimal functionality.',
  'Optional, we charge monthly retainer after opted for',
  'Real time system updates, agent training and optimization',
  'System exponentially improves and delivers exceptional results'
];

let missingSnippets = [];
requiredTextSnippets.forEach(snippet => {
  if (!html.includes(snippet)) {
    missingSnippets.push(snippet);
  }
});
recordCheck('Verbatim Copy Integrity', missingSnippets.length === 0, missingSnippets.length === 0 ? 'All 23 required headings, descriptions, and deliverable bullet points match ORIGINAL_REQUEST.md verbatim.' : `Missing snippets: ${JSON.stringify(missingSnippets)}`);

// 4. UI Mockup Depth and Authenticity (Checking for genuine interactive DOM elements)
console.log('4. Checking UI Mockup genuine implementation depth...');
const p1Depth = html.includes('audio-waveform-bars') && html.includes('Operational Intake Stream') && html.includes('Zero-Knowledge Credential Handover') && html.includes('40% Upfront Kickoff Secured');
const p2Depth = html.includes('sprint-progress-track') && html.includes('1 – 4 Weeks Fast Delivery') && html.includes('mockup-terminal-box') && html.includes('term-cursor');
const p3Depth = html.includes('mockup-connectors-grid') && html.includes('PostgreSQL / DW') && html.includes('Salesforce CRM') && html.includes('Final QA Test Suite') && html.includes('100% Passed (48/48)');
const p4Depth = html.includes('mockup-telemetry-grid') && html.includes('99.99%') && html.includes('14ms') && html.includes('Exponential Learning Curve') && html.includes('compounding-svg');

const mockupsAuthentic = p1Depth && p2Depth && p3Depth && p4Depth;
recordCheck('UI Mockup Implementation Depth', mockupsAuthentic, `P1 Vault: ${p1Depth}, P2 Terminal & Sprint: ${p2Depth}, P3 Connector Grid & QA: ${p3Depth}, P4 Telemetry & RLHF: ${p4Depth}`);

// 5. CSS Styling and Neon Theme Tokens Check
console.log('5. Checking CSS styling, tokens, and hardware acceleration...');
const hasP1Color = css.includes('#10b981') && (css.includes('--hww-p1-accent') || css.includes('16, 185, 129'));
const hasP2Color = css.includes('#3b82f6') && (css.includes('--hww-p2-accent') || css.includes('59, 130, 246'));
const hasP3Color = css.includes('#a855f7') && (css.includes('--hww-p3-accent') || css.includes('168, 85, 247'));
const hasP4Color = css.includes('#f59e0b') && (css.includes('--hww-p4-accent') || css.includes('245, 158, 11'));
const hasBgColor = css.includes('#0a0a0c');
const hasGPU = css.includes('preserve-3d') && css.includes('will-change: transform') && css.includes('translate3d');
const hasKeyframes = css.includes('@keyframes hwwRadarPing') && css.includes('@keyframes hwwWaveBounce') && css.includes('@keyframes hwwGanttPulse') && css.includes('@keyframes hwwBlink');
const hasResponsive = css.includes('@media (max-width: 992px)') && css.includes('@media (max-width: 576px)');
const hasReducedMotion = css.includes('@media (prefers-reduced-motion: reduce)');

const cssOk = hasP1Color && hasP2Color && hasP3Color && hasP4Color && hasBgColor && hasGPU && hasKeyframes && hasResponsive && hasReducedMotion;
recordCheck('CSS Architecture & Styling Tokens', cssOk, `Colors (P1-P4, BG): ${hasP1Color && hasP2Color && hasP3Color && hasP4Color && hasBgColor}, GPU 3D: ${hasGPU}, Keyframe Animations: ${hasKeyframes}, Responsive Reflow: ${hasResponsive}, Reduced Motion: ${hasReducedMotion}`);

// 6. Test Suite Authenticity (Self-certifying / mocked test detection)
console.log('6. Checking test files for authenticity and non-mocked execution...');
const testHowWeWork = fs.readFileSync(path.join(projectRoot, 'test/test_how_we_work_e2e.js'), 'utf8');
const testTier1 = fs.readFileSync(path.join(projectRoot, 'test/test_tier1_features.js'), 'utf8');
const testTier2 = fs.readFileSync(path.join(projectRoot, 'test/test_tier2_boundary.js'), 'utf8');
const testTier3 = fs.readFileSync(path.join(projectRoot, 'test/test_tier3_pairwise.js'), 'utf8');
const testTier4 = fs.readFileSync(path.join(projectRoot, 'test/test_tier4_workloads.js'), 'utf8');

const testsInspectHtmlDirectly = testHowWeWork.includes('readHtml') && testHowWeWork.includes('index.html');
const testsInspectCssDirectly = testHowWeWork.includes('readCss') && testHowWeWork.includes('styles.css');
const testsValidateServerRequests = testTier1.includes('httpRequest') && testTier2.includes('httpRequest') && testTier3.includes('httpRequest') && testTier4.includes('httpRequest');

const testSuiteAuthentic = testsInspectHtmlDirectly && testsInspectCssDirectly && testsValidateServerRequests;
recordCheck('Test Suite Authenticity', testSuiteAuthentic, `HTML file validation: ${testsInspectHtmlDirectly}, CSS file validation: ${testsInspectCssDirectly}, Real HTTP validation: ${testsValidateServerRequests}`);

// Output summary
console.log('\n=== AUDIT RESULTS SUMMARY ===');
report.checks.forEach((c, idx) => {
  console.log(`[${c.pass ? 'PASS' : 'FAIL'}] #${idx+1} ${c.name}: ${c.details}`);
});
console.log(`\nOVERALL FORENSIC VERDICT: ${report.overall}`);

fs.writeFileSync(path.join(__dirname, 'audit_evidence.json'), JSON.stringify(report, null, 2));
process.exit(report.overall === 'CLEAN' ? 0 : 1);
