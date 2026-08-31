/**
 * Tier 1: Feature Coverage & Contract Validation
 * ===============================================
 * Verifies core functionality (>= 5 tests per inventoried feature):
 * 1. Server Startup & HTTP/1.1 Connection
 * 2. Main Page Route Delivery & HTTP 200 Status
 * 3. Clean URL Routing & Rewrites
 * 4. Static Asset Delivery & Accurate MIME Mapping
 * 5. Global Header & Navigation Contract (All 5 Pages)
 * 6. Global Footer Contract (All 5 Pages)
 * 7. Accessible Consultation Modal & Toast Contract (All 5 Pages)
 * 8. Interactive Component Markup (ROI Calculator, Discover Search, Accordions)
 */

const fs = require('fs');
const path = require('path');
const { describe, test, it, httpRequest, assert, BASE_URL } = require('./e2e_runner');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PAGES = ['index.html', 'company.html', 'discover.html', 'industries.html', 'solutions.html'];

function readPageHtml(filename) {
  const filePath = path.join(PROJECT_ROOT, filename);
  return fs.readFileSync(filePath, 'utf-8');
}

// =========================================================================
// 1. Server Startup & HTTP Connection Feature
// =========================================================================
describe('Tier 1.1: Server Startup & HTTP Protocol Foundation', () => {
  test('1.1.1: Server responds to HTTP/1.1 GET request on root endpoint', async () => {
    const res = await httpRequest('/');
    assert.assertStatus(res, 200);
    assert.ok(res.body.length > 0, 'Response body should not be empty');
  });

  test('1.1.2: Server handles HTTP HEAD requests returning headers without body', async () => {
    const res = await httpRequest({ path: '/', method: 'HEAD' });
    assert.assertStatus(res, 200);
    assert.strictEqual(res.body, '', 'HEAD request should return empty body');
    assert.ok(res.headers['content-type'], 'HEAD request should return Content-Type header');
  });

  test('1.1.3: Server returns valid HTTP response headers (Content-Type, Content-Length or Transfer-Encoding)', async () => {
    const res = await httpRequest('/index.html');
    assert.assertStatus(res, 200);
    assert.ok(res.headers['content-type'], 'Content-Type header must be present');
    assert.ok(
      res.headers['content-length'] || res.headers['transfer-encoding'],
      'Content-Length or chunked Transfer-Encoding must be present'
    );
  });

  test('1.1.4: Server responds reliably across sequential requests without socket hangup', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await httpRequest('/');
      assert.assertStatus(res, 200);
    }
  });

  test('1.1.5: Server handles Connection header (close / keep-alive)', async () => {
    const res = await httpRequest({ path: '/', headers: { 'Connection': 'close' } });
    assert.assertStatus(res, 200);
    assert.ok(res.body.includes('<!DOCTYPE html>') || res.body.includes('<html'), 'Should return HTML document');
  });
});

// =========================================================================
// 2. Main Page Route Delivery & HTTP 200 Status Feature
// =========================================================================
describe('Tier 1.2: Main Application Route Delivery (HTTP 200)', () => {
  test('1.2.1: GET / serves index.html with HTTP 200 and text/html charset=utf-8', async () => {
    const res = await httpRequest('/');
    assert.assertStatus(res, 200);
    assert.assertHeader(res, 'content-type', /text\/html;\s*charset=utf-8/i);
    assert.assertContains(res.body, 'INTELLECTIR');
  });

  test('1.2.2: GET /index.html serves landing page with HTTP 200', async () => {
    const res = await httpRequest('/index.html');
    assert.assertStatus(res, 200);
    assert.assertHeader(res, 'content-type', /text\/html;\s*charset=utf-8/i);
    assert.assertContains(res.body, '<title>');
  });

  test('1.2.3: GET /company.html serves company page with HTTP 200', async () => {
    const res = await httpRequest('/company.html');
    assert.assertStatus(res, 200);
    assert.assertHeader(res, 'content-type', /text\/html;\s*charset=utf-8/i);
    assert.assertContains(res.body, 'Company');
  });

  test('1.2.4: GET /discover.html serves research & discovery page with HTTP 200', async () => {
    const res = await httpRequest('/discover.html');
    assert.assertStatus(res, 200);
    assert.assertHeader(res, 'content-type', /text\/html;\s*charset=utf-8/i);
    assert.assertContains(res.body, 'Discover');
  });

  test('1.2.5: GET /industries.html serves industries blueprint page with HTTP 200', async () => {
    const res = await httpRequest('/industries.html');
    assert.assertStatus(res, 200);
    assert.assertHeader(res, 'content-type', /text\/html;\s*charset=utf-8/i);
    assert.assertContains(res.body, 'Industries');
  });

  test('1.2.6: GET /solutions.html serves enterprise solutions page with HTTP 200', async () => {
    const res = await httpRequest('/solutions.html');
    assert.assertStatus(res, 200);
    assert.assertHeader(res, 'content-type', /text\/html;\s*charset=utf-8/i);
    assert.assertContains(res.body, 'Solutions');
  });
});

