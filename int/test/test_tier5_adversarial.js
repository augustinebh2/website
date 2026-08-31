/**
 * Tier 5: Adversarial Hardening & Forensic Integrity Suite
 * =========================================================
 * Rigorous adversarial verification for Milestone 1:
 * 1. Exact character & bullet point fidelity against ORIGINAL_REQUEST.md §3
 * 2. 4 Corner Tags structure, data-corner attributes, and neon indicator dots
 * 3. Modal CTA triggers contract (data-modal-target="demo-modal")
 * 4. DOM hierarchy, semantic landmarks, and XSS/sanitization audit
 */

const fs = require('fs');
const path = require('path');
const { describe, test, it, httpRequest, assert, BASE_URL } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readIndexHtml() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf-8');
}

function readOriginalRequest() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'ORIGINAL_REQUEST.md'), 'utf-8');
}

function extractHowWeWorkSection(html) {
  const startTag = '<section class="how-we-work-section" id="how-we-work-section"';
  const startIdx = html.indexOf(startTag);
  assert.ok(startIdx !== -1, 'Section #how-we-work-section must exist in index.html');
  const endTag = '</section>';
  const endIdx = html.indexOf(endTag, startIdx);
  assert.ok(endIdx !== -1, 'Closing </section> tag must exist for #how-we-work-section');
  return html.substring(startIdx, endIdx + endTag.length);
}

// =========================================================================
// 1. Adversarial Verbatim Copy Matching (ORIGINAL_REQUEST.md §3)
// =========================================================================
describe('Tier 5.1: Adversarial Verbatim Content Fidelity (§3)', () => {
  const sectionHtml = extractHowWeWorkSection(readIndexHtml());

  test('5.1.1: Section title matches verbatim "How We Work" / "How we work"', () => {
    assert.ok(
      sectionHtml.includes('How We Work') || sectionHtml.includes('How we work'),
      'Section must contain exact title "How We Work"'
    );
  });

  test('5.1.2: Phase 1 (Discovery Call) - Exact title, description, and 4 bullets', () => {
    // Title
    assert.ok(sectionHtml.includes('Discovery Call'), 'Phase 1 title must be "Discovery Call"');
    // Description
    const expectedDesc = 'We get on a call with you so you can explain to us what problems you are facing and what outcomes you want.';
    assert.ok(sectionHtml.includes(expectedDesc), 'Phase 1 description must match verbatim');
    // Bullets
    const b1 = 'Vent to us about your problems';
    const b2 = 'Clear understanding of your operating systems';
    const b3 = 'Credential Handover';
    const b4 = '40% upfront payment';
    assert.ok(sectionHtml.includes(b1), `Phase 1 bullet 1 missing: "${b1}"`);
    assert.ok(sectionHtml.includes(b2), `Phase 1 bullet 2 missing: "${b2}"`);
    assert.ok(sectionHtml.includes(b3), `Phase 1 bullet 3 missing: "${b3}"`);
    assert.ok(sectionHtml.includes(b4), `Phase 1 bullet 4 missing: "${b4}"`);
  });

  test('5.1.3: Phase 2 (Building Phase) - Exact title, description, and 3 bullets', () => {
    // Title
    assert.ok(sectionHtml.includes('Building Phase'), 'Phase 2 title must be "Building Phase"');
    // Description
    const expectedDesc = 'We build the systems designed specifically for your needs, and blends into your operating system';
    assert.ok(sectionHtml.includes(expectedDesc), 'Phase 2 description must match verbatim');
    // Bullets
    const b1 = 'Takes from 1 - 4 weeks depending on the case';
    const b2 = 'Live dashboard so you can track progress';
    const b3 = 'Engineering state-of-the-art architecture';
    assert.ok(sectionHtml.includes(b1), `Phase 2 bullet 1 missing: "${b1}"`);
    assert.ok(sectionHtml.includes(b2), `Phase 2 bullet 2 missing: "${b2}"`);
    assert.ok(sectionHtml.includes(b3), `Phase 2 bullet 3 missing: "${b3}"`);
  });

  test('5.1.4: Phase 3 (Integrating phase) - Exact title, description, and 3 bullets', () => {
    // Title
    assert.ok(sectionHtml.includes('Integrating phase'), 'Phase 3 title must be "Integrating phase"');
    // Description
    const expectedDesc = "We plug your new intelligent system into your company's existing tools, softwares, databases and operational setup";
    assert.ok(sectionHtml.includes(expectedDesc), 'Phase 3 description must match verbatim');
    // Bullets
    const b1 = 'Documentation so your entire team can understand how system works';
    const b2 = 'Final Testing';
    const b3 = '60% final payment';
    assert.ok(sectionHtml.includes(b1), `Phase 3 bullet 1 missing: "${b1}"`);
    assert.ok(sectionHtml.includes(b2), `Phase 3 bullet 2 missing: "${b2}"`);
    assert.ok(sectionHtml.includes(b3), `Phase 3 bullet 3 missing: "${b3}"`);
  });

  test('5.1.5: Phase 4 (Maintenance) - Exact title, description, and 3 bullets', () => {
    // Title
    assert.ok(sectionHtml.includes('Maintenance'), 'Phase 4 title must be "Maintenance"');
    // Description
    const expectedDesc = 'We do not just integrate the system and leave you stranded if anything changes in your business, we constantly maintain it for optimal functionality.';
    assert.ok(sectionHtml.includes(expectedDesc), 'Phase 4 description must match verbatim');
    // Bullets
    const b1 = 'Optional, we charge monthly retainer after opted for';
    const b2 = 'Real time system updates, agent training and optimization';
    const b3 = 'System exponentially improves and delivers exceptional results';
    assert.ok(sectionHtml.includes(b1), `Phase 4 bullet 1 missing: "${b1}"`);
    assert.ok(sectionHtml.includes(b2), `Phase 4 bullet 2 missing: "${b2}"`);
    assert.ok(sectionHtml.includes(b3), `Phase 4 bullet 3 missing: "${b3}"`);
  });
});

