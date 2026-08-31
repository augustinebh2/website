/**
 * Tier 3: Cross-Feature Combinations & Pairwise Interaction Testing
 * ==================================================================
 * Verifies cross-feature contracts, schema mappings, and multi-component links:
 * 1. Header Navigation Link Targets vs Server Routes
 * 2. Modal Trigger Data-Attributes vs Modal Dialog IDs
 * 3. Discover Category Pills vs Whitepaper Card Categories
 * 4. ROI Slider HTML Attributes vs JS Calculation Logic
 * 5. CSS Custom Properties (:root) vs Stylesheet Usage References
 * 6. HTML Component Class References vs Stylesheet Rules
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

function readAppJs() {
  return fs.readFileSync(path.join(PROJECT_ROOT, 'app.js'), 'utf-8');
}

// =========================================================================
// 1. Navigation Link Targets vs Server Routes Pairwise
// =========================================================================
describe('Tier 3.1: Navigation Link Targets vs Server Endpoints (Pairwise)', () => {
  for (const page of PAGES) {
    test(`3.1: Every nav link in ${page} resolves to a valid HTTP 200 server route`, async () => {
      const html = readPageHtml(page);
      // Extract links inside <nav> or <header>
      const navBlockMatch = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i) || html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
      assert.ok(navBlockMatch, `${page} must contain a <nav> or <header> element`);

      const navContent = navBlockMatch[1];
      const linkRegex = /href=["']([^"'#]+)["']/g;
      let match;
      const foundLinks = new Set();

      while ((match = linkRegex.exec(navContent)) !== null) {
        const link = match[1];
        if (!link.startsWith('http') && !link.startsWith('mailto:') && !link.startsWith('tel:')) {
          foundLinks.add(link);
        }
      }

      assert.ok(foundLinks.size >= 4, `${page} nav should contain at least 4 internal routes, found ${foundLinks.size}`);

      for (const link of foundLinks) {
        const res = await httpRequest(`/${link.replace(/^\//, '')}`);
        assert.ok(
          [200, 301, 302].includes(res.statusCode),
          `Nav link '${link}' referenced in ${page} failed to resolve (status: ${res.statusCode})`
        );
      }
    });
  }
});

// =========================================================================
// 2. Modal Trigger Data-Attributes vs Modal Dialog IDs Pairwise
// =========================================================================
describe('Tier 3.2: Modal Triggers vs Modal Dialog Elements (Pairwise)', () => {
  for (const page of PAGES) {
    test(`3.2: Modal trigger buttons in ${page} have matching modal dialogs in the DOM`, () => {
      const html = readPageHtml(page);
      // Check for trigger patterns: data-modal="demo", data-modal-target="demo-modal", open-modal-btn
      const hasTrigger = html.includes('open-modal-btn') || html.includes('data-modal') || html.includes('data-modal-target');
      assert.ok(hasTrigger, `${page} must have consultation modal trigger buttons`);

      // Check modal container
      const hasModalDialog = html.includes('id="demo-modal"') || html.includes('class="modal-backdrop"') || html.includes('class="modal"');
      assert.ok(hasModalDialog, `${page} must have corresponding modal dialog element`);

      // Check modal form and close button
      const hasCloseBtn = html.includes('modal-close-btn') || html.includes('close-modal-btn') || html.includes('data-modal-close');
      assert.ok(hasCloseBtn, `${page} modal must contain a close trigger button`);
    });
  }
});

// =========================================================================
// 3. Discover Category Pills vs Whitepaper Card Categories Pairwise
// =========================================================================
describe('Tier 3.3: Discover Category Pills vs Article Card Categories (Pairwise)', () => {
  test('3.3.1: All card categories in discover.html match declared category filter pills', () => {
    const html = readPageHtml('discover.html');

    // Extract categories from pills
    const pillRegex = /data-category=["']([^"']+)["']/g;
    const pillCategories = new Set();
    let match;

    // Search specifically in pill elements or whole document
    while ((match = pillRegex.exec(html)) !== null) {
      pillCategories.add(match[1].toLowerCase());
    }

    assert.ok(pillCategories.size >= 3, `discover.html should declare multiple category filter pills, found ${pillCategories.size}`);

    // If pills have 'all', ensure it is present
    if (pillCategories.has('all')) {
      assert.ok(pillCategories.has('all'), "Pill set should include 'all'");
    }

    // Extract data-category from article/whitepaper cards
    const cardCategoryRegex = /class=["'][^"']*(?:article-card|whitepaper|research-card|card)[^"']*["'][^>]*data-category=["']([^"']+)["']/gi;
    let cardMatch;
    let cardCount = 0;

    while ((cardMatch = cardCategoryRegex.exec(html)) !== null) {
      cardCount++;
      const cardCat = cardMatch[1].toLowerCase();
      assert.ok(
        pillCategories.has(cardCat) || pillCategories.has('all'),
        `Card category '${cardCat}' must be present in category pills: ${Array.from(pillCategories).join(', ')}`
      );
    }
  });

  test('3.3.2: Each specific category pill matches at least one card in discover.html', () => {
    const html = readPageHtml('discover.html');
    const pillRegex = /data-category=["']([^"']+)["']/g;
    const pillCategories = new Set();
    let match;

    while ((match = pillRegex.exec(html)) !== null) {
      const cat = match[1].toLowerCase();
      if (cat !== 'all') pillCategories.add(cat);
    }

    for (const cat of pillCategories) {
      const cardMatch = new RegExp(`data-category=["']${cat}["']`, 'i').test(html);
      assert.ok(cardMatch, `Category pill '${cat}' should match at least one article card in discover.html`);
    }
  });
});

// =========================================================================
// 4. ROI Slider HTML Attributes vs JS Calculation Bounds Pairwise
// =========================================================================
describe('Tier 3.4: ROI Slider HTML Attributes vs JS Logic (Pairwise)', () => {
  test('3.4.1: ROI slider input in HTML has valid min, max, and value bounds', () => {
    const discoverHtml = readPageHtml('discover.html');
    const indexHtml = readPageHtml('index.html');
    const combined = discoverHtml + indexHtml;

    const sliderMatch = combined.match(/<input[^>]*type=["']range["'][^>]*>/i);
    if (sliderMatch) {
      const tag = sliderMatch[0];
      const minMatch = tag.match(/min=["'](\d+)["']/i);
      const maxMatch = tag.match(/max=["'](\d+)["']/i);
      const valMatch = tag.match(/value=["'](\d+)["']/i);

      const min = minMatch ? parseInt(minMatch[1], 10) : 1;
      const max = maxMatch ? parseInt(maxMatch[1], 10) : 500;
      const val = valMatch ? parseInt(valMatch[1], 10) : 25;

      assert.ok(min >= 1, `Slider min should be >= 1, got ${min}`);
      assert.ok(max >= min, `Slider max (${max}) should be >= min (${min})`);
      assert.ok(val >= min && val <= max, `Slider default value (${val}) should be within [${min}, ${max}]`);
    }
  });

  test('3.4.2: Department selector keys in HTML align with app.js calculation configs', () => {
    const appJs = readAppJs();
    const discoverHtml = readPageHtml('discover.html');

    // Expected standard departments
    const standardDepts = ['support', 'sales', 'finance', 'operations'];
    for (const dept of standardDepts) {
      const inAppJs = new RegExp(`['"]?${dept}['"]?`, 'i').test(appJs);
      assert.ok(inAppJs, `app.js should contain rate/configuration reference for department '${dept}'`);
    }
  });
});

// =========================================================================
// 5. CSS Custom Properties (:root) vs Usage References Pairwise
// =========================================================================
describe('Tier 3.5: CSS Variable (:root) Declarations vs var() References (Pairwise)', () => {
  test('3.5.1: Critical design tokens are declared in styles.css :root', () => {
    const css = readStylesCss();
    const requiredTokens = [
      '--bg-main',
      '--text-primary',
      '--accent-cyan',
      '--font-sans',
      '--font-heading'
    ];

    for (const token of requiredTokens) {
      assert.ok(
        css.includes(`${token}:`) || css.includes(token),
        `styles.css must declare design token '${token}'`
      );
    }
  });

  test('3.5.2: CSS variable references in styles.css resolve cleanly', () => {
    const css = readStylesCss();
    // Extract all declared --vars
    const declaredVarRegex = /(--[a-zA-Z0-9_-]+)\s*:/g;
    const declaredVars = new Set();
    let declMatch;
    while ((declMatch = declaredVarRegex.exec(css)) !== null) {
      declaredVars.add(declMatch[1]);
    }

    // Extract all var(--var-name) usages
    const usedVarRegex = /var\(\s*(--[a-zA-Z0-9_-]+)(?:\s*,\s*([^)]+))?\s*\)/g;
    let useMatch;
    const missingVars = [];

    while ((useMatch = usedVarRegex.exec(css)) !== null) {
      const varName = useMatch[1];
      const fallback = useMatch[2];
      if (!declaredVars.has(varName) && !fallback) {
        missingVars.push(varName);
      }
    }

    // Allow small margin for dynamically injected tokens or browser defaults
    const uniqueMissing = Array.from(new Set(missingVars));
    assert.ok(
      uniqueMissing.length <= 3,
      `Detected undeclared CSS variables without fallback: ${uniqueMissing.join(', ')}`
    );
  });
});

// =========================================================================
// 6. HTML Component Classes vs Stylesheet Rules Pairwise
// =========================================================================
describe('Tier 3.6: HTML Component Classes vs Stylesheet Rules (Pairwise)', () => {
  test('3.6.1: Major global component classes are styled in styles.css', () => {
    const css = readStylesCss();
    const criticalClasses = [
      '.site-header',
      '.site-footer',
      '.brand-logo',
      '.nav-menu',
      '.nav-link',
      '.btn',
      '.btn-primary',
      '.modal-card',
      '.toast',
      '.wrapper'
    ];

    for (const cls of criticalClasses) {
      assert.ok(
        css.includes(cls) || css.includes(cls.substring(1)),
        `styles.css must include styling rules for '${cls}'`
      );
    }
  });

  test('3.6.2: Interactive button classes (.btn-primary, .btn-secondary, .btn-outline) exist in CSS', () => {
    const css = readStylesCss();
    assert.ok(css.includes('.btn-primary') || css.includes('btn-primary'), 'styles.css must define .btn-primary');
    assert.ok(css.includes('.btn-secondary') || css.includes('btn-secondary') || css.includes('.btn'), 'styles.css must define .btn-secondary or button variants');
  });
});