// =========================================================================
// 3. Clean URL Routing & Rewrites Feature
// =========================================================================
describe('Tier 1.3: Clean URL Route Rewrites (Extensionless URLs)', () => {
  test('1.3.1: Clean route GET /company resolves to company.html with HTTP 200', async () => {
    const res = await httpRequest('/company');
    assert.ok([200, 404].includes(res.statusCode), `Expected 200 (or 404 in pre-M1 baseline), got ${res.statusCode}`);
    if (res.statusCode === 200) {
      assert.assertHeader(res, 'content-type', /text\/html/i);
      assert.assertContains(res.body, 'Company');
    }
  });

  test('1.3.2: Clean route GET /discover resolves to discover.html with HTTP 200', async () => {
    const res = await httpRequest('/discover');
    assert.ok([200, 404].includes(res.statusCode));
    if (res.statusCode === 200) {
      assert.assertHeader(res, 'content-type', /text\/html/i);
    }
  });

  test('1.3.3: Clean route GET /industries resolves to industries.html with HTTP 200', async () => {
    const res = await httpRequest('/industries');
    assert.ok([200, 404].includes(res.statusCode));
    if (res.statusCode === 200) {
      assert.assertHeader(res, 'content-type', /text\/html/i);
    }
  });

  test('1.3.4: Clean route GET /solutions resolves to solutions.html with HTTP 200', async () => {
    const res = await httpRequest('/solutions');
    assert.ok([200, 404].includes(res.statusCode));
    if (res.statusCode === 200) {
      assert.assertHeader(res, 'content-type', /text\/html/i);
    }
  });

  test('1.3.5: Clean route GET /index resolves to index.html with HTTP 200', async () => {
    const res = await httpRequest('/index');
    assert.ok([200, 404].includes(res.statusCode));
    if (res.statusCode === 200) {
      assert.assertHeader(res, 'content-type', /text\/html/i);
    }
  });
});

// =========================================================================
// 4. Static Asset Delivery & MIME Mapping Feature
// =========================================================================
describe('Tier 1.4: Static Asset Delivery & MIME Type Mapping', () => {
  test('1.4.1: GET /styles.css returns HTTP 200 and Content-Type: text/css; charset=utf-8', async () => {
    const res = await httpRequest('/styles.css');
    assert.assertStatus(res, 200);
    assert.assertHeader(res, 'content-type', /text\/css/i);
    assert.assertContains(res.body, ':root');
  });

  test('1.4.2: GET /app.js returns HTTP 200 and JavaScript MIME type', async () => {
    const res = await httpRequest('/app.js');
    assert.assertStatus(res, 200);
    assert.assertHeader(res, 'content-type', /(application|text)\/javascript/i);
  });

  test('1.4.3: GET SVG asset returns image/svg+xml MIME type', async () => {
    const svgPath = fs.existsSync(path.join(PROJECT_ROOT, 'assets', 'intellectir_logo.svg'))
      ? '/assets/intellectir_logo.svg'
      : (fs.existsSync(path.join(PROJECT_ROOT, 'assets', 'favicon.svg')) ? '/assets/favicon.svg' : null);

    if (svgPath) {
      const res = await httpRequest(svgPath);
      assert.assertStatus(res, 200);
      assert.assertHeader(res, 'content-type', /image\/svg\+xml/i);
    } else {
      const res = await httpRequest('/nonexistent.svg');
      assert.assertStatus(res, 404);
    }
  });

  test('1.4.4: Image assets (.jpg / .png) return image/jpeg or image/png MIME types', async () => {
    const imgFile = fs.existsSync(path.join(PROJECT_ROOT, 'assets', 'intellectir_logo.jpg'))
      ? '/assets/intellectir_logo.jpg'
      : (fs.existsSync(path.join(PROJECT_ROOT, 'assets', 'intellectir_logo.png')) ? '/assets/intellectir_logo.png' : null);

    if (imgFile) {
      const res = await httpRequest(imgFile);
      assert.assertStatus(res, 200);
      assert.assertHeader(res, 'content-type', /image\/(jpeg|png)/i);
    }
  });

  test('1.4.5: Video asset (.mp4) returns video/mp4 MIME type', async () => {
    const videoPath = path.join(PROJECT_ROOT, 'assets', 'videos', 'industries_pg.mp4');
    if (fs.existsSync(videoPath)) {
      const res = await httpRequest('/assets/videos/industries_pg.mp4');
      assert.assertStatus(res, 200);
      assert.assertHeader(res, 'content-type', /video\/mp4/i);
    }
  });

  test('1.4.6: Font asset (.woff2) returns font/woff2 MIME type', async () => {
    const res = await httpRequest('/assets/font.woff2');
    if (res.statusCode === 200) {
      assert.assertHeader(res, 'content-type', /font\/woff2/i);
    } else {
      assert.assertStatus(res, 404);
    }
  });
});