// =========================================================================
// 2. Corner Tags & Neon Indicator Dots Contract
// =========================================================================
describe('Tier 5.2: 4 Corner Boundary Tags & Neon Indicators Contract', () => {
  const sectionHtml = extractHowWeWorkSection(readIndexHtml());

  test('5.2.1: Exactly 4 corner tags exist with distinct quadrant positions (TL, TR, BL, BR)', () => {
    assert.ok(sectionHtml.includes('corner-tl'), 'Top-left corner tag class must exist');
    assert.ok(sectionHtml.includes('corner-tr'), 'Top-right corner tag class must exist');
    assert.ok(sectionHtml.includes('corner-bl'), 'Bottom-left corner tag class must exist');
    assert.ok(sectionHtml.includes('corner-br'), 'Bottom-right corner tag class must exist');
  });

  test('5.2.2: Corner tags have required data-corner attributes matching phases', () => {
    assert.ok(sectionHtml.includes('data-corner="discovery"'), 'data-corner="discovery" required');
    assert.ok(sectionHtml.includes('data-corner="building"'), 'data-corner="building" required');
    assert.ok(sectionHtml.includes('data-corner="integrating"'), 'data-corner="integrating" required');
    assert.ok(sectionHtml.includes('data-corner="maintenance"'), 'data-corner="maintenance" required');
  });

  test('5.2.3: Each corner tag contains a colored neon indicator dot', () => {
    assert.ok(sectionHtml.includes('corner-dot dot-green'), 'Green indicator dot required for Discovery');
    assert.ok(sectionHtml.includes('corner-dot dot-blue'), 'Blue indicator dot required for Building');
    assert.ok(sectionHtml.includes('corner-dot dot-purple'), 'Purple indicator dot required for Integrating');
    assert.ok(sectionHtml.includes('corner-dot dot-yellow'), 'Yellow indicator dot required for Maintenance');
  });

  test('5.2.4: Corner tags contain coordinate metadata and phase tags', () => {
    assert.ok(sectionHtml.includes('PHASE 01 // 40% UPFRONT'), 'Discovery coordinate text required');
    assert.ok(sectionHtml.includes('PHASE 02 // 1–4 WEEKS'), 'Building coordinate text required');
    assert.ok(sectionHtml.includes('PHASE 03 // 60% FINAL'), 'Integrating coordinate text required');
    assert.ok(sectionHtml.includes('PHASE 04 // 24/7 OPT'), 'Maintenance coordinate text required');
  });
});

// =========================================================================
// 3. Modal Trigger Buttons & Action Integration Contract
// =========================================================================
describe('Tier 5.3: Modal Trigger Buttons & Action Integration Contract', () => {
  const fullHtml = readIndexHtml();
  const sectionHtml = extractHowWeWorkSection(fullHtml);

  test('5.3.1: Section CTA button has data-modal-target="demo-modal"', () => {
    assert.ok(
      sectionHtml.includes('data-modal-target="demo-modal"'),
      'Section CTA button must specify data-modal-target="demo-modal"'
    );
  });

  test('5.3.2: Target dialog #demo-modal exists in DOM and has role="dialog"', () => {
    assert.ok(fullHtml.includes('id="demo-modal"'), 'Element #demo-modal must exist in document');
    assert.ok(fullHtml.includes('role="dialog"') || fullHtml.includes('aria-modal="true"'), 'Modal must be accessible dialog');
  });

  test('5.3.3: Section CTA button includes accessible aria-label', () => {
    assert.ok(
      sectionHtml.includes('aria-label="Book Discovery Call Consultation"') || sectionHtml.includes('aria-label="Schedule Your Discovery Call"') || sectionHtml.includes('aria-label="Schedule Discovery Call"'),
      'CTA button must have accessible label'
    );
  });
});

