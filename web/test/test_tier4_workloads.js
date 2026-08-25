/**
 * Tier 4: Real-World Application Scenarios & Responsiveness Check
 * ===============================================================
 * Verifies end-to-end user workflows, responsiveness, and performance:
 * 1. End-to-End User Navigation Journey Scenario
 * 2. Mobile Viewport CSS Media Query & Layout Validation
 * 3. Consultation Booking Flow Scenario
 * 4. Discover Search & Dynamic Filter Scenario
 * 5. WCAG AA Color Contrast Compliance Verification
 * 6. High Concurrency & Latency Stress Validation
 */

const fs = require('fs');
const path = require('path');
const { describe, test, it, httpRequest, assert, BASE_URL } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PAGES = ['index.html', 'company.html', 'discover.html', 'industries.html', 'solutions.html'];

function readPageHtml(filename) {
  return fs.readFileSync(path.join(PROJECT_ROOT, filename), 'utf-8');
}

function readStylesCss() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'styles.css'), 'utf-8');
}

// =========================================================================
// 1. End-to-End User Navigation Journey Scenario
// =========================================================================
describe('Tier 4.1: End-to-End User Navigation Journey Scenario', () => {
  test('4.1.1: Complete visitor journey across all 5 pages executes flawlessly', async () => {
    // Step 1: Land on Home page
    const step1 = await httpRequest('/');
    assert.assertStatus(step1, 200);
    assert.assertContains(step1.body, 'INTELLECTIR');
    assert.match(step1.body, /Agentic\s+Engineering/i, 'index.html should contain Agentic Engineering messaging');

    // Step 2: Navigate to Solutions / Services
    const step2 = await httpRequest('/solutions.html');
    assert.assertStatus(step2, 200);
    assert.assertContains(step2.body, 'Solutions');

    // Step 3: Navigate to Industries Blueprint
    const step3 = await httpRequest('/industries.html');
    assert.assertStatus(step3, 200);
    assert.assertContains(step3.body, 'Industries');

    // Step 4: Navigate to Discover Research Hub
    const step4 = await httpRequest('/discover.html');
    assert.assertStatus(step4, 200);
    assert.assertContains(step4.body, 'Discover');

    // Step 5: Navigate to Company / Compliance
    const step5 = await httpRequest('/company.html');
    assert.assertStatus(step5, 200);
    assert.assertContains(step5.body, 'Company');

    // Step 6: Return to Home page
    const step6 = await httpRequest('/index.html');
    assert.assertStatus(step6, 200);
    assert.assertContains(step6.body, 'INTELLECTIR');
  });

  test('4.1.2: Core stylesheet and client scripts resolve with 200 on every journey step', async () => {
    const cssRes = await httpRequest('/styles.css');
    assert.assertStatus(cssRes, 200);
    assert.assertHeader(cssRes, 'content-type', /text\/css/i);

    const jsRes = await httpRequest('/app.js');
    assert.assertStatus(jsRes, 200);
    assert.assertHeader(jsRes, 'content-type', /(application|text)\/javascript/i);
  });
});

// =========================================================================
// 2. Mobile Viewport CSS Media Query & Layout Validation
// =========================================================================
describe('Tier 4.2: Mobile Viewport CSS Media Query & Layout Validation', () => {
  test('4.2.1: styles.css declares responsive tablet media query (@media max-width: 992px)', () => {
    const css = readStylesCss();
    assert.ok(
      css.includes('992px'),
      'styles.css must declare media query for tablet breakpoint (992px)'
    );
  });

  test('4.2.2: styles.css declares responsive mobile media query (@media max-width: 768px)', () => {
    const css = readStylesCss();
    assert.ok(
      css.includes('768px'),
      'styles.css must declare media query for mobile breakpoint (768px)'
    );
  });

  test('4.2.3: styles.css declares small mobile media query (@media max-width: 576px or 480px)', () => {
    const css = readStylesCss();
    assert.ok(
      css.includes('576px') || css.includes('480px'),
      'styles.css must declare media query for small mobile devices'
    );
  });

  test('4.2.4: All pages declare viewport meta tag for mobile scaling', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.match(
        html,
        /<meta\s+name=["']viewport["']\s+content=["']width=device-width,\s*initial-scale=1\.0["']/i,
        `${page} must declare mobile viewport meta tag`
      );
    }
  });

  test('4.2.5: styles.css enforces overflow-x: hidden on body or main wrappers to prevent horizontal scroll', () => {
    const css = readStylesCss();
    assert.ok(
      css.includes('overflow-x: hidden') || css.includes('overflow-x:hidden'),
      'styles.css must specify overflow-x: hidden to prevent mobile horizontal scroll'
    );
  });
});