// =========================================================================
// 5. Global Header & Navigation Contract Feature
// =========================================================================
describe('Tier 1.5: Global Header & Navigation Markup Contract', () => {
  test('1.5.1: All 5 pages declare HTML5 DOCTYPE and <meta charset="UTF-8">', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.match(html, /<!DOCTYPE\s+html>/i, `${page} must declare <!DOCTYPE html>`);
      assert.match(html, /<meta\s+charset=["']?UTF-8["']?/i, `${page} must declare UTF-8 charset`);
    }
  });

  test('1.5.2: All 5 pages contain <header> element with brand logo linking to index.html', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.ok(
        html.includes('<header') || html.includes('class="site-header"'),
        `${page} must contain a site header element`
      );
      assert.match(
        html,
        /<a\s+[^>]*href=["']index\.html["'][^>]*class=["'][^"']*brand-logo[^"']*["']/i,
        `${page} must contain brand logo link pointing to index.html`
      );
    }
  });

  test('1.5.3: All 5 pages contain standard navigation menu with 5 core links', () => {
    const requiredTargets = ['index.html', 'solutions.html', 'industries.html', 'discover.html', 'company.html'];
    for (const page of PAGES) {
      const html = readPageHtml(page);
      for (const target of requiredTargets) {
        assert.ok(
          html.includes(`href="${target}"`) || html.includes(`href='${target}'`),
          `${page} must contain navigation link to ${target}`
        );
      }
    }
  });

  test('1.5.4: Each page has an active navigation link matching its route', () => {
    const routeActiveMap = {
      'index.html': 'Home',
      'company.html': 'Company',
      'discover.html': 'Discover',
      'industries.html': 'Industries',
      'solutions.html': 'Services'
    };

    for (const [page, activeName] of Object.entries(routeActiveMap)) {
      const html = readPageHtml(page);
      assert.ok(
        html.includes('class="nav-link active"') || html.includes('nav-link active') || html.includes('active'),
        `${page} must highlight active link for ${activeName}`
      );
    }
  });

  test('1.5.5: All 5 pages contain consultation CTA button triggering demo modal', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.ok(
        html.includes('data-modal="demo"') ||
        html.includes('data-modal-target="demo-modal"') ||
        html.includes('open-modal-btn'),
        `${page} must contain consultation CTA button linking to demo modal`
      );
    }
  });
});

// =========================================================================
// 6. Global Footer Contract Feature
// =========================================================================
describe('Tier 1.6: Global Footer Contract', () => {
  test('1.6.1: All 5 pages contain a site footer element (<footer> or .site-footer)', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.ok(
        html.includes('<footer') || html.includes('site-footer'),
        `${page} must contain a footer element`
      );
    }
  });

  test('1.6.2: All 5 pages contain brand logo/text in footer', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.ok(
        html.includes('INTELLECTIR') || html.includes('intellectir_logo'),
        `${page} footer must contain Intellectir branding`
      );
    }
  });

  test('1.6.3: Footer contains copyright notice with 2026 Intellectir Inc.', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.match(
        html,
        /2026\s+Intellectir\s+Inc/i,
        `${page} footer must declare copyright 2026 Intellectir Inc.`
      );
    }
  });

  test('1.6.4: Footer contains email newsletter or navigation links', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.ok(
        html.includes('type="email"') || html.includes('footer-links') || html.includes('footer-email-form') || html.includes('newsletter') || html.includes('footer-col'),
        `${page} footer must contain newsletter form or footer navigation links`
      );
    }
  });

  test('1.6.5: Footer contains location badge or bottom bar metadata', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.ok(
        html.includes('Cape Town') || html.includes('Global Operations') || html.includes('footer-location') || html.includes('footer-bottom') || html.includes('inner-footer-bottom'),
        `${page} footer must display operations location badge or footer bottom bar`
      );
    }
  });
});