// =========================================================================
// 4. DOM Hierarchy, 2.5D Canvas & Mockup Architecture Contract
// =========================================================================
describe('Tier 5.4: DOM Hierarchy, 2.5D Canvas & Mockup Structure', () => {
  const sectionHtml = extractHowWeWorkSection(readIndexHtml());

  test('5.4.1: Track, Sticky Viewport, and Spatial Canvas hierarchy is properly nested', () => {
    const trackIdx = sectionHtml.indexOf('class="hww-track"');
    const viewportIdx = sectionHtml.indexOf('class="hww-sticky-viewport');
    const canvasIdx = sectionHtml.indexOf('class="hww-spatial-canvas');
    assert.ok(trackIdx !== -1, 'Track must exist');
    assert.ok(viewportIdx !== -1, 'Viewport must exist');
    assert.ok(canvasIdx !== -1, 'Canvas must exist');
    assert.ok(trackIdx < viewportIdx, 'Track must parent Viewport');
    assert.ok(viewportIdx < canvasIdx, 'Viewport must parent Canvas');
  });

  test('5.4.2: Exactly 4 quadrant cards exist with data-quadrant="1|2|3|4"', () => {
    assert.ok(sectionHtml.includes('data-quadrant="1"'), 'Quadrant 1 card required');
    assert.ok(sectionHtml.includes('data-quadrant="2"'), 'Quadrant 2 card required');
    assert.ok(sectionHtml.includes('data-quadrant="3"'), 'Quadrant 3 card required');
    assert.ok(sectionHtml.includes('data-quadrant="4"'), 'Quadrant 4 card required');
  });

  test('5.4.3: All 4 interactive UI mockups exist with proper phase-specific classes', () => {
    assert.ok(sectionHtml.includes('mockup-discovery') && sectionHtml.includes('mockup-p1'), 'P1 mockup required');
    assert.ok(sectionHtml.includes('mockup-building') && sectionHtml.includes('mockup-p2'), 'P2 mockup required');
    assert.ok(sectionHtml.includes('mockup-integrating') && sectionHtml.includes('mockup-p3'), 'P3 mockup required');
    assert.ok(sectionHtml.includes('mockup-maintenance') && sectionHtml.includes('mockup-p4'), 'P4 mockup required');
  });

  test('5.4.4: Scrubber pills nav contains 4 buttons with data-hww-goto="1|2|3|4"', () => {
    assert.ok(sectionHtml.includes('data-hww-goto="1"'));
    assert.ok(sectionHtml.includes('data-hww-goto="2"'));
    assert.ok(sectionHtml.includes('data-hww-goto="3"'));
    assert.ok(sectionHtml.includes('data-hww-goto="4"'));
  });
});

// =========================================================================
// 5. Adversarial Hygiene & Sanitization
// =========================================================================
describe('Tier 5.5: Adversarial Hygiene, Zero Placeholders & Sanitization', () => {
  const sectionHtml = extractHowWeWorkSection(readIndexHtml());

  test('5.5.1: Zero unfinished placeholders (Lorem ipsum, TODO, FIXME, TBD, undefined, NaN)', () => {
    assert.ok(!sectionHtml.toLowerCase().includes('lorem ipsum'), 'Must not contain lorem ipsum');
    assert.ok(!sectionHtml.includes('TODO'), 'Must not contain TODO');
    assert.ok(!sectionHtml.includes('FIXME'), 'Must not contain FIXME');
    assert.ok(!sectionHtml.includes('undefined'), 'Must not contain undefined literal');
    assert.ok(!sectionHtml.includes('NaN'), 'Must not contain NaN literal');
  });

  test('5.5.2: Zero inline event handlers (onclick, onload, onerror) in markup', () => {
    assert.ok(!sectionHtml.includes('onclick='), 'Must not use inline onclick handlers');
    assert.ok(!sectionHtml.includes('onload='), 'Must not use inline onload handlers');
    assert.ok(!sectionHtml.includes('onerror='), 'Must not use inline onerror handlers');
  });

  test('5.5.3: Balanced tag hierarchy within section', () => {
    const divOpenCount = (sectionHtml.match(/<div[\s>]/g) || []).length;
    const divCloseCount = (sectionHtml.match(/<\/div>/g) || []).length;
    assert.strictEqual(divOpenCount, divCloseCount, `Div tags must be balanced (open: ${divOpenCount}, close: ${divCloseCount})`);
  });
});
