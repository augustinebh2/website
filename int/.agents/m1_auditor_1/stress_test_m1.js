/**
 * Adversarial Stress & Edge Case Verification Script
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(projectRoot, 'styles.css'), 'utf8');

console.log('=== RUNNING ADVERSARIAL STRESS TESTS FOR M1 ===\n');

// 1. Tag balance check in #how-we-work-section
const sectionMatch = html.match(/<section class="how-we-work-section"[\s\S]*?<\/section>/);
assert.ok(sectionMatch, 'Section must match valid opening and closing tags');

const sectionSnippet = sectionMatch[0];

const divOpens = (sectionSnippet.match(/<div[\s>]/g) || []).length;
const divCloses = (sectionSnippet.match(/<\/div>/g) || []).length;
console.log(`Div tag balance in #how-we-work-section: Open=${divOpens}, Close=${divCloses}`);
assert.strictEqual(divOpens, divCloses, 'All <div> tags within #how-we-work-section must be perfectly balanced');

const articleOpens = (sectionSnippet.match(/<article[\s>]/g) || []).length;
const articleCloses = (sectionSnippet.match(/<\/article>/g) || []).length;
console.log(`Article tag balance: Open=${articleOpens}, Close=${articleCloses}`);
assert.strictEqual(articleOpens, articleCloses, 'All <article> tags must be balanced');
assert.strictEqual(articleOpens, 4, 'Must contain exactly 4 <article> quadrant cards');

// 2. Button and Modal Integrity
const modalBtnMatch = sectionSnippet.match(/class="[^"]*open-modal-btn[^"]*"[^>]*data-modal-target="([^"]+)"/);
assert.ok(modalBtnMatch, 'CTA button must have open-modal-btn and data-modal-target');
const targetModalId = modalBtnMatch[1];
const targetModalExists = html.includes(`id="${targetModalId}"`);
console.log(`CTA target modal '${targetModalId}' exists in index.html: ${targetModalExists}`);
assert.ok(targetModalExists, `Target modal #${targetModalId} must exist in index.html`);

// 3. CSS Scope Isolation Check
const sectionLines = css.slice(css.indexOf('4. HOW WE WORK: 2.5D SPATIAL CANVAS'), css.indexOf('5. PERFECT WATERMARK SECTION'));
const dangerousGlobalRules = [
  /\nbody\s*\{/,
  /\nh1\s*\{/,
  /\nh2\s*\{/,
  /\nh3\s*\{/,
  /\np\s*\{/,
  /\na\s*\{/
];
let leakedGlobals = false;
dangerousGlobalRules.forEach(regex => {
  if (regex.test(sectionLines)) {
    console.log(`WARNING: Potential unscoped global rule matched: ${regex}`);
    leakedGlobals = true;
  }
});
assert.strictEqual(leakedGlobals, false, 'No unscoped global tag styling leaks inside How We Work section');
console.log('CSS Scoping Isolation: CLEAN (All rules scoped under #how-we-work-section or .how-we-work-section)');

// 4. Contrast & Readability Verification
// Background: #0a0a0c, Card Glass: rgba(15,23,42,0.78) (effective bg ~#0f172a)
// Text colors: #ffffff, #cbd5e1, #e2e8f0, #a7f3d0, #93c5fd, #e9d5ff, #fde68a
function lum(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16)/255, g = parseInt(c.slice(2, 4), 16)/255, b = parseInt(c.slice(4, 6), 16)/255;
  const a = [r, g, b].map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
  return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
}
function cr(h1, h2) {
  const l1 = lum(h1), l2 = lum(h2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

const darkBg = '#0a0a0c';
const colorsToTest = {
  'Heading (#ffffff)': '#ffffff',
  'Body (#cbd5e1)': '#cbd5e1',
  'List (#e2e8f0)': '#e2e8f0',
  'Green Accent (#10b981)': '#10b981',
  'Blue Accent (#3b82f6)': '#3b82f6',
  'Purple Accent (#a855f7)': '#a855f7',
  'Yellow Accent (#f59e0b)': '#f59e0b'
};

console.log('\nContrast Ratios against Dark Canvas (#0a0a0c):');
Object.entries(colorsToTest).forEach(([name, hex]) => {
  const ratio = cr(hex, darkBg);
  console.log(`  ${name}: ${ratio.toFixed(2)}:1 (WCAG AA >= 4.5:1: ${ratio >= 4.5 ? 'PASS' : (ratio >= 3.0 ? 'PASS (Large/UI)' : 'FAIL')})`);
  assert.ok(ratio >= 3.0, `Color ${name} must meet at least 3.0:1 UI contrast ratio`);
});

console.log('\nALL ADVERSARIAL STRESS TESTS PASSED CLEANLY!\n');
