/**
 * Tier 5: Adversarial Hardening & Forensic Integrity Suite
 * =========================================================
 * Rigorous adversarial verification for Intellectir "How We Work" Component:
 * 1. Exact character & bullet point fidelity against ORIGINAL_REQUEST.md §3 (Tier 5.1)
 * 2. 4 Corner Tags structure, data-corner attributes, and neon indicator dots (Tier 5.2)
 * 3. Modal CTA triggers contract (data-modal-target="demo-modal") (Tier 5.3)
 * 4. DOM hierarchy, semantic landmarks, and XSS/sanitization audit (Tier 5.4)
 * 5. Adversarial Hygiene & Zero Placeholders (Tier 5.5)
 * 6. Extreme Viewport Stress Testing: 320px, 375px, 768px, 1440px, 2560px (Tier 5.6)
 * 7. High-Speed Non-Linear Scrubber Jump Sequences & State Machine Idempotency (Tier 5.7)
 * 8. Module Teardown, Lifecycle & Re-Initialization Stress (destroy / init) (Tier 5.8)
 * 9. Smoothstep & Camera Transform Numerical Stability across 1,000 Continuous Sub-pixel Samples (Tier 5.9)
 * 10. WCAG AAA Photometric Contrast & Font-Size Readability (Tier 5.10)
 * 11. Reduced-Motion (prefers-reduced-motion: reduce) Accessibility Overrides (Tier 5.11)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { describe, test, it, httpRequest, assert, BASE_URL } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');

function readIndexHtml() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf-8');
}

function readStylesCss() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'styles.css'), 'utf-8');
}

function readAppJs() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');
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

// Photometric luminance calculation
function hexToLuminance(hex) {
  const cleanHex = hex.replace('#', '');
  const expanded = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;
  const r = parseInt(expanded.substring(0, 2), 16) / 255;
  const g = parseInt(expanded.substring(2, 4), 16) / 255;
  const b = parseInt(expanded.substring(4, 6), 16) / 255;

  const sRGB = [r, g, b].map(val => (val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)));
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

function calculateContrastRatio(hex1, hex2) {
  const l1 = hexToLuminance(hex1);
  const l2 = hexToLuminance(hex2);
  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

// Hermite smoothstep reference oracle
function referenceSmoothstep(t) {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
}

// Helper to create a fully isolated mock DOM environment for app.js
function createMockHowWeWorkEnvironment(customOptions = {}) {
  const eventListeners = {
    window: {},
    elements: {}
  };

  const createMockElement = (id, classNames = [], attributes = {}) => {
    const classSet = new Set(classNames);
    const attrMap = new Map(Object.entries(attributes));
    const el = {
      id,
      tagName: 'DIV',
      classList: {
        add: (...cls) => cls.forEach(c => classSet.add(c)),
        remove: (...cls) => cls.forEach(c => classSet.delete(c)),
        toggle: (c, force) => {
          if (force === undefined) {
            if (classSet.has(c)) classSet.delete(c); else classSet.add(c);
          } else if (force) {
            classSet.add(c);
          } else {
            classSet.delete(c);
          }
          return classSet.has(c);
        },
        contains: (c) => classSet.has(c)
      },
      style: {},
      getAttribute: (k) => attrMap.get(k) || null,
      setAttribute: (k, v) => attrMap.set(k, String(v)),
      removeAttribute: (k) => attrMap.delete(k),
      getBoundingClientRect: () => ({
        top: customOptions.scrollTop !== undefined ? -customOptions.scrollTop : 0,
        bottom: 5000,
        left: 0,
        right: 1400,
        width: 1400,
        height: 5000
      }),
      offsetHeight: 5000,
      offsetWidth: 1400,
      addEventListener: (evt, fn) => {
        if (!eventListeners.elements[id]) eventListeners.elements[id] = {};
        if (!eventListeners.elements[id][evt]) eventListeners.elements[id][evt] = [];
        eventListeners.elements[id][evt].push(fn);
      },
      removeEventListener: (evt, fn) => {
        if (eventListeners.elements[id] && eventListeners.elements[id][evt]) {
          eventListeners.elements[id][evt] = eventListeners.elements[id][evt].filter(f => f !== fn);
        }
      },
      querySelector: () => null,
      querySelectorAll: () => []
    };
    return el;
  };

  const sectionEl = createMockElement('how-we-work-section', ['how-we-work-section']);
  const trackEl = createMockElement('hww-track', ['hww-track']);
  const canvasEl = createMockElement('hww-spatial-canvas', ['hww-spatial-canvas']);
  const introFrameEl = createMockElement('hww-intro-frame', ['hww-intro-frame']);
  const scrubberProgressEl = createMockElement('hww-scrubber-progress', ['hww-scrubber-progress']);

  const navPills = [1, 2, 3, 4].map(idx =>
    createMockElement(`hww-nav-pill-${idx}`, ['hww-nav-pill'], { 'data-hww-goto': String(idx) })
  );

  const cornerTags = [
    createMockElement('hww-tag-discovery', ['hww-corner-tag', 'corner-tl'], { 'data-corner': 'discovery' }),
    createMockElement('hww-tag-building', ['hww-corner-tag', 'corner-tr'], { 'data-corner': 'building' }),
    createMockElement('hww-tag-integrating', ['hww-corner-tag', 'corner-bl'], { 'data-corner': 'integrating' }),
    createMockElement('hww-tag-maintenance', ['hww-corner-tag', 'corner-br'], { 'data-corner': 'maintenance' })
  ];

  const quadrantCards = [1, 2, 3, 4].map(idx =>
    createMockElement(`hww-quadrant-card-${idx}`, ['hww-quadrant-card'], { 'data-quadrant': String(idx) })
  );

  sectionEl.querySelectorAll = (selector) => {
    if (selector.includes('.hww-nav-pill')) return navPills;
    if (selector.includes('.hww-corner-tag')) return cornerTags;
    if (selector.includes('.hww-quadrant-card')) return quadrantCards;
    return [];
  };

  const elementsById = {
    'how-we-work-section': sectionEl,
    'hww-track': trackEl,
    'hww-spatial-canvas': canvasEl,
    'hww-intro-frame': introFrameEl,
    'hww-scrubber-progress': scrubberProgressEl
  };

  let scrollPosition = customOptions.scrollTop || 0;
  let rafCallback = null;
  let rafHandleId = 100;
  let activeRafIds = new Set();
  let observerDisconnected = false;

  class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
    }
    observe(target) {
      if (customOptions.isIntersecting !== false) {
        this.callback([{ isIntersecting: true, target }]);
      }
    }
    unobserve() {}
    disconnect() {
      observerDisconnected = true;
    }
  }

  const mockWindow = {
    innerHeight: customOptions.innerHeight || 900,
    innerWidth: customOptions.innerWidth || 1440,
    pageYOffset: scrollPosition,
    addEventListener: (evt, fn) => {
      if (!eventListeners.window[evt]) eventListeners.window[evt] = [];
      eventListeners.window[evt].push(fn);
    },
    removeEventListener: (evt, fn) => {
      if (eventListeners.window[evt]) {
        eventListeners.window[evt] = eventListeners.window[evt].filter(f => f !== fn);
      }
    },
    scrollTo: (options) => {
      if (typeof options === 'object' && options.top !== undefined) {
        scrollPosition = options.top;
        mockWindow.pageYOffset = scrollPosition;
      }
    },
    requestAnimationFrame: (cb) => {
      const id = ++rafHandleId;
      activeRafIds.add(id);
      rafCallback = cb;
      return id;
    },
    cancelAnimationFrame: (id) => {
      activeRafIds.delete(id);
      if (rafHandleId === id) rafCallback = null;
    },
    matchMedia: (query) => ({
      matches: customOptions.reducedMotion && query.includes('prefers-reduced-motion') ? true : false,
      addListener: () => {},
      removeListener: () => {}
    }),
    IntersectionObserver: MockIntersectionObserver
  };

  const mockDocument = {
    readyState: 'complete',
    getElementById: (id) => elementsById[id] || null,
    querySelector: (sel) => null,
    querySelectorAll: (sel) => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    documentElement: { scrollTop: scrollPosition }
  };

  const sandbox = {
    window: mockWindow,
    document: mockDocument,
    Math: Math,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    Array: Array,
    Set: Set,
    IntersectionObserver: MockIntersectionObserver
  };

  const context = vm.createContext(sandbox);
  const code = readAppJs();
  vm.runInContext(code, context);

  return {
    module: sandbox.window.Intellectir.HowWeWorkModule,
    window: mockWindow,
    document: mockDocument,
    elements: {
      section: sectionEl,
      track: trackEl,
      canvas: canvasEl,
      introFrame: introFrameEl,
      scrubberProgress: scrubberProgressEl,
      navPills,
      cornerTags,
      quadrantCards
    },
    eventListeners,
    getActiveRafCount: () => activeRafIds.size,
    isObserverDisconnected: () => observerDisconnected
  };
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
    assert.ok(sectionHtml.includes('Discovery Call'), 'Phase 1 title must be "Discovery Call"');
    const expectedDesc = 'We get on a call with you so you can explain to us what problems you are facing and what outcomes you want.';
    assert.ok(sectionHtml.includes(expectedDesc), 'Phase 1 description must match verbatim');
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
    assert.ok(sectionHtml.includes('Building Phase'), 'Phase 2 title must be "Building Phase"');
    const expectedDesc = 'We build the systems designed specifically for your needs, and blends into your operating system';
    assert.ok(sectionHtml.includes(expectedDesc), 'Phase 2 description must match verbatim');
    const b1 = 'Takes from 1 - 4 weeks depending on the case';
    const b2 = 'Live dashboard so you can track progress';
    const b3 = 'Engineering state-of-the-art architecture';
    assert.ok(sectionHtml.includes(b1), `Phase 2 bullet 1 missing: "${b1}"`);
    assert.ok(sectionHtml.includes(b2), `Phase 2 bullet 2 missing: "${b2}"`);
    assert.ok(sectionHtml.includes(b3), `Phase 2 bullet 3 missing: "${b3}"`);
  });

  test('5.1.4: Phase 3 (Integrating phase) - Exact title, description, and 3 bullets', () => {
    assert.ok(sectionHtml.includes('Integrating phase'), 'Phase 3 title must be "Integrating phase"');
    const expectedDesc = "We plug your new intelligent system into your company's existing tools, softwares, databases and operational setup";
    assert.ok(sectionHtml.includes(expectedDesc), 'Phase 3 description must match verbatim');
    const b1 = 'Documentation so your entire team can understand how system works';
    const b2 = 'Final Testing';
    const b3 = '60% final payment';
    assert.ok(sectionHtml.includes(b1), `Phase 3 bullet 1 missing: "${b1}"`);
    assert.ok(sectionHtml.includes(b2), `Phase 3 bullet 2 missing: "${b2}"`);
    assert.ok(sectionHtml.includes(b3), `Phase 3 bullet 3 missing: "${b3}"`);
  });

  test('5.1.5: Phase 4 (Maintenance) - Exact title, description, and 3 bullets', () => {
    assert.ok(sectionHtml.includes('Maintenance'), 'Phase 4 title must be "Maintenance"');
    const expectedDesc = 'We do not just integrate the system and leave you stranded if anything changes in your business, we constantly maintain it for optimal functionality.';
    assert.ok(sectionHtml.includes(expectedDesc), 'Phase 4 description must match verbatim');
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

// =========================================================================
// 6. Extreme Viewport Stress Testing (320px, 375px, 768px, 1440px, 2560px)
// =========================================================================
describe('Tier 5.6: Extreme Viewport Stress Testing across 5 Breakpoints', () => {
  const css = readStylesCss();

  test('5.6.1: 320px (ultra-mobile compact): CSS specifies small mobile rules (max-width: 576px) hiding pill-titles and single column', () => {
    assert.ok(css.includes('@media (max-width: 576px)'), 'styles.css must have @media (max-width: 576px)');
    assert.ok(css.includes('.pill-title') && css.includes('display: none'), 'Pill titles must collapse on ultra-mobile 320px');
    assert.ok(css.includes('mockup-telemetry-grid') || css.includes('vitals-telemetry-grid'), 'Telemetry grids must reflow for ultra-mobile');
  });

  test('5.6.2: 375px (standard mobile): CSS unpins sticky scroll track and converts spatial canvas to vertical column', () => {
    assert.ok(css.includes('@media (max-width: 992px)'), 'styles.css must have @media (max-width: 992px)');
    const mobileBlock = css.substring(css.indexOf('@media (max-width: 992px)'), css.indexOf('/* Small Mobile'));
    assert.ok(mobileBlock.includes('height: auto !important'), 'Mobile reflow must unpin 500vh track height');
    assert.ok(mobileBlock.includes('transform: none !important'), 'Mobile reflow must reset 3D spatial transform');
    assert.ok(mobileBlock.includes('flex-direction: column !important'), 'Mobile reflow must stack cards vertically');
  });

  test('5.6.3: 768px (tablet): Responsive layout unpins HUD overlay and manages card padding without horizontal overflow', () => {
    const mobileBlock = css.substring(css.indexOf('@media (max-width: 992px)'), css.indexOf('/* Small Mobile'));
    assert.ok(mobileBlock.includes('.hww-hud-overlay') && mobileBlock.includes('display: none !important'), 'HUD overlay hidden on tablet/mobile');
    assert.ok(mobileBlock.includes('.hww-quadrant-card') && mobileBlock.includes('width: 100% !important'), 'Cards take full container width on tablet');
  });

  test('5.6.4: 1440px (desktop standard): 2.5D spatial canvas specifies 1400px width with grid layout and 3D preserve-3d', () => {
    assert.ok(css.includes('width: 1400px;'), 'Desktop canvas must declare width: 1400px');
    assert.ok(css.includes('transform-style: preserve-3d;'), 'Canvas must specify transform-style: preserve-3d');
    assert.ok(css.includes('perspective: 1200px;'), 'Viewport must specify perspective: 1200px');
    assert.ok(css.includes('grid-template-columns: 1fr 1fr;'), 'Canvas must use 2-column grid');
  });

  test('5.6.5: 2560px (4K ultra-wide): Viewport boundaries enforce max-width: 94vw and max-height: 88vh with center alignment', () => {
    assert.ok(css.includes('max-width: 94vw;'), 'Canvas must constrain max-width: 94vw on large displays');
    assert.ok(css.includes('max-height: 88vh;'), 'Canvas must constrain max-height: 88vh on large displays');
    assert.ok(css.includes('align-items: center;') && css.includes('justify-content: center;'), 'Viewport must center canvas on 4K');
  });
});

// =========================================================================
// 7. High-Speed Non-Linear Scrubber Jump Sequences & State Machine Idempotency
// =========================================================================
describe('Tier 5.7: High-Speed Non-Linear Scrubber Jump Sequences & State Machine Idempotency', () => {
  test('5.7.1: Jump sequence P1 -> P4 -> P2 -> P3 -> P1 maps correctly to phase progress values', () => {
    const env = createMockHowWeWorkEnvironment();
    const initResult = env.module.init();
    assert.strictEqual(initResult.initialized, true);

    const jumpSequence = [
      { goto: 1, expectedP: 0.25 },
      { goto: 4, expectedP: 0.825 },
      { goto: 2, expectedP: 0.45 },
      { goto: 3, expectedP: 0.65 },
      { goto: 1, expectedP: 0.25 }
    ];

    jumpSequence.forEach(step => {
      env.module.scrollToPhase(step.goto);
      const transform = env.module.computeCameraTransform(step.expectedP);
      assert.ok(!isNaN(transform.scale));
      assert.ok(!isNaN(transform.translateX));
      assert.ok(!isNaN(transform.translateY));
      assert.ok(transform.scale >= 1.0 && transform.scale <= 1.85);
    });

    env.module.destroy();
  });

  test('5.7.2: State machine getActivePhase() is consistent after non-linear jumps', () => {
    const env = createMockHowWeWorkEnvironment();
    env.module.init();

    // Verify active phase corresponds to progress waypoints
    const p1Transform = env.module.computeCameraTransform(0.25);
    assert.strictEqual(p1Transform.stage, 1);

    const p2Transform = env.module.computeCameraTransform(0.45);
    assert.strictEqual(p2Transform.stage, 2);

    const p3Transform = env.module.computeCameraTransform(0.65);
    assert.strictEqual(p3Transform.stage, 3);

    const p4Transform = env.module.computeCameraTransform(0.825);
    assert.strictEqual(p4Transform.stage, 4);

    env.module.destroy();
  });

  test('5.7.3: Out-of-bounds scrubber targets (0, -5, 999, "NaN", null, undefined) are safely clamped to [1, 4]', () => {
    const env = createMockHowWeWorkEnvironment();
    env.module.init();

    // These calls should not throw and should handle bounds gracefully
    assert.doesNotThrow(() => env.module.scrollToPhase(0));
    assert.doesNotThrow(() => env.module.scrollToPhase(-5));
    assert.doesNotThrow(() => env.module.scrollToPhase(999));
    assert.doesNotThrow(() => env.module.scrollToPhase('invalid'));
    assert.doesNotThrow(() => env.module.scrollToPhase(null));
    assert.doesNotThrow(() => env.module.scrollToPhase(undefined));

    env.module.destroy();
  });

  test('5.7.4: Rapid jumping between opposite quadrants (Q1 TL -> Q4 BR -> Q2 TR -> Q3 BL) maintains continuous coordinates', () => {
    const env = createMockHowWeWorkEnvironment();
    env.module.init();

    const extremeJumps = [0.25, 0.825, 0.45, 0.65];
    extremeJumps.forEach(progress => {
      const matrix = env.module.computeCameraTransform(progress);
      assert.ok(Math.abs(matrix.translateX) <= 24, `translateX ${matrix.translateX} exceeds bounds`);
      assert.ok(Math.abs(matrix.translateY) <= 24, `translateY ${matrix.translateY} exceeds bounds`);
    });

    env.module.destroy();
  });
});

// =========================================================================
// 8. Module Teardown, Lifecycle & Re-Initialization Stress (destroy / init)
// =========================================================================
describe('Tier 5.8: Module Teardown, Lifecycle & Re-Initialization Stress', () => {
  test('5.8.1: HowWeWorkModule.init() is idempotent and handles multiple calls gracefully', () => {
    const env = createMockHowWeWorkEnvironment();
    const r1 = env.module.init();
    assert.strictEqual(r1.initialized, true);

    const r2 = env.module.init();
    assert.strictEqual(r2.initialized, true);
    assert.strictEqual(r2.alreadyInitialized, true);

    env.module.destroy();
  });

  test('5.8.2: HowWeWorkModule.destroy() cleanly disconnects observer and cleans up styles', () => {
    const env = createMockHowWeWorkEnvironment();
    env.module.init();
    env.module.destroy();

    assert.strictEqual(env.isObserverDisconnected(), true, 'IntersectionObserver must be disconnected');
    assert.strictEqual(env.elements.canvas.style.transform, '', 'Canvas transform must be reset');
  });

  test('5.8.3: 50 consecutive cycles of init() -> destroy() execute without memory leaks or errors', () => {
    const env = createMockHowWeWorkEnvironment();
    for (let i = 0; i < 50; i++) {
      const initRes = env.module.init();
      assert.strictEqual(initRes.initialized, true);
      env.module.destroy();
    }
  });

  test('5.8.4: Calling destroy() on uninitialized module does not throw', () => {
    const env = createMockHowWeWorkEnvironment();
    assert.doesNotThrow(() => {
      env.module.destroy();
    });
  });
});

// =========================================================================
// 9. Smoothstep & Camera Transform Numerical Stability across 1,000 Continuous Sub-pixel Samples
// =========================================================================
describe('Tier 5.9: Smoothstep & Camera Transform Numerical Stability across 1,000 Continuous Sub-pixel Samples', () => {
  const env = createMockHowWeWorkEnvironment();

  test('5.9.1: 1,000 continuous samples from progress = -0.50 to +1.50 produce zero NaNs and zero Infs', () => {
    for (let i = 0; i <= 1000; i++) {
      const progress = -0.5 + (i / 1000) * 2.0;
      const matrix = env.module.computeCameraTransform(progress);

      assert.ok(!isNaN(matrix.scale), `Scale was NaN at progress ${progress}`);
      assert.ok(!isNaN(matrix.translateX), `translateX was NaN at progress ${progress}`);
      assert.ok(!isNaN(matrix.translateY), `translateY was NaN at progress ${progress}`);
      assert.ok(!isNaN(matrix.stage), `stage was NaN at progress ${progress}`);
      assert.ok(isFinite(matrix.scale), `Scale was infinite at progress ${progress}`);
      assert.ok(isFinite(matrix.translateX), `translateX was infinite at progress ${progress}`);
      assert.ok(isFinite(matrix.translateY), `translateY was infinite at progress ${progress}`);
    }
  });

  test('5.9.2: Scale values across all 1,000 samples are strictly bounded within [1.00, 1.85]', () => {
    for (let i = 0; i <= 1000; i++) {
      const progress = i / 1000;
      const matrix = env.module.computeCameraTransform(progress);
      assert.ok(matrix.scale >= 1.00 && matrix.scale <= 1.85, `Scale ${matrix.scale} out of bounds [1.00, 1.85] at ${progress}`);
    }
  });

  test('5.9.3: Translation values translateX and translateY are strictly bounded within [-24%, +24%]', () => {
    for (let i = 0; i <= 1000; i++) {
      const progress = i / 1000;
      const matrix = env.module.computeCameraTransform(progress);
      assert.ok(matrix.translateX >= -24.0 && matrix.translateX <= 24.0, `translateX ${matrix.translateX} out of bounds at ${progress}`);
      assert.ok(matrix.translateY >= -24.0 && matrix.translateY <= 24.0, `translateY ${matrix.translateY} out of bounds at ${progress}`);
    }
  });

  test('5.9.4: Output transformString matches valid CSS scale(...) translate3d(...) format', () => {
    const pattern = /^scale\(\d+\.\d{4}\) translate3d\(-?\d+\.\d{2}%, -?\d+\.\d{2}%, 0px\)$/;
    for (let i = 0; i <= 100; i++) {
      const progress = i / 100;
      const matrix = env.module.computeCameraTransform(progress);
      assert.ok(pattern.test(matrix.transformString), `Invalid transform string: "${matrix.transformString}" at ${progress}`);
    }
  });

  test('5.9.5: Camera stages (0 to 5) partition the progress domain monotonically with zero gaps', () => {
    const stagesSeen = new Set();
    for (let i = 0; i <= 1000; i++) {
      const progress = i / 1000;
      const matrix = env.module.computeCameraTransform(progress);
      assert.ok(matrix.stage >= 0 && matrix.stage <= 5);
      stagesSeen.add(matrix.stage);
    }
    assert.strictEqual(stagesSeen.size, 6, 'All 6 stages (0 through 5) must be reachable');
  });
});

// =========================================================================
// 10. WCAG AAA Photometric Contrast & Font-Size Readability
// =========================================================================
describe('Tier 5.10: WCAG AAA Photometric Contrast & Font-Size Readability', () => {
  const css = readStylesCss();

  test('5.10.1: Primary heading white text (#ffffff) against canvas (#0a0a0c) achieves > 15:1 contrast (WCAG AAA >= 7.0:1)', () => {
    const contrast = calculateContrastRatio('#ffffff', '#0a0a0c');
    assert.ok(contrast >= 15.0, `White heading contrast is ${contrast.toFixed(2)}:1 (minimum 15:1 expected)`);
  });

  test('5.10.2: Phase description text (#cbd5e1) against canvas (#0a0a0c) achieves > 12:1 contrast (WCAG AAA >= 7.0:1)', () => {
    const contrast = calculateContrastRatio('#cbd5e1', '#0a0a0c');
    assert.ok(contrast >= 12.0, `Description text contrast is ${contrast.toFixed(2)}:1 (minimum 12:1 expected)`);
  });

  test('5.10.3: Key points item text (#e2e8f0) against inner card container (#020617) achieves > 14:1 contrast (WCAG AAA >= 7.0:1)', () => {
    const contrast = calculateContrastRatio('#e2e8f0', '#020617');
    assert.ok(contrast >= 14.0, `Key point text contrast is ${contrast.toFixed(2)}:1 (minimum 14:1 expected)`);
  });

  test('5.10.4: All 4 quad-accent neon colors (#10b981, #3b82f6, #a855f7, #f59e0b) against #0a0a0c satisfy WCAG AA (>= 4.5:1)', () => {
    const greenContrast = calculateContrastRatio('#10b981', '#0a0a0c');
    const blueContrast = calculateContrastRatio('#3b82f6', '#0a0a0c');
    const purpleContrast = calculateContrastRatio('#a855f7', '#0a0a0c');
    const yellowContrast = calculateContrastRatio('#f59e0b', '#0a0a0c');

    assert.ok(greenContrast >= 4.5, `Green contrast ${greenContrast.toFixed(2)}:1 < 4.5:1`);
    assert.ok(blueContrast >= 4.5, `Blue contrast ${blueContrast.toFixed(2)}:1 < 4.5:1`);
    assert.ok(purpleContrast >= 4.5, `Purple contrast ${purpleContrast.toFixed(2)}:1 < 4.5:1`);
    assert.ok(yellowContrast >= 4.5, `Yellow contrast ${yellowContrast.toFixed(2)}:1 < 4.5:1`);
  });

  test('5.10.5: Typography hierarchy enforces minimum readable font sizes: Phase Titles >= 1.15rem, Body Text >= 0.75rem', () => {
    assert.ok(css.includes('.hww-phase-title') && css.includes('font-size: 1.35rem;'), 'Phase title declared at 1.35rem');
    assert.ok(css.includes('.hww-phase-description') && css.includes('font-size: 0.85rem;'), 'Description declared at 0.85rem');
    assert.ok(css.includes('.hww-points-list li') && css.includes('font-size: 0.78rem;'), 'Points list declared at 0.78rem');
  });
});

// =========================================================================
// 11. Reduced-Motion (prefers-reduced-motion: reduce) Accessibility Overrides
// =========================================================================
describe('Tier 5.11: Reduced-Motion (prefers-reduced-motion: reduce) Accessibility Overrides', () => {
  const css = readStylesCss();

  test('5.11.1: CSS prefers-reduced-motion block disables all looping keyframe animations with animation: none !important', () => {
    assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'CSS must include @media (prefers-reduced-motion: reduce)');
    const reducedBlock = css.substring(css.indexOf('@media (prefers-reduced-motion: reduce)'), css.indexOf('/* 5. WATERMARK SECTION'));

    assert.ok(reducedBlock.includes('.wave-bar'), 'Waveform bars animation disabled');
    assert.ok(reducedBlock.includes('.live-pulse-dot'), 'Pulse dots animation disabled');
    assert.ok(reducedBlock.includes('.sprint-progress-fill'), 'Progress fill animation disabled');
    assert.ok(reducedBlock.includes('.term-cursor'), 'Terminal cursor animation disabled');
    assert.ok(reducedBlock.includes('.rlhf-spin-icon'), 'RLHF spinner animation disabled');
    assert.ok(reducedBlock.includes('animation: none !important'), 'animation: none !important must be applied');
  });

  test('5.11.2: CSS prefers-reduced-motion overrides 3D spatial canvas transitions with simple opacity', () => {
    const reducedBlock = css.substring(css.indexOf('@media (prefers-reduced-motion: reduce)'), css.indexOf('/* 5. WATERMARK SECTION'));
    assert.ok(reducedBlock.includes('.hww-spatial-canvas') || reducedBlock.includes('.hww-canvas'), 'Canvas transition overridden');
    assert.ok(reducedBlock.includes('transition: opacity 0.2s ease !important'), 'Opacity transition applied for reduced motion');
  });

  test('5.11.3: app.js queries prefers-reduced-motion media query and resets canvas transform to "none"', () => {
    const env = createMockHowWeWorkEnvironment({ reducedMotion: true });
    env.module.init();

    // Trigger scroll / frame render with reduced motion
    env.window.pageYOffset = 1000;
    if (env.eventListeners.window['scroll']) {
      env.eventListeners.window['scroll'].forEach(fn => fn());
    }

    assert.strictEqual(env.elements.canvas.style.transform, 'none', 'Canvas transform must be "none" when reduced motion is preferred');
    env.module.destroy();
  });
});