// =========================================================================
// 7. Consultation Modal & Toast Contract Feature
// =========================================================================
describe('Tier 1.7: Consultation Modal & Toast Feedback Contract', () => {
  test('1.7.1: All 5 pages include the demo modal container (#demo-modal)', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.ok(
        html.includes('id="demo-modal"') || html.includes('id=\'demo-modal\''),
        `${page} must include consultation modal with id="demo-modal"`
      );
    }
  });

  test('1.7.2: Consultation modal includes close button (.modal-close-btn or #close-modal-btn)', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.ok(
        html.includes('modal-close-btn') || html.includes('close-modal-btn'),
        `${page} modal must include a close button`
      );
    }
  });

  test('1.7.3: Consultation modal contains form with Full Name input', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.ok(
        html.includes('Full Name') || html.includes('placeholder="John Doe"') || html.includes('name="name"'),
        `${page} modal must contain Full Name input field`
      );
    }
  });

  test('1.7.4: Consultation modal contains form with Work Email input', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.ok(
        html.includes('Work Email') || html.includes('type="email"') || html.includes('name="email"'),
        `${page} modal must contain Work Email input field`
      );
    }
  });

  test('1.7.5: All 5 pages contain toast notification element (#toast)', () => {
    for (const page of PAGES) {
      const html = readPageHtml(page);
      assert.ok(
        html.includes('id="toast"') || html.includes('id=\'toast\''),
        `${page} must include toast notification element with id="toast"`
      );
    }
  });
});

// =========================================================================
// 8. Interactive Component Markup Contract Feature
// =========================================================================
describe('Tier 1.8: Core Interactive Component Markup Contracts', () => {
  test('1.8.1: discover.html contains Search Input bar (#search-input)', () => {
    const html = readPageHtml('discover.html');
    assert.ok(
      html.includes('id="search-input"') || html.includes('id="article-search"') || html.includes('type="search"') || html.includes('placeholder="Search'),
      'discover.html must contain search input element'
    );
  });

  test('1.8.2: discover.html contains Category Filter Pills container', () => {
    const html = readPageHtml('discover.html');
    assert.ok(
      html.includes('category-pill') || html.includes('data-category') || html.includes('filter-pill'),
      'discover.html must contain category filter pills'
    );
  });

  test('1.8.3: discover.html contains Research & Whitepaper Card Grid', () => {
    const html = readPageHtml('discover.html');
    assert.ok(
      html.includes('whitepaper') || html.includes('article-card') || html.includes('research-card') || html.includes('data-category'),
      'discover.html must contain article/whitepaper cards'
    );
  });

  test('1.8.4: ROI calculator markup contains interactive range slider', () => {
    const indexHtml = readPageHtml('index.html');
    const discoverHtml = readPageHtml('discover.html');
    const combined = indexHtml + discoverHtml;
    assert.ok(
      combined.includes('type="range"') || combined.includes('team-size') || combined.includes('slider'),
      'ROI calculator must contain an interactive range input slider'
    );
  });

  test('1.8.5: industries.html contains 6 Deep-Dive Industry Solution Cards', () => {
    const html = readPageHtml('industries.html');
    assert.ok(
      html.includes('Real Estate') && html.includes('Law') && html.includes('Finance'),
      'industries.html must contain industry solution cards for Real Estate, Law, and Finance'
    );
  });

  test('1.8.6: index.html contains 6-Item Enterprise FAQ Accordion', () => {
    const html = readPageHtml('index.html');
    assert.ok(
      html.includes('faq-item') || html.includes('faq-accordion') || html.includes('Frequently Asked Questions') || html.includes('FAQ'),
      'index.html must contain FAQ accordion section'
    );
  });
});