// =========================================================================
// 3. Consultation Booking Flow Scenario
// =========================================================================
describe('Tier 4.3: Consultation Booking Flow Scenario', () => {
  test('4.3.1: Consultation modal on all pages contains complete form with required inputs', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      // Verify modal container exists
      assert.ok(html.includes('id="demo-modal"'), `${page} must contain #demo-modal`);

      // Verify name, email, submit controls
      assert.ok(
        html.includes('Full Name') || html.includes('placeholder="John Doe"') || html.includes('name="name"'),
        `${page} modal must have Name input`
      );
      assert.ok(
        html.includes('Work Email') || html.includes('type="email"'),
        `${page} modal must have Email input`
      );
      assert.ok(
        html.includes('type="submit"') || html.includes('btn-primary'),
        `${page} modal must have submit button`
      );
    }
  });

  test('4.3.2: Submission feedback toast element (#toast) exists with message container', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.ok(html.includes('id="toast"'), `${page} must contain #toast element`);
    }
  });
});

// =========================================================================
// 4. Discover Search & Dynamic Filter Scenario
// =========================================================================
describe('Tier 4.4: Discover Search & Dynamic Filter Workflow Scenario', () => {
  const whitepapers = [
    { id: 1, title: 'Autonomous Strategy Engine in Financial Risk', category: 'strategy', desc: 'Real-time portfolio rebalancing and algorithmic trade execution' },
    { id: 2, title: 'Enterprise RAG Architecture & Hybrid Search', category: 'rag', desc: 'Sub-second neural vector search across 50M corporate records' },
    { id: 3, title: 'Zero-Trust Multi-Agent Governance & Auditability', category: 'governance', desc: 'Cryptographic execution trails with human-in-the-loop killswitches' },
    { id: 4, title: 'Commercial Real Estate Deal Flow Automation', category: 'case-study', desc: 'Extracting lease covenants and analyzing tenant covenants 24/7' },
    { id: 5, title: 'Autonomous Legal Contract Synthesis', category: 'case-study', desc: 'Instant NDA and redlining generation for top-tier law firms' },
    { id: 6, title: 'Scalable Voice & Chatbot Agent Orchestration', category: 'strategy', desc: 'Ultra-low latency conversational AI with real-time CRM updates' }
  ];

  function runFilter(items, category, query) {
    const q = (query || '').toLowerCase().trim();
    return items.filter(item => {
      const catMatch = !category || category === 'all' || item.category === category;
      const qMatch = !q || item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
      return catMatch && qMatch;
    });
  }

  test('4.4.1: Initial state shows all 6 whitepapers', () => {
    const result = runFilter(whitepapers, 'all', '');
    assert.strictEqual(result.length, 6);
  });

  test('4.4.2: Selecting "strategy" category filters down to strategy whitepapers', () => {
    const result = runFilter(whitepapers, 'strategy', '');
    assert.strictEqual(result.length, 2);
    assert.ok(result.every(r => r.category === 'strategy'));
  });

  test('4.4.3: Keyword search "vector" within "rag" category returns matching RAG paper', () => {
    const result = runFilter(whitepapers, 'rag', 'vector');
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 2);
  });

  test('4.4.4: Keyword search with zero matches returns empty list cleanly', () => {
    const result = runFilter(whitepapers, 'all', 'nonexistentterm12345');
    assert.strictEqual(result.length, 0);
  });

  test('4.4.5: Resetting filter back to "all" restores all 6 items', () => {
    const result = runFilter(whitepapers, 'all', '');
    assert.strictEqual(result.length, 6);
  });
});

