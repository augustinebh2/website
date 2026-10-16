/**
 * Test Suite: Lenis Smooth Scroll & Subtle Scroll-Triggered Reveals
 * =================================================================
 * Verifies the Consulting.com-inspired smooth scroll implementation:
 * 1. Lenis library delivery and HTTP asset integrity
 * 2. CSS contract compliance (html.lenis, lenis-smooth, data-lenis-prevent, etc.)
 * 3. Page script integration across all primary pages
 * 4. Strict exclusion contract for How We Work section (data-lenis-prevent & reveal isolation)
 * 5. Consulting.com configuration fidelity (duration: 1.0, snappy exponential easing, multipliers)
 * 6. SmoothScrollModule lifecycle and Intellectir namespace integration
 */

const fs = require('fs');
const path = require('path');
const { describe, test, httpRequest, assert } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PAGES = ['index.html', 'company.html', 'discover.html', 'industries.html', 'partners.html', 'solutions.html'];

function readPageHtml(filename) {
  return fs.readFileSync(path.join(PROJECT_ROOT, filename), 'utf-8');
}

function readStylesCss() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'styles.css'), 'utf-8');
}

function readAppJs() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');
}

// =========================================================================
// 1. Lenis Library Delivery & Asset Verification
// =========================================================================
describe('Lenis 1: Library Delivery & Asset Verification', () => {
  test('1.1: assets/lenis.min.js exists on local disk and is non-empty', () => {
    const assetPath = path.join(PROJECT_ROOT, 'assets', 'lenis.min.js');
    assert.ok(fs.existsSync(assetPath), 'assets/lenis.min.js must exist on disk');
    const content = fs.readFileSync(assetPath, 'utf-8');
    assert.ok(content.length > 5000, 'assets/lenis.min.js must be a valid distribution bundle');
    assert.ok(content.includes('Lenis'), 'assets/lenis.min.js must define Lenis');
  });

  test('1.2: Server delivers /assets/lenis.min.js with HTTP 200 and application/javascript MIME type', async () => {
    const res = await httpRequest('/assets/lenis.min.js');
    assert.assertStatus(res, 200);
    assert.assertHeader(res, 'content-type', /(application|text)\/javascript/i);
    assert.ok(res.body.includes('Lenis'), 'Delivered script must contain Lenis definition');
  });
});

// =========================================================================
// 2. Lenis CSS Contract Verification
// =========================================================================
describe('Lenis 2: CSS Contract Compliance', () => {
  test('2.1: styles.css declares html.lenis, html.lenis body { height: auto; }', () => {
    const css = readStylesCss();
    assert.ok(
      css.includes('html.lenis') && css.includes('height: auto'),
      'styles.css must declare html.lenis with height: auto'
    );
  });

  test('2.2: styles.css declares .lenis.lenis-smooth { scroll-behavior: auto !important; }', () => {
    const css = readStylesCss();
    assert.ok(
      css.includes('.lenis.lenis-smooth') && css.includes('scroll-behavior: auto !important'),
      'styles.css must enforce scroll-behavior: auto !important on .lenis.lenis-smooth'
    );
  });

  test('2.3: styles.css declares [data-lenis-prevent] with overscroll-behavior: contain', () => {
    const css = readStylesCss();
    assert.ok(
      css.includes('[data-lenis-prevent]') && css.includes('overscroll-behavior: contain'),
      'styles.css must configure [data-lenis-prevent] with overscroll-behavior: contain'
    );
  });

  test('2.4: styles.css declares .lenis.lenis-stopped { overflow: hidden; }', () => {
    const css = readStylesCss();
    assert.ok(
      css.includes('.lenis.lenis-stopped') && css.includes('overflow: hidden'),
      'styles.css must configure .lenis.lenis-stopped with overflow: hidden'
    );
  });

  test('2.5: styles.css declares .lenis.lenis-scrolling iframe { pointer-events: none; }', () => {
    const css = readStylesCss();
    assert.ok(
      css.includes('.lenis.lenis-scrolling iframe') && css.includes('pointer-events: none'),
      'styles.css must disable iframe pointer-events during active Lenis scrolling'
    );
  });
});

// =========================================================================
// 3. HTML Integration Across All Primary Pages
// =========================================================================
describe('Lenis 3: HTML Integration Across All Primary Pages', () => {
  PAGES.forEach(page => {
    test(`3.1: ${page} includes assets/lenis.min.js before app.js`, () => {
      const html = readPageHtml(page);
      assert.ok(html.includes('assets/lenis.min.js'), `${page} must load assets/lenis.min.js`);
      const lenisIdx = html.indexOf('assets/lenis.min.js');
      const appIdx = html.indexOf('app.js');
      assert.ok(lenisIdx !== -1 && appIdx !== -1, `${page} must contain both lenis and app scripts`);
      assert.ok(lenisIdx < appIdx, `${page} must load assets/lenis.min.js before app.js`);
    });
  });
});

// =========================================================================
// 4. How We Work Section Complete Exclusion Contract
// =========================================================================
describe('Lenis 4: How We Work Section Complete Exclusion Contract', () => {
  test('4.1: #how-we-work-section in index.html declares data-lenis-prevent', () => {
    const html = readPageHtml('index.html');
    const hasPrevent = /<section[^>]*id=["']how-we-work-section["'][^>]*data-lenis-prevent/i.test(html);
    assert.ok(hasPrevent, '#how-we-work-section in index.html must declare data-lenis-prevent');
  });

  test('4.2: .hww-track in index.html declares data-lenis-prevent', () => {
    const html = readPageHtml('index.html');
    const hasTrackPrevent = /class=["'][^"']*hww-track[^"']*["'][^>]*data-lenis-prevent/i.test(html) ||
                            /data-lenis-prevent[^>]*class=["'][^"']*hww-track[^"']*["']/i.test(html);
    assert.ok(hasTrackPrevent, '.hww-track in index.html must declare data-lenis-prevent');
  });

  test('4.3: styles.css contains explicit exclusion override for #how-we-work-section reveals', () => {
    const css = readStylesCss();
    assert.ok(
      css.includes('#how-we-work-section .reveal-on-scroll'),
      'styles.css must isolate #how-we-work-section from external reveal-on-scroll rules'
    );
  });

  test('4.4: app.js ScrollAnimationModule filters out elements within #how-we-work-section and data-lenis-prevent', () => {
    const js = readAppJs();
    assert.ok(
      js.includes('closest(\'#how-we-work-section\')') || js.includes('closest("#how-we-work-section")'),
      'ScrollAnimationModule in app.js must explicitly check for #how-we-work-section exclusion'
    );
    assert.ok(
      js.includes('data-lenis-prevent'),
      'ScrollAnimationModule in app.js must explicitly check for [data-lenis-prevent] exclusion'
    );
  });
});

// =========================================================================
// 5. Consulting.com Configuration & Easing Fidelity
// =========================================================================
describe('Lenis 5: Consulting.com Configuration & Easing Fidelity', () => {
  test('5.1: app.js configures Lenis with duration: 1.0 matching Consulting.com intensity', () => {
    const js = readAppJs();
    assert.ok(
      /duration:\s*1\.0/i.test(js),
      'app.js must configure Lenis duration to 1.0'
    );
  });

  test('5.2: app.js uses snappy exponential ease-out function Math.min(1, 1.001 - Math.pow(2, -10 * t))', () => {
    const js = readAppJs();
    assert.ok(
      js.includes('1.001 - Math.pow(2, -10 * t)'),
      'app.js must implement Consulting.com exponential ease-out formula'
    );
  });

  test('5.3: app.js configures smoothWheel: true, wheelMultiplier: 1.0, touchMultiplier: 1.5', () => {
    const js = readAppJs();
    assert.ok(/smoothWheel:\s*true/i.test(js), 'smoothWheel must be true');
    assert.ok(/wheelMultiplier:\s*1\.0/i.test(js), 'wheelMultiplier must be 1.0');
    assert.ok(/touchMultiplier:\s*1\.5/i.test(js), 'touchMultiplier must be 1.5');
  });

  test('5.4: app.js SmoothScrollModule requests animation frames via requestAnimationFrame', () => {
    const js = readAppJs();
    assert.ok(
      js.includes('lenisInstance.raf(time)') || js.includes('lenis.raf(time)'),
      'SmoothScrollModule must advance Lenis with requestAnimationFrame'
    );
  });

  test('5.5: app.js exposes SmoothScrollModule on window.Intellectir namespace and initializes it', () => {
    const js = readAppJs();
    assert.ok(js.includes('SmoothScrollModule,'), 'SmoothScrollModule must be exposed in window.Intellectir');
    assert.ok(js.includes('SmoothScrollModule.init()'), 'SmoothScrollModule must be initialized in window.Intellectir.init()');
  });
});