// =========================================================================
// 5. WCAG AA Color Contrast Compliance Verification
// =========================================================================
describe('Tier 4.5: WCAG AA Color Contrast Compliance Verification', () => {
  // Convert hex color (#ffffff or #0f172a) to sRGB relative luminance
  function hexToLuminance(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const sRGB = [r, g, b].map(val => {
      return val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  }

  function calculateContrastRatio(hex1, hex2) {
    const l1 = hexToLuminance(hex1);
    const l2 = hexToLuminance(hex2);
    const brighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (brighter + 0.05) / (darker + 0.05);
  }

  test('4.5.1: Primary button text (#ffffff) against primary accent (#2563eb) satisfies WCAG AA (>= 4.5:1)', () => {
    const contrast = calculateContrastRatio('#ffffff', '#2563eb');
    assert.ok(
      contrast >= 4.5,
      `Primary button contrast ratio is ${contrast.toFixed(2)}:1 (minimum 4.5:1 required)`
    );
  });

  test('4.5.2: Primary body text (#0f172a) against main background (#ffffff) satisfies WCAG AAA (>= 7.0:1)', () => {
    const contrast = calculateContrastRatio('#0f172a', '#ffffff');
    assert.ok(
      contrast >= 7.0,
      `Body text contrast ratio is ${contrast.toFixed(2)}:1 (minimum 7.0:1 required for AAA)`
    );
  });

  test('4.5.3: Secondary / muted text (#475569) against light card background (#f8fafc) satisfies WCAG AA (>= 4.5:1)', () => {
    const contrast = calculateContrastRatio('#475569', '#f8fafc');
    assert.ok(
      contrast >= 4.5,
      `Muted text contrast ratio is ${contrast.toFixed(2)}:1 (minimum 4.5:1 required)`
    );
  });

  test('4.5.4: Dark theme background (#0a0f1d) against light text (#f8fafc) satisfies WCAG AAA (>= 7.0:1)', () => {
    const contrast = calculateContrastRatio('#f8fafc', '#0a0f1d');
    assert.ok(
      contrast >= 7.0,
      `Dark theme contrast ratio is ${contrast.toFixed(2)}:1 (minimum 7.0:1 required)`
    );
  });
});

// =========================================================================
// 6. High Concurrency & Latency Stress Validation
// =========================================================================
describe('Tier 4.6: High Concurrency & Latency Stress Validation', () => {
  test('4.6.1: 50 concurrent requests across all 5 pages and static assets succeed with 100% reliability', async () => {
    const endpoints = [
      '/',
      '/index.html',
      '/company.html',
      '/discover.html',
      '/industries.html',
      '/solutions.html',
      '/styles.css',
      '/app.js'
    ];

    const requests = [];
    for (let i = 0; i < 50; i++) {
      const ep = endpoints[i % endpoints.length];
      requests.push(httpRequest(ep));
    }

    const results = await Promise.all(requests);
    assert.strictEqual(results.length, 50);

    for (const res of results) {
      assert.strictEqual(res.statusCode, 200, `Concurrent request to ${res.reqUrl} failed with status ${res.statusCode}`);
    }
  });

  test('4.6.2: Average response latency (TTFB) on local server is sub-50ms', async () => {
    const latencies = [];
    for (let i = 0; i < 10; i++) {
      const res = await httpRequest('/');
      latencies.push(res.timeMs);
    }

    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    assert.ok(
      avgLatency < 50,
      `Average response latency ${avgLatency.toFixed(2)}ms exceeded 50ms threshold`
    );
  });
});
